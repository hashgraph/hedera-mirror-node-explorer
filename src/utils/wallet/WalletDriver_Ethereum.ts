/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2024 Hedera Hashgraph, LLC
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
import {ethers} from "ethers";
import {WalletDriverCancelError, WalletDriverError} from "@/utils/wallet/WalletDriverError";
import {AccountByAddressCache} from "@/utils/cache/AccountByAddressCache";
import {ContractResultDetails, Transaction} from "@/schemas/MirrorNodeSchemas";
import {waitFor} from "@/utils/TimerUtils";
import {ContractResultByHashCache} from "@/utils/cache/ContractResultByHashCache";
import {TransactionByTsCache} from "@/utils/cache/TransactionByTsCache";
import {TokenInfoCache} from "@/utils/cache/TokenInfoCache";
import {makeTokenSymbol} from "@/schemas/MirrorNodeUtils.ts";
import {
    AddEthereumChainParameter,
    EIP1193Provider,
    eth_chainId,
    eth_isUnrecognizedChainId,
    eth_isUnsupportedMethod,
    eth_isUserReject,
    eth_requestAccounts,
    wallet_addEthereumChain,
    wallet_revokePermissions,
    wallet_switchEthereumChain,
    wallet_watchAsset,
    WatchAssetParameters
} from "@/utils/wallet/eip1193";
import {EIP6963Agent} from "@/utils/wallet/EIP6963Agent";
import {AccountByIdCache} from "@/utils/cache/AccountByIdCache";
import {ContractByIdCache} from "@/utils/cache/ContractByIdCache";

export abstract class WalletDriver_Ethereum extends WalletDriver {

    protected providerDN: string

    //
    // Public
    //

    public async watchToken(accountId: string, tokenId: string, serialNumber?: string): Promise<void> {
        const tokenAddress = EntityID.parse(tokenId)?.toAddress() ?? null
        if (accountId !== null && tokenAddress !== null) {
            const tokenInfo = await TokenInfoCache.instance.lookup(tokenId)
            const symbol = makeTokenSymbol(tokenInfo, 11)
            let params: WatchAssetParameters

            if (serialNumber) {
                params = {
                    "type": "ERC721",
                    "options": {
                        "address": `0x${tokenAddress}`,
                        "symbol": symbol,
                        "tokenId": serialNumber,
                        "image": HederaLogo
                    }
                }
            } else {
                params = {
                    "type": "ERC20",
                    "options": {
                        "address": `0x${tokenAddress}`,
                        "symbol": symbol,
                        "decimals": tokenInfo?.decimals ? Number(tokenInfo?.decimals) : 0,
                        "image": HederaLogo
                    }
                }
            }

            try {
                await wallet_watchAsset(this.fetchProvider(), params)
            } catch (reason) {
                throw this.makeCallFailure(reason, `${(reason as ethers.EthersError).error?.message || `Unknown Error`}.`)
            }
        } else {
            throw this.callFailure("Invalid arguments")
        }
        return Promise.resolve()
    }

    //
    // WalletDriver
    //

    public async connect(network: string): Promise<string[]> {

        // Sanity check
        const networkEntry = routeManager.currentNetworkEntry.value
        if (networkEntry.name !== network) {
            throw this.connectFailure("Network inconsistency: bug")
        }

        // Collects account ids
        const result = await this.fetchAccountIds()
        if (result.length == 0) {
            // Did the user cancel connection from the wallet ?
            throw this.connectFailure("No account found")
        }

        return Promise.resolve(result)
    }

    public async disconnect(): Promise<void> {
        const provider = this.fetchProvider()

        // Tries calling wallet_revokePermissions() method
        // This one is not supported by Coinbase => in that case, we hide the exception
        try {
            await wallet_revokePermissions(provider)
        } catch(reason) {
            if (eth_isUnsupportedMethod(reason)) {
                // See above
            } else {
                throw reason
            }
        }
    }

    public async associateToken(accountId: string, tokenId: string): Promise<string> {
        const abi = ["function associate()"]
        const iface = new ethers.Interface(abi)
        const callData = iface.encodeFunctionData("associate", [])
        const result = await this.executeCall(accountId, tokenId, callData)
        return Promise.resolve(result)
    }

    public async dissociateToken(accountId: string, tokenId: string): Promise<string> {
        const abi = ["function dissociate()"];
        const iface = new ethers.Interface(abi)
        const callData = iface.encodeFunctionData("dissociate", [])
        const result = await this.executeCall(accountId, tokenId, callData)
        return Promise.resolve(result)
    }

