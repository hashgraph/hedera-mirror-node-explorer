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


import {BladeSigner, BladeWalletError} from "@bladelabs/blade-web3.js";
import {HederaNetwork} from "@bladelabs/blade-web3.js/lib/src/models/blade";
import {WalletDriver} from "@/utils/wallet/WalletDriver";
import {WalletDriverError} from "@/utils/wallet/WalletDriverError";
import {AccountUpdateTransaction} from "@hashgraph/sdk";
import {TransactionID} from "@/utils/TransactionID";

export class WalletDriver_Blade extends WalletDriver {

    private network: string|null = null
    private signer: BladeSigner|null = null

    //
    // Public
    //

    public constructor() {
        super("Blade", "https://www.bladewallet.io/wp-content/uploads/2022/04/BladeWalletWhite.svg")
    }

    //
    // WalletDriver
    //

    public async connect(network: string): Promise<void> {
        const hNetwork = WalletDriver_Blade.makeHederaNetwork(network)
        if (this.signer === null && hNetwork !== null) {
            const newSigner = new BladeSigner()
            try {
                const params = {
                    network: hNetwork,
                    dAppCode: "HashScan"
                }
                await newSigner.createSession(params)
                this.signer = newSigner
                this.network = network
            } catch(reason) {
                throw this.makeConnectError(reason)
            }
        }
    }

    public async disconnect(): Promise<void> {
        if (this.signer !== null) {
            try {
                await this.signer.killSession()
            } catch(reason) {
                const extra = reason instanceof Error ? reason.message : JSON.stringify(reason)
                throw this.disconnectFailure(extra)
            } finally {
                this.signer = null
                this.network = null
            }
        }
    }

    public async updateAccount(request: AccountUpdateTransaction): Promise<string> {
        let result: Promise<string>
        if (this.signer !== null) {
            try {
                const response = await this.signer.call(request)
                const transactionId = TransactionID.normalize(response.transactionId.toString(), false);
                result = Promise.resolve(transactionId)
            } catch(reason) {
                throw this.callFailure(reason.message)
            }
        } else {
            throw this.callFailure("Signer not found (bug)")
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

    private makeConnectError(reason: unknown): WalletDriverError {
        let result: WalletDriverError
        if (reason instanceof Error) {
            switch(reason.name) {
                case BladeWalletError.ExtensionNotFound:
                    result = this.extensionNotFound()
                    break
                default:
                    result = this.connectFailure(reason.message)
                    break
            }
        } else {
            result = this.connectFailure(JSON.stringify(reason))
        }
        return result
    }
}
