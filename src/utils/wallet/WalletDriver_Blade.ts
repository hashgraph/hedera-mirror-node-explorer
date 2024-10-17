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


import type {BladeConnector, BladeSigner} from "@bladelabs/blade-web3.js";
import {HederaNetwork} from "@bladelabs/blade-web3.js/lib/src/models/blade";
import {WalletDriver_Hedera} from "@/utils/wallet/WalletDriver_Hedera";
import {WalletDriverCancelError, WalletDriverError} from "@/utils/wallet/WalletDriverError";
import {Signer} from "@hashgraph/sdk";
import {HederaLogo} from "@/utils/wallet/WalletDriver";

export class WalletDriver_Blade extends WalletDriver_Hedera {

    //
    // https://github.com/Blade-Labs/blade-web3.js
    //

    private connector: BladeConnector | null = null

    //
    // Public
    //

    public constructor() {
        super("Blade",
            "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI1LjQuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA2MDAgMjE0IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA2MDAgMjE0OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU+CjxnPgoJPHBhdGggY2xhc3M9InN0MCIgZD0iTTEyMi42LDIwN0gxMTlsLTExLjItMzUuN2g1LjJsOCwyNS45bDguNy0yNS45aDMuNmw4LjcsMjUuOWw4LTI1LjloNS4yTDE0NCwyMDdoLTMuNmwtOC45LTI2LjRMMTIyLjYsMjA3eiIvPgoJPHBhdGggY2xhc3M9InN0MCIgZD0iTTIxNy45LDE5Ny44aC0xNS4xbC0zLjcsOS4yaC01LjNsMTQuOC0zNS43aDMuNkwyMjcsMjA3aC01LjNMMjE3LjksMTk3Ljh6IE0yMDQuOSwxOTNoMTFsLTUuNS0xMy4zTDIwNC45LDE5MwoJCXoiLz4KCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0yNzYuNywyMDIuMmgxNS44djQuOGgtMjAuOXYtMzUuN2g1LjFWMjAyLjJ6Ii8+Cgk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMzQzLjEsMjAyLjJoMTUuOHY0LjhIMzM4di0zNS43aDUuMVYyMDIuMnoiLz4KCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjEuMiwxODUuM3Y0LjhoLTExLjd2MTJoMTUuOHY0LjhoLTIwLjl2LTM1LjdoMjAuNHY0LjhoLTE1LjN2OS4ySDQyMS4yeiIvPgoJPHBhdGggY2xhc3M9InN0MCIgZD0iTTQ2Ny45LDE3MS4zaDI0LjV2NC44aC05LjdWMjA3aC01LjF2LTMwLjloLTkuN1YxNzEuM3oiLz4KPC9nPgo8Zz4KCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MiwzNi4yYzUsMCw5LDAuNSwxMS45LDEuNmMzLDEuMSw1LjUsMi42LDcuNyw0LjVjMi40LDIuMiw0LjQsNC43LDUuOSw3LjdjMS41LDMsMi4yLDYuMywyLjIsOS45CgkJYzAsMi45LTAuNiw1LjctMS44LDguNGMtMS4yLDIuNy0yLjUsNC43LTMuOSw2LjJjMy45LDEuOSw3LjEsNC45LDkuNSw4LjljMi40LDQsMy42LDguNSwzLjYsMTMuNGMwLDMuNy0wLjcsNy4yLTIuMiwxMC40CgkJYy0xLjUsMy4yLTMuNCw2LTUuOCw4LjRjLTIuNCwyLjQtNS40LDQuMy05LDUuN2MtMy42LDEuNC04LjIsMi4xLTEzLjksMi4xSDEyLjNWMzYuMkg0MnogTTI5LjEsNzBINDFjMi43LDAsNC43LTAuMyw2LTAuOQoJCWMxLjMtMC42LDIuNS0xLjMsMy40LTIuMmMwLjctMC44LDEuNC0xLjgsMS44LTIuOWMwLjUtMS4xLDAuNy0yLjIsMC43LTMuNGMwLTEuMi0wLjItMi4zLTAuNy0zLjRjLTAuNS0xLjEtMS4xLTItMS44LTIuOQoJCWMtMC45LTAuOS0yLTEuNy0zLjQtMi4yYy0xLjMtMC42LTMuMy0wLjktNi0wLjlIMjkuMVY3MHogTTQ2LDEwOC43YzIuOSwwLDUuMi0wLjQsNy0xLjFjMS44LTAuNywzLjItMS42LDQuMi0yLjgKCQljMi4xLTIuMiwzLjEtNC45LDMuMS04YzAtMy4xLTEtNS43LTMuMS04Yy0xLjEtMS4yLTIuNS0yLjEtNC4yLTIuOGMtMS43LTAuNy00LjEtMS4xLTctMS4xSDI5LjF2MjMuN0g0NnoiLz4KCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0xMzkuMywzNi4yaDE2Ljl2NzIuNUgxOTN2MTVoLTUzLjdWMzYuMnoiLz4KCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQsMzYuMmM3LDAsMTIuOSwwLjcsMTcuNiwyLjFjNC43LDEuNCw4LjksMy41LDEyLjUsNi4xYzUuNCw0LDkuNyw5LjEsMTIuNywxNS4yYzMuMSw2LjIsNC42LDEyLjksNC42LDIwLjIKCQljMCw3LjMtMS41LDE0LjEtNC42LDIwLjJjLTMuMSw2LjItNy4zLDExLjItMTIuNywxNS4yYy0zLjYsMi43LTcuNyw0LjctMTIuNSw2LjFjLTQuNywxLjQtMTAuNiwyLjEtMTcuNiwyLjFoLTI3LjVWMzYuMkg0MjR6CgkJIE00NTQuNiw4MGMwLTMuNy0wLjYtNy4xLTEuNy0xMC40Yy0xLjEtMy4yLTIuNy02LjEtNC43LTguNmMtMi40LTMuMS01LjQtNS41LTkuMS03LjJjLTMuNi0xLjctOC4xLTIuNi0xMy4zLTIuNmgtMTIuNXY1Ny41aDEyLjUKCQljNS4yLDAsOS43LTAuOSwxMy4zLTIuNmMzLjYtMS43LDYuNi00LjEsOS4xLTcuMmMyLTIuNSwzLjYtNS40LDQuNy04LjZDNDU0LDg3LjEsNDU0LjYsODMuNiw0NTQuNiw4MHoiLz4KCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik01NTEsNTEuMnYxOC4xaDI2Ljl2MTVINTUxdjI0LjRoMzYuOXYxNWgtNTMuN1YzNi4yaDUyLjV2MTVINTUxeiIvPgoJPHBvbHlnb24gY2xhc3M9InN0MCIgcG9pbnRzPSIyNzQuMywxMTIuNCAyODguMiw3OC42IDI3Ny4xLDUwLjkgMjQzLjEsMTM1IDMxMC44LDEzNS4xIDMwMS44LDExMi40IAkiLz4KCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0yOTIuMSw1LjRsLTguMiwyMC43bC0wLjMsMC44Yy0xLjgsNC42LTIuNSwxMS4yLTEuOCwxNy4yYzAuMywyLjUsMC43LDQuOCwxLjQsNi45YzAuMSwwLjQsMC4zLDAuOSwwLjUsMS4zCgkJbDMzLjEsODIuOGgyNy44TDI5Mi4xLDUuNHoiLz4KPC9nPgo8L3N2Zz4K",
            "data:image/png;base64,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")
    }

