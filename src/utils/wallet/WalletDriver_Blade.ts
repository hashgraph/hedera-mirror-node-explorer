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


import {BladeConnector, BladeSigner, BladeWalletError, ConnectorStrategy} from "@bladelabs/blade-web3.js";
import {HederaNetwork} from "@bladelabs/blade-web3.js/lib/src/models/blade";
import {WalletDriver_Hedera} from "@/utils/wallet/WalletDriver_Hedera";
import {WalletDriverCancelError, WalletDriverError} from "@/utils/wallet/WalletDriverError";
import {Signer} from "@hashgraph/sdk";
import {HederaLogo} from "@/utils/wallet/WalletDriver";

export class WalletDriver_Blade extends WalletDriver_Hedera {

    //
    // https://github.com/Blade-Labs/blade-web3.js
    //

    private connector: BladeConnector|null = null

    //
    // Public
    //

    public constructor() {
        super("Blade",
            "data:image/png;base64,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",
            "https://www.bladewallet.io/wp-content/uploads/2022/04/BladeWalletWhite.svg")
    }

    //
    // WalletDriver
    //

    public async connect(network: string): Promise<string[]> {
        let newConnector: BladeConnector|null
        const hNetwork = WalletDriver_Blade.makeHederaNetwork(network)
        if (hNetwork !== null) {
            newConnector = await BladeConnector.init(
                ConnectorStrategy.EXTENSION,
                {
                    name: "HashScan",
                    description: "A ledger explorer for Hedera network",
                    url: "https://hashscan.io",
                    icons: [ HederaLogo ]
                }
            )
            try {
                const params = {
                    network: hNetwork,
                    dAppCode: "HashScan"
                }
                await newConnector.createSession(params)

            } catch(reason) {
                if (this.isConnectCancelError(reason)) {
                    throw new WalletDriverCancelError()
                } else {
                    throw this.makeConnectError(reason)
                }
            }
        } else {
            throw this.makeConnectError("Network " + network + " is not supported by " + this.name)
        }

        this.connector = newConnector

        const signers = this.connector.getSigners()
        const result = signers.map<string>((s: BladeSigner) => s.getAccountId().toString())
        return Promise.resolve(result)
    }

    public async disconnect(): Promise<void> {
        if (this.connector !== null) {
            try {
                await this.connector.killSession()
            } catch(reason) {
                const extra = reason instanceof Error ? reason.message : JSON.stringify(reason)
                throw this.disconnectFailure(extra)
            } finally {
                this.connector = null
            }
        }
    }

    public isConnected(): boolean {
        return this.connector !== null
    }

    //
    // WalletDriver_Hedera
    //

    public makeSigner(accountId: string): Signer|null {
        let result: Signer|null = null
        if (this.connector !== null) {
            for (const s of this.connector.getSigners()) {
                if (s.getAccountId().toString() === accountId) {
                    result = s
                    break
                }
            }
        }
        return result
    }

    public isCancelError(reason: unknown): boolean {
        let result: boolean
        if (reason instanceof Error && "code" in reason) {
            result = reason.code == 500
        } else {
            result = false
        }
        return result
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

    private isConnectCancelError(reason: unknown): boolean {
        let result: boolean
        if (typeof reason == "object" && reason !== null && "code" in reason) {
            result = reason.code == 1000
        } else {
            result = false
        }
        return result
    }
}
