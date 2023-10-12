/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import {WalletDriver} from "@/utils/wallet/WalletDriver"
import detectEthereumProvider from "@metamask/detect-provider";
import {MetaMaskInpageProvider} from "@metamask/providers";
import {NetworkEntry} from "@/schemas/NetworkRegistry";
import {AccountByAddressCache} from "@/utils/cache/AccountByAddressCache";
import {ContractResultByHashCache} from "@/utils/cache/ContractResultByHashCache";
import {TransactionByTsCache} from "@/utils/cache/TransactionByTsCache";
import {routeManager} from "@/router";
import {Transaction} from "@/schemas/HederaSchemas";
import {waitFor} from "@/utils/TimerUtils";
import {EntityID} from "@/utils/EntityID";
import {ethers} from "ethers";
import {TokenInfoCache} from "@/utils/cache/TokenInfoCache";
import {makeTokenSymbol} from "@/schemas/HederaUtils";
import {HederaLogo} from "@/utils/MetaMask";

/*
    References:
        https://docs.metamask.io/guide/ethereum-provider.html#table-of-contents
        https://github.com/MetaMask/metamask-extension
        https://github.com/MetaMask/metamask-extension/pull/4606
        https://github.com/estebanmino/EIPs/blob/master/EIPS/eip-747.md

 */

export class WalletDriver_Metamask extends WalletDriver {

    private provider: MetaMaskInpageProvider|null = null

    //
    // Public
    //

    public constructor() {
        super("Metamask", "https://freelogopng.com/images/all_img/1683020860metamask-logo-white.png")
    }

    //
    // WalletDriver
    //

    public async connect(network: string): Promise<string[]> {
        let result: string[]

        // Sanity check
        const networkEntry = routeManager.currentNetworkEntry.value
        if (networkEntry.name !== network) {
            throw this.connectFailure("Network inconsistency: bug")
        }

        const options = { mustBeMetaMask: true }
        const provider = (await detectEthereumProvider(options) ?? null) as MetaMaskInpageProvider|null
        if (provider !== null) {

            // Switch Metamask to network if needed
            await this.switchToNetwork(provider, networkEntry)

            // Collects account ids
            result = await this.fetchAccountIds(provider)
            if (result.length == 0) {
                // Did the user cancel connection from the wallet ?
                throw this.connectFailure("No account found")
            }

            this.provider = provider
            this.provider.once('chainChanged', this.handleDisconnect);
        } else {
            throw this.extensionNotFound()
        }

        return Promise.resolve(result)
    }

    public async disconnect(): Promise<void> {
        this.provider?.off("chainChanged", this.handleDisconnect)
        this.provider = null
    }

    public async associateToken(accountId: string, tokenId: string): Promise<string> {
        let result: string

        // https://stackoverflow.com/questions/76980638/how-do-you-associate-dissociate-an-hts-token-using-evm-transaction

        const tokenAddress = EntityID.parse(tokenId)?.toAddress() ?? null
        if (accountId !== null && tokenAddress !== null && this.provider !== null) {

            const abi = ["function associate()"]
            const web3provider = new ethers.providers.Web3Provider(this.provider as unknown as ethers.providers.ExternalProvider)
            const contract = new ethers.Contract(tokenAddress, abi, web3provider.getSigner())
            try {
                const transactionResult = await contract.associate();
                const hederaTransaction = await this.waitForTransactionSurfacing(transactionResult.hash)
                result = typeof hederaTransaction == "string" ? hederaTransaction : hederaTransaction.transaction_id
            } catch {
                throw this.callFailure("associateToken")
            }
        } else {
            throw this.callFailure("Invalid arguments")
        }

        return Promise.resolve(result)
    }

    public async dissociateToken(accountId: string, tokenId: string): Promise<string> {
        let result: string

        // https://stackoverflow.com/questions/76980638/how-do-you-associate-dissociate-an-hts-token-using-evm-transaction

        const tokenAddress = EntityID.parse(tokenId)?.toAddress() ?? null
        if (accountId !== null && tokenAddress !== null && this.provider !== null) {

            const abi = ["function dissociate()"];
            const web3provider = new ethers.providers.Web3Provider(this.provider as unknown as ethers.providers.ExternalProvider)
            const contract = new ethers.Contract(tokenAddress, abi, web3provider.getSigner())
            try {
                const transactionResult = await contract.dissociate();
                const hederaTransaction = await this.waitForTransactionSurfacing(transactionResult.hash)
                result = typeof hederaTransaction == "string" ? hederaTransaction : hederaTransaction.transaction_id
            } catch(reason) {
                console.log("reason=" + reason)
                throw this.callFailure("tokenDissociate")
            }
        } else {
            throw this.callFailure("Invalid arguments")
        }

        return Promise.resolve(result)
    }

    public async watchToken(accountId: string, tokenId: string): Promise<void> {
        const tokenAddress = EntityID.parse(tokenId)?.toAddress() ?? null
        if (accountId !== null && tokenAddress !== null && this.provider !== null) {
            const tokenInfo = await TokenInfoCache.instance.lookup(tokenId)
            const symbol = makeTokenSymbol(tokenInfo, 11)
            const decimals = tokenInfo?.decimals
            const requestParams = {
                method: "metamask_watchAsset",
                params: {
                    "type":"ERC20",
                    "options":{
                        "address": tokenAddress,
                        "symbol": symbol,
                        "decimals": decimals,
                        "image": HederaLogo
                    },
                },
            }
            await this.provider.request(requestParams)
        } else {
            throw this.callFailure("Invalid arguments")
        }
        return Promise.resolve()
    }

    public isConnected(): boolean {
        return this.provider !== null
    }

    //
    // Private
    //

    private readonly handleDisconnect = () => this.disconnect()

    private async switchToNetwork(provider: MetaMaskInpageProvider, networkEntry: NetworkEntry): Promise<void> {

        const chainId = networkEntry.sourcifySetup?.hexChainID()
        if (chainId == null) {
            throw this.connectFailure("Network " + networkEntry.name + " cannot be used with Metamask")
        }

        // Make sure that chainId is the current chain in Metamask
        const walletChainId = await provider.request({ method: 'eth_chainId' })
        if (walletChainId !== chainId) {
            try {
                // Try to switch
                await provider.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: chainId }],
                })
            } catch {
                throw this.connectFailure("Make sure that 'Hedera " + networkEntry.name + "' network is added to Metamask")
            }
        }
    }

    private async fetchAccountIds(provider: MetaMaskInpageProvider): Promise<string[]> {
        let result: string[] = []

        const response = await provider.request<string[]>({method: "eth_requestAccounts"})

        for (const address of response ?? []) {
            const accountInfo = address ? await AccountByAddressCache.instance.lookup(address) : null
            if (accountInfo?.account) {
                result.push(accountInfo.account)
            }
        }

        return Promise.resolve(result)
    }


    private async waitForTransactionSurfacing(ethereumHash: Buffer): Promise<Transaction | string> {
        let result: Promise<Transaction | string>

        const hash = ethers.utils.hexlify(ethereumHash)
        try {
            let counter = 10
            let transaction: Transaction|null = null
            while (counter > 0 && transaction === null) {
                await waitFor(3000)
                const contractInfo = await ContractResultByHashCache.instance.lookup(hash, true)
                if (contractInfo !== null) {
                    transaction = await TransactionByTsCache.instance.lookup(contractInfo.timestamp, true)
                } else {
                    transaction = null
                }
                counter -= 1
            }
            result = Promise.resolve(transaction ?? hash)
        } catch {
            result = Promise.resolve(hash)
        }

        return result
    }
}
