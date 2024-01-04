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

import {BrowserProvider, Eip1193Provider, ethers} from "ethers";
import {BaseProvider} from '@metamask/providers';
import {WalletDriver_Ethereum} from "@/utils/wallet/WalletDriver_Ethereum";

export class WalletDriver_Brave extends WalletDriver_Ethereum {

    private braveProvider: BaseProvider|null = null

    //
    // Public
    //

    public constructor() {
        super("Brave Wallet",
            "https://brave.com/static-assets/images/optimized/brave-branding-assets/images/brave-logo-color-RGB_reversed.png",
            "https://brave.com/static-assets/images/brave-logo-no-shadow.png")
    }

    //
    // WalletDriver_Ethereum
    //

    public async makeProvider(): Promise<BrowserProvider|null> {
        if (this.braveProvider === null && window.ethereum) {
            // https://wallet-docs.brave.com/ethereum/wallet-detection/
            const clientVersion = await window.ethereum.request({method: "web3_clientVersion"})
            const isBraveWallet = clientVersion.split('/')[0] === 'BraveWallet'
            this.braveProvider = isBraveWallet ? window.ethereum as BaseProvider : null
        }
        const result = this.braveProvider !== null ?  new ethers.BrowserProvider(this.braveProvider) : null
        return Promise.resolve(result)
    }

    public async connect(network: string): Promise<string[]> {
        const result = await super.connect(network)
        this.braveProvider?.on('chainChanged', this.handleDisconnect)
        return Promise.resolve(result)
    }

    public async disconnect(): Promise<void> {
        this.braveProvider?.off("chainChanged", this.handleDisconnect)
        this.braveProvider = null
        return super.disconnect()
    }

    //
    // Private
    //

    private readonly handleDisconnect = () => this.disconnect()


}

declare global {
    interface Window {
        ethereum?: Eip1193Provider
    }
}
