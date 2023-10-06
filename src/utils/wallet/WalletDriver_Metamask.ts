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
import {routeManager} from "@/router";

export class WalletDriver_Metamask extends WalletDriver {

    private provider: MetaMaskInpageProvider|null = null
    private network: string|null = null
    private accountId: string|null = null

    //
    // Public
    //

    public constructor() {
        super("Metamask", "https://freelogopng.com/images/all_img/1683020860metamask-logo-white.png")
    }

    //
    // WalletDriver
    //

    public async connect(network: string): Promise<void> {

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
            const accountIds = await this.fetchAccountIds(provider)
            if (accountIds.length == 0) {
                // Did the user cancel connection from the wallet ?
                throw this.connectFailure("No account found")
            }

            this.provider = provider
            this.network = network
            this.accountId = accountIds[0]
            this.provider.once('chainChanged', this.handleDisconnect);
        } else {
            throw this.extensionNotFound()
        }
    }

    public async disconnect(): Promise<void> {
        this.provider?.off("chainChanged", this.handleDisconnect)
        this.provider = null
        this.network = null
        this.accountId = null
    }

    public getAccountId(): string|null {
        return this.accountId
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
}
