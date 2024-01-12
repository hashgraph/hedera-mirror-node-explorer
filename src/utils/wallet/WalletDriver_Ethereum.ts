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

import {HederaLogo, WalletDriver} from "@/utils/wallet/WalletDriver";
import {routeManager} from "@/router";
import {EntityID} from "@/utils/EntityID";
import {BrowserProvider, ethers} from "ethers";
import {NetworkEntry} from "@/schemas/NetworkRegistry";
import {WalletDriverCancelError, WalletDriverError} from "@/utils/wallet/WalletDriverError";
import {AccountByAddressCache} from "@/utils/cache/AccountByAddressCache";
import {Transaction} from "@/schemas/HederaSchemas";
import {waitFor} from "@/utils/TimerUtils";
import {ContractResultByHashCache} from "@/utils/cache/ContractResultByHashCache";
import {TransactionByTsCache} from "@/utils/cache/TransactionByTsCache";
import {markRaw} from "vue";
import {TokenInfoCache} from "@/utils/cache/TokenInfoCache";
import {makeTokenSymbol} from "@/schemas/HederaUtils";

export abstract class WalletDriver_Ethereum extends WalletDriver {

    protected provider: BrowserProvider|null = null

    //
    // Public
    //

    public async watchToken(accountId: string, tokenId: string): Promise<void> {
        const tokenAddress = EntityID.parse(tokenId)?.toAddress() ?? null
        if (accountId !== null && tokenAddress !== null && this.provider !== null) {
            const tokenInfo = await TokenInfoCache.instance.lookup(tokenId)
            const symbol = makeTokenSymbol(tokenInfo, 11)
            const decimals = tokenInfo?.decimals
            const params = {
                "type": "ERC20",
                "options": {
                    "address": `0x${tokenAddress}`,
                    "symbol": symbol,
                    "decimals": decimals,
                    "image": HederaLogo
                }
            }
            try {
                await this.provider.send("wallet_watchAsset", params)
            } catch(reason) {
                throw this.makeCallFailure(reason, "watchToken")
            }
        } else {
            throw this.callFailure("Invalid arguments")
        }
        return Promise.resolve()
    }

    //
    // Public (to be subclassed)
    //

    public async makeProvider(): Promise<BrowserProvider|null> {
        throw this.toBeImplemented("makeProvider()")
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

        const provider = await this.makeProvider()
        if (provider !== null) {

            // Switch wallet to network if needed
            await this.switchToNetwork(provider, networkEntry)

            // Collects account ids
            result = await this.fetchAccountIds(provider)
            if (result.length == 0) {
                // Did the user cancel connection from the wallet ?
                throw this.connectFailure("No account found")
            }

            this.provider = markRaw(provider)
            // await this.provider.once('chainChanged', this.handleDisconnect);
        } else {
            throw this.extensionNotFound()
        }

        return Promise.resolve(result)
    }

    public async disconnect(): Promise<void> {
        // this.provider?.off("chainChanged", this.handleDisconnect)
        this.provider = null
    }

    public async associateToken(accountId: string, tokenId: string): Promise<string> {
        let result: string

        // https://stackoverflow.com/questions/76980638/how-do-you-associate-dissociate-an-hts-token-using-evm-transaction

        const tokenAddress = EntityID.parse(tokenId)?.toAddress() ?? null
        if (accountId !== null && tokenAddress !== null && this.provider !== null) {

            const abi = ["function associate()"]
            const signer = await this.provider.getSigner()
            const contract = new ethers.Contract("0x" + tokenAddress, abi, signer)
            try {
                const transactionResult = await contract.associate();
                const hederaTransaction = await this.waitForTransactionSurfacing(transactionResult.hash)
                result = typeof hederaTransaction == "string" ? hederaTransaction : hederaTransaction.transaction_id
            } catch(reason) {
                throw this.makeCallFailure(reason, "associateToken")
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
            const signer = await this.provider.getSigner()
            const contract = new ethers.Contract("0x" + tokenAddress, abi, signer)
            try {
                const transactionResult = await contract.dissociate();
                const hederaTransaction = await this.waitForTransactionSurfacing(transactionResult.hash)
                result = typeof hederaTransaction == "string" ? hederaTransaction : hederaTransaction.transaction_id
            } catch(reason) {
                throw this.makeCallFailure(reason, "dissociateToken")
            }
        } else {
            throw this.callFailure("Invalid arguments")
        }

        return Promise.resolve(result)
    }

    public isConnected(): boolean {
        return this.provider !== null
    }

    //
    // Protected (for subclasses usage)
    //

    protected makeCallFailure(reason: unknown, extra: string): WalletDriverError {
        if (this.isCancelError(reason)) {
            throw new WalletDriverCancelError()
        } else {
            throw this.callFailure(extra)
        }
    }

    protected isCancelError(reason: unknown): boolean {
        return (reason as ethers.EthersError).code == "ACTION_REJECTED"
    }


    //
    // Private
    //

    private async switchToNetwork(provider: BrowserProvider, networkEntry: NetworkEntry): Promise<void> {

        const chainId = networkEntry.sourcifySetup?.hexChainID()
        if (chainId == null) {
            throw this.connectFailure("Network " + networkEntry.name + " is not setup for use with wallet")
        }

        // Make sure that chainId is the current chain in Metamask
        const walletChainId = await provider.send('eth_chainId', [])
        if (walletChainId !== chainId) {
            try {
                // Try to switch
                await provider.send("wallet_switchEthereumChain", [{ chainId: chainId }])
            } catch(reason) {
                if (this.isCancelError(reason)) {
                    throw new WalletDriverCancelError()
                } else {
                    throw this.connectFailure("Make sure that 'Hedera " + networkEntry.name + "' network is added to " + this.name)
                }
            }
        }
    }

    private async fetchAccountIds(provider: BrowserProvider): Promise<string[]> {
        let result: string[] = []

        try {
            // We do this in two steps:
            //  1) wallet_requestPermissions first : this forces wallet to interact with user
            //  2) eth_requestAccounts to get accounts chosen by user
            // See reference discussion here:
            //  https://github.com/MetaMask/metamask-extension/issues/8990#issuecomment-980489771

            // 1)
            await provider.send("wallet_requestPermissions", [ { eth_accounts: {} } ])

            // 2)
            const accountResponse = await provider.send("eth_requestAccounts", [])

            // Fetches info for each return accounts
            for (const address of accountResponse ?? []) {
                const accountInfo = address ? await AccountByAddressCache.instance.lookup(address) : null
                if (accountInfo?.account) {
                    result.push(accountInfo.account)
                }
            }
        } catch(reason) {
            if (this.isCancelError(reason)) {
                throw new WalletDriverCancelError()
            } else {
                throw this.connectFailure("Check " + this.name + " extension for details")
            }
        }

        return Promise.resolve(result)
    }


    private async waitForTransactionSurfacing(ethereumHash: Buffer): Promise<Transaction | string> {
        let result: Promise<Transaction | string>

        const hash = ethers.hexlify(ethereumHash)
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