    public async callContract(contractId: string, callData: string, accountId: string): Promise<ContractResultDetails | string> {
        let result: ContractResultDetails | string

        const accountAddress = await AccountByIdCache.instance.findAccountAddress(accountId)
        const contractAddress = await ContractByIdCache.instance.findContractAddress(contractId)
        if (accountAddress !== null && contractAddress !== null) {
            // 1) Checks current chain and tries to setup if needed
            if (!await this.isChainOK()) {
                await this.trySetupChain()
            }
            // 2) Sends transaction
            try {
                result = await this.sendTransaction(accountAddress, "0x" + contractAddress, callData)
            } catch (reason) {
                if (eth_isUserReject(reason)) {
                    throw new WalletDriverCancelError()
                } else {
                    throw reason
                }
            }
            // 3) Waits for transaction to appear in mirror node
            try {
                result = await this.waitForContractResultSurfacing(result)
            } catch {
                // Accurately ignored
            }

        } else {
            throw this.callFailure("Invalid arguments")
        }

        return result
    }


    //
    // Private
    //

    protected constructor(name: string, logoURL: string | null, iconURL: string | null, providerDN: string) {
        super(name, logoURL, iconURL)
        this.providerDN = providerDN
    }

    //
    // Private
    //


    private makeCallFailure(reason: unknown, extra: string): WalletDriverError {
        if (eth_isUserReject(reason)) {
            throw new WalletDriverCancelError()
        } else {
            console.log("WalletDriver_Ethereum.makeCallFailure: " + JSON.stringify(reason))
            const providerError = (reason as ethers.EthersError).error
            throw this.callFailure(providerError?.message ?? extra)
        }
    }

    private async fetchAccountIds(): Promise<string[]> {
        const result: string[] = []

        const provider = this.fetchProvider()

        try {

            // Requests accounts
            const accountResponse = await eth_requestAccounts(provider)

            // Fetches info for each return accounts
            for (const address of accountResponse ?? []) {
                const accountInfo = address ? await AccountByAddressCache.instance.lookup(address) : null
                if (accountInfo?.account) {
                    result.push(accountInfo.account)
                }
            }
        } catch (reason) {
            if (eth_isUserReject(reason)) {
                throw new WalletDriverCancelError()
            } else {
                throw this.connectFailure("Check " + this.name + " extension for details")
            }
        }

        return Promise.resolve(result)
    }