    //
    // WalletDriver
    //

    public async connect(network: string): Promise<string[]> {
        let newConnector: BladeConnector | null
        const hNetwork = WalletDriver_Blade.makeHederaNetwork(network)
        if (hNetwork !== null) {
            const {BladeConnector, ConnectorStrategy} = await import("@bladelabs/blade-web3.js")
            try {
                newConnector = await BladeConnector.init(
                    ConnectorStrategy.EXTENSION,
                    {
                        name: "HashScan",
                        description: "A ledger explorer for Hedera network",
                        url: "https://hashscan.io",
                        icons: [HederaLogo]
                    }
                )
                const params = {
                    network: hNetwork,
                    dAppCode: "HashScan"
                }
                await newConnector.createSession(params)

            } catch (reason) {
                if (this.isConnectCancelError(reason)) {
                    throw new WalletDriverCancelError()
                } else {
                    throw await this.makeConnectError(reason)
                }
            }
        } else {
            throw await this.makeConnectError("Network " + network + " is not supported by " + this.name)
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
            } catch (reason) {
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

    public makeSigner(accountId: string): Signer | null {
        let result: Signer | null = null
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

    private static makeHederaNetwork(network: string): HederaNetwork | null {
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

    private async makeConnectError(reason: unknown): Promise<WalletDriverError> {
        let result: WalletDriverError
        if (reason instanceof Error) {
            const {BladeWalletError} = await import("@bladelabs/blade-web3.js")
            switch (reason.name) {
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
        return Promise.resolve(result)
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
