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

import {
    WalletClient,
    WalletClientRejectError,
    WalletClientSetupRequiredError
} from "@/utils/wallet/client/WalletClient";
import {ContractResultDetails, Transaction} from "@/schemas/MirrorNodeSchemas";
import {AccountByIdCache} from "@/utils/cache/AccountByIdCache";
import {EntityID} from "@/utils/EntityID";
import {ethers} from "ethers";
import {
    AddEthereumChainParameter,
    eth_chainId,
    eth_isUnrecognizedChainId,
    eth_isUnsupportedMethod,
    eth_isUserReject,
    wallet_addEthereumChain,
    wallet_switchEthereumChain
} from "@/utils/wallet/eip1193";
import {TokenInfoCache} from "@/utils/cache/TokenInfoCache";
import {makeTokenSymbol} from "@/schemas/MirrorNodeUtils";
import {waitFor} from "@/utils/TimerUtils";
import {ContractResultByHashCache} from "@/utils/cache/ContractResultByHashCache.ts";
import {TransactionByTsCache} from "@/utils/cache/TransactionByTsCache.ts";


export class WalletClient_Ethereum extends WalletClient {


    //
    // Public
    //

    public async watchToken(tokenId: string, serialNumber?: string): Promise<void> {
        const tokenAddress = EntityID.parse(tokenId)?.toAddress() ?? null
        if (tokenAddress !== null) {
            const tokenInfo = await TokenInfoCache.instance.lookup(tokenId)
            const symbol = makeTokenSymbol(tokenInfo, 11)
            let params = {}

            if (serialNumber) {
                params = {
                    "type": "ERC721",
                    "options": {
                        "address": `0x${tokenAddress}`,
                        "symbol": symbol,
                        "tokenId": serialNumber,
                        "image": HEDERA_LOGO
                    }
                }
            } else {
                params = {
                    "type": "ERC20",
                    "options": {
                        "address": `0x${tokenAddress}`,
                        "symbol": symbol,
                        "decimals": tokenInfo?.decimals,
                        "image": HEDERA_LOGO
                    }
                }
            }

            return new Promise<void>((resolve, reject) => {
                if (this.provider.send) {
                    const cb = (error: (Error | null)/* , response: unknown*/) => {
                        if (error === null) {
                            resolve()
                        } else {
                            reject(error)
                        }
                    }
                    this.provider.send({
                        method: "wallet_watchAsset",
                        params: params
                    }, cb)

                } else {
                    reject("Provider does not support send() method")
                }
            })
        } else {
            throw "bug"
        }
    }



    //
    // WalletSession
    //

    public async associateToken(tokenId: string): Promise<string> {
        const abi = ["function associate()"]
        const iface = new ethers.Interface(abi)
        const callData = iface.encodeFunctionData("associate", [])
        const result = await this.executeCall(tokenId, callData)
        return Promise.resolve(result)
    }

