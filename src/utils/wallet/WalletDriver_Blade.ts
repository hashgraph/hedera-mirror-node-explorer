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
import {WalletDriverError} from "@/utils/wallet/WalletDriverError";
import {Signer} from "@hashgraph/sdk";
import {HederaLogo} from "@/utils/MetaMask";

export class WalletDriver_Blade extends WalletDriver_Hedera {

    //
    // https://github.com/Blade-Labs/blade-web3.js
    //

    private connector: BladeConnector|null = null

    //
    // Public
    //

    public constructor() {
        super("Blade", "https://www.bladewallet.io/wp-content/uploads/2022/04/BladeWalletWhite.svg")
    }

    //
    // WalletDriver
    //

    public async connect(network: string): Promise<string[]> {
        let newConnector: BladeConnector|null
        const hNetwork = WalletDriver_Blade.makeHederaNetwork(network)
        if (hNetwork !== null) {
            newConnector = await BladeConnector.init(
                ConnectorStrategy.AUTO,
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
                throw this.makeConnectError(reason)
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