    private async waitForTransactionSurfacing(ethereumHash: ethers.BytesLike): Promise<Transaction | string> {
        let result: Promise<Transaction | string>

        const hash = ethers.hexlify(ethereumHash)
        try {
            let counter = 10
            let transaction: Transaction | null = null
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


    private async waitForContractResultSurfacing(ethereumHash: ethers.BytesLike): Promise<ContractResultDetails | string> {
        let result: Promise<ContractResultDetails | string>

        const hash = ethers.hexlify(ethereumHash)
        try {
            let counter = 10
            let contractResult: ContractResultDetails | null = null
            while (counter > 0 && contractResult === null) {
                await waitFor(3000)
                contractResult = await ContractResultByHashCache.instance.lookup(hash, true)
                counter -= 1
            }
            result = Promise.resolve(contractResult ?? hash)
        } catch {
            result = Promise.resolve(hash)
        }

        return result
    }

    private fetchProvider(): EIP1193Provider {
        const p = EIP6963Agent.instance.findProviderDetails(this.providerDN)
        if (p == null) {
            throw this.extensionNotFound()
        }
        return p.provider
    }

    private async executeCall(accountId: string, tokenId: string, callData: string): Promise<string> {
        let result: string

        const accountAddress = await AccountByIdCache.instance.findAccountAddress(accountId)
        const tokenAddress = EntityID.parse(tokenId)?.toAddress() ?? null
        if (accountAddress !== null && tokenAddress !== null) {
            // 1) Checks current chain and tries to setup if needed
            if (!await this.isChainOK()) {
                await this.trySetupChain()
            }
            // 2) Sends transaction
            try {
                result = await this.sendTransaction(accountAddress, "0x" + tokenAddress, callData)
            } catch (reason) {
                if (eth_isUserReject(reason)) {
                    throw new WalletDriverCancelError()
                } else {
                    throw reason
                }
            }
            // 3) Waits for transaction to appear in mirror node
            try {
                await this.waitForTransactionSurfacing(result)
            } catch {
                // Accurately ignored
            }

        } else {
            throw this.callFailure("Invalid arguments")
        }

        return result
    }

    private async sendTransaction(fromAddress: string, toAddress: string, callData: string): Promise<string> {
        const ethParams = {
            from: fromAddress,
            to: toAddress,
            data: callData,
            gas: "0x1E8480", // 2_000_000
            gasPrice: "0x1D1A94A2000" // 2_000_000_000_000
        }
        const request = {
            method: "eth_sendTransaction",
            params: [ethParams]
        }
        return await this.fetchProvider().request(request) as string
    }

    private async trySetupChain(): Promise<void> {

        try {
            await this.trySwitchingChain()
            if (!await this.isChainOK()) {
                await this.tryAddingChain()
            }
        } catch(reason) {
            if (eth_isUserReject(reason)) {
                throw new WalletDriverCancelError()
            // } else if (eth_isUnsupportedMethod(reason)) {
            //     throw new WalletClientSetupRequiredError()
            } else {
                throw reason
            }
        }
        if (!await this.isChainOK()) {
            throw this.networkSetupFailure(routeManager.currentNetwork.value)
        }
    }


    private targetChainId(): string {
        const result = networkToChainId(routeManager.currentNetwork.value)
        if (result === null) {
            throw "bug"
        }
        return result
    }


    private async isChainOK(): Promise<boolean> {
        const currentChainId = await eth_chainId(this.fetchProvider())
        return this.targetChainId() == currentChainId
    }

    private async trySwitchingChain(): Promise<void> {
        try {
            await wallet_switchEthereumChain(this.fetchProvider(), this.targetChainId())
        } catch(reason) {
            if (!eth_isUnsupportedMethod(reason) && !eth_isUnrecognizedChainId(reason)) {
                throw reason
            }
        }
    }

    private async tryAddingChain(): Promise<void> {
        const chainParam = this.makeChainParam()
        if (chainParam !== null) {
            await wallet_addEthereumChain(this.fetchProvider(), chainParam)
        } else {
            throw "bug"
        }
    }

    private makeChainParam(): AddEthereumChainParameter|null {
        let result: AddEthereumChainParameter|null

        switch(routeManager.currentNetwork.value) {
            case "mainnet":
                result = CHAIN_PARAM_MAINNET
                break
            case "testnet":
                result = CHAIN_PARAM_TESTNET
                break
            case "previewnet":
                result = CHAIN_PARAM_PREVIEWNET
                break
            default:
                result = null
                break
        }
        return result
    }

    private networkSetupFailure(network: string): WalletDriverError {
        const extra = "Make sure that 'Hedera " + network + "' network is added to " + this.name
        return this.connectFailure(extra)
    }

}


const HEDERA_LOGO =
    'data:image/svg+xml;utf8,<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">' +
    '<path d="M20 0a20 20 0 1 0 20 20A20 20 0 0 0 20 0" fill="black"></path>' +
    '<path d="M28.13 28.65h-2.54v-5.4H14.41v5.4h-2.54V11.14h2.54v5.27h11.18v-5.27h2.54zm-13.6-7.42h11.18v-2.79H14.53z" fill="white"></path>' +
    '</svg>'


const NATIVE_CURRENCY = {
    name: 'HBAR',
    decimals: 18,
    symbol: 'HBAR'
}

const CHAIN_PARAM_MAINNET: AddEthereumChainParameter = {
    chainId: "0x127",
    blockExplorerUrls: [ "https://hashscan.io/mainnet/dashboard" ],
    chainName: "Hedera Mainnet",
    iconUrls: [ HEDERA_LOGO ],
    nativeCurrency: NATIVE_CURRENCY,
    rpcUrls: [ "https://mainnet.hashio.io/api" ]
}

const CHAIN_PARAM_TESTNET: AddEthereumChainParameter = {
    chainId: "0x128",
    blockExplorerUrls: [ "https://hashscan.io/testnet/dashboard" ],
    chainName: "Hedera Testnet",
    iconUrls: [ HEDERA_LOGO ],
    nativeCurrency: NATIVE_CURRENCY,
    rpcUrls: [ "https://testnet.hashio.io/api" ]
}

const CHAIN_PARAM_PREVIEWNET: AddEthereumChainParameter = {
    chainId: "0x129",
    blockExplorerUrls: [ "https://hashscan.io/previewnet/dashboard" ],
    chainName: "Hedera Previewnet",
    iconUrls: [ HEDERA_LOGO ],
    nativeCurrency: NATIVE_CURRENCY,
    rpcUrls: [ "https://previewnet.hashio.io/api" ]
}

function networkToChainId(network: string): string|null {
    let result: string|null
    // https://docs.hedera.com/hedera/core-concepts/smart-contracts/deploying-smart-contracts/json-rpc-relay
    switch(network) {
        case "mainnet":
            result = "0x127"
            break
        case "testnet":
            result = "0x128"
            break
        case "previewnet":
            result = "0x129"
            break
        default:
            result = null
            break
    }
    return result
}