    public async dissociateToken(tokenId: string): Promise<string> {
        const abi = ["function dissociate()"]
        const iface = new ethers.Interface(abi)
        const callData = iface.encodeFunctionData("dissociate", [])
        const result = await this.executeCall(tokenId, callData)
        return Promise.resolve(result)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async callContract(contractId: string, functionData: string): Promise<ContractResultDetails | string> {
        throw "to be implemented"
    }

    //
    // Private
    //

    private async executeCall(targetId: string, callData: string): Promise<string> {
        let result: string

        const accountAddress = await AccountByIdCache.instance.findAccountAddress(this.accountId)
        const tokenAddress = EntityID.parse(targetId)?.toAddress() ?? null
        if (accountAddress !== null && tokenAddress !== null) {
            // 1) Checks current chain and tries to setup if needed
            try {
                if (!await this.isChainOK()) {
                    await this.trySetupChain()
                }
            } catch(error) {
                // Let's go forward and try the remaining steps… :/
            }
            // 1.1) Estimate gas
            try {
                const gas = await this.estimateGas(accountAddress, "0x" + tokenAddress, callData)
                console.log("gas = " + gas)
            } catch(reason) {
                console.log("failed to estimate gas = " + JSON.stringify(reason))
            }
            // 2) Sends transaction
            let ethHash: string
            try {
                ethHash = await this.sendTransaction(accountAddress, "0x" + tokenAddress, callData)
            } catch (reason) {
                if (eth_isUserReject(reason)) {
                    throw new WalletClientRejectError()
                } else {
                    throw reason
                }
            }
            // 3) Waits for transaction to appear in mirror node
            try {
                const transaction = await this.waitForTransactionSurfacing(ethHash)
                result = typeof transaction === "object" ? transaction.transaction_id : ethHash
            } catch {
                result = ethHash
            }

        } else {
            throw "bug"
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
        return await this.provider.request(request) as string
    }

    private async estimateGas(fromAddress: string, toAddress: string, callData: string): Promise<string> {
        const ethParams = {
            from: fromAddress,
            to: toAddress,
            data: callData,
        }
        const request = {
            method: "eth_estimateGas",
            params: [ethParams]
        }
        return await this.provider.request(request) as string
    }

    private async trySetupChain(): Promise<void> {

        try {
            await this.trySwitchingChain()
            if (!await this.isChainOK()) {
                await this.tryAddingChain()
            }
        } catch(reason) {
            if (eth_isUserReject(reason)) {
                throw new WalletClientRejectError()
            } else if (eth_isUnsupportedMethod(reason)) {
                throw new WalletClientSetupRequiredError()
            } else {
                throw reason
            }
        }
        if (!await this.isChainOK()) {
            throw new WalletClientSetupRequiredError()
        }
    }

    private targetChainId(): string {
        const result = networkToChainId(this.network)
        if (result === null) {
            throw "bug"
        }
        return result
    }

    private async isChainOK(): Promise<boolean> {
        const currentChainId = await eth_chainId(this.provider)
        return this.targetChainId() == currentChainId
    }

    private async trySwitchingChain(): Promise<void> {
        try {
            await wallet_switchEthereumChain(this.provider, this.targetChainId())
        } catch(reason) {
            if (!eth_isUnsupportedMethod(reason) && !eth_isUnrecognizedChainId(reason)) {
                throw reason
            }
        }
    }

    private async tryAddingChain(): Promise<void> {
        const chainParam = this.makeChainParam()
        if (chainParam !== null) {
            await wallet_addEthereumChain(this.provider, chainParam)
        } else {
            throw "bug"
        }
    }

    private makeChainParam(): AddEthereumChainParameter|null {
        let result: AddEthereumChainParameter|null

        switch(this.network) {
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


    private async waitForTransactionSurfacing(transactionHash: string): Promise<Transaction | string> {
        let result: Transaction | string

        try {

            await waitFor(500) // Optimistic wait
            let contractResult = await ContractResultByHashCache.instance.lookup(transactionHash, true)

            let counter = 20
            while (contractResult === null && counter > 0) {
                await waitFor(3000)
                contractResult = await ContractResultByHashCache.instance.lookup(transactionHash, true)
                counter -= 1
            }
            if (contractResult !== null) {
                result = await TransactionByTsCache.instance.lookup(contractResult.timestamp, true) ?? transactionHash
            } else {
                result = transactionHash
            }
        } catch {
            result = transactionHash
        }

        return Promise.resolve(result)
    }

}

export function networkToChainId(network: string, hex: boolean = true): string|null {
    let result: number|null
    // https://docs.hedera.com/hedera/core-concepts/smart-contracts/deploying-smart-contracts/json-rpc-relay
    switch(network) {
        case "mainnet":
            result = 295
            break
        case "testnet":
            result = 296
            break
        case "previewnet":
            result = 297
            break
        default:
            result = null
            break
    }
    return result !== null ? result.toString(hex ? 16 : 10) : null
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
    blockExplorerUrls: [
        "https://hashscan.io/mainnet/dashboard"
    ],
    chainName: "Hedera Mainnet",
    iconUrls: [
        HEDERA_LOGO
    ],
    nativeCurrency: NATIVE_CURRENCY,
    rpcUrls: [
        "https://mainnet.hashio.io/api"
    ]
}

const CHAIN_PARAM_TESTNET: AddEthereumChainParameter = {
    chainId: "0x128",
    blockExplorerUrls: [
        "https://hashscan.io/testnet/dashboard"
    ],
    chainName: "Hedera Testnet",
    iconUrls: [
        HEDERA_LOGO
    ],
    nativeCurrency: NATIVE_CURRENCY,
    rpcUrls: [
        "https://testnet.hashio.io/api"
    ]
}

const CHAIN_PARAM_PREVIEWNET: AddEthereumChainParameter = {
    chainId: "0x129",
    blockExplorerUrls: [
        "https://hashscan.io/previewnet/dashboard"
    ],
    chainName: "Hedera Previewnet",
    iconUrls: [
        HEDERA_LOGO
    ],
    nativeCurrency: NATIVE_CURRENCY,
    rpcUrls: [
        "https://previewnet.hashio.io/api"
    ]
}

