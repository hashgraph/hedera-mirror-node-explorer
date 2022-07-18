/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2022 Hedera Hashgraph, LLC
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


import {BladeSigner} from "@bladelabs/blade-web3.js";
import {HederaNetwork} from "@bladelabs/blade-web3.js/lib/src/models/blade";
import {WalletDriver} from "@/utils/wallet/WalletDriver";
import {Executable} from "@hashgraph/sdk";

export class WalletDriver_Blade extends WalletDriver {

    private network: string|null = null
    private signer: BladeSigner|null = null

    //
    // Public
    //

    public constructor() {
        super("Blade", null)
    }

    //
    // WalletDriver
    //

    public async connect(network: string): Promise<void> {
        const hNetwork = WalletDriver_Blade.makeHederaNetwork(network)
        if (this.signer === null && hNetwork !== null) {
            const newSigner = new BladeSigner()
            await newSigner.createSession(hNetwork)
            this.signer = newSigner
            this.network = network
        }
    }

    public async disconnect(): Promise<void> {
        if (this.signer !== null) {
            await this.signer.killSession()
            this.signer = null
            this.network = null
        }
    }

    public async call<RequestT, ResponseT, OutputT>(request: Executable<RequestT, ResponseT, OutputT>): Promise<OutputT> {
        let result: Promise<OutputT>
        if (this.signer !== null) {
            result = this.signer.call(request)
        } else {
            result = Promise.reject<OutputT>("Bug")
        }
        return result
    }

    public isConnected(): boolean {
        return this.signer != null
    }

    public getNetwork(): string|null {
        return this.network
    }

    public getAccountId(): string|null {
        return this.signer?.getAccountId().toString() ?? null
    }

    //
    // Private
    //

    private static makeHederaNetwork(network: string): HederaNetwork|null {
        let result: HederaNetwork | null
        switch (network) {
            case "mainnet":
                result = HederaNetwork.Mainnet
                break
            case "testnet":
                result = HederaNetwork.Testnet
                break
            default:
                result = null
                break
        }
        return result
    }

}
