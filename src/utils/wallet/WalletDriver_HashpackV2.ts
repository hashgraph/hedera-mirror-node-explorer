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


import {HashConnect, HashConnectTypes, MessageTypes} from "hashconnect";
import {AppStorage} from "@/AppStorage";
import {HederaLogo} from "@/utils/MetaMask";
import {WalletDriver} from "@/utils/wallet/WalletDriver";
import {WalletDriverError} from "@/utils/wallet/WalletDriverError";
import {HashConnectSigner} from "hashconnect/dist/provider/signer";
import {Executable, Transaction} from "@hashgraph/sdk";
import {timeGuard, TimeGuardError} from "@/utils/TimerUtils";

export class WalletDriver_HashpackV2 extends WalletDriver {

    private network: string|null = null
    private signer: HashConnectSigner|null = null

    //
    // Public
    //

    public constructor() {
        super("Hashpack", "https://uploads-ssl.webflow.com/61ce2e4bcaa2660da2bb419e/61cf5cc71c9324950d7e071d_logo-colour-white.svg")
    }


    //
    // WalletDriver
    //

    public async connect(network: string): Promise<void> {
        await this.performConnect(network)
    }

    public async disconnect(): Promise<void> {
        if (this.signer !== null) {
            this.signer = null
            this.network = null
        }
        return Promise.resolve()
    }

    public async call<RequestT, ResponseT, OutputT>(request: Executable<RequestT, ResponseT, OutputT>): Promise<OutputT> {
        try {
            return await this.performCall(request)
        } catch(error) {
            if (error instanceof WalletDriverError) {
                throw error
            } else {
                throw this.callFailure(error.message)
            }
        }
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

    private readonly appMetadata: HashConnectTypes.AppMetadata = {
        name: "Hedera Explorer",
        description: "A ledger explorer for the Hedera network",
        icon: HederaLogo
    }

    private async performConnect(network: string): Promise<void> {

        // connect / init
        const hashConnect = new HashConnect(false)
        const hashConnectKey = AppStorage.getHashConnectPrivKey() ?? undefined
        const initData = await hashConnect.init(this.appMetadata, hashConnectKey)
        AppStorage.setHashConnectPrivKey(initData.privKey)

        let context = AppStorage.getHashConnectContext(network)
        if (context === null) {

            // First connection
            const connectionState = await hashConnect.connect()
            const pairingString = hashConnect.generatePairingString(connectionState, network, true)

            // Find extension
            hashConnect.findLocalWallets()
            try {
                await timeGuard(hashConnect.foundExtensionEvent.once(), 200)
            } catch(error) {
                if (error instanceof TimeGuardError) {
                    throw this.extensionNotFound()
                } else {
                    throw error
                }
            }

            // Pairing
            hashConnect.connectToLocalWallet(pairingString)
            const pairingData = await hashConnect.pairingEvent.once()

            // Check pairing data
            console.log("pairingData = " + JSON.stringify(pairingData))
            if (pairingData.network != network) {
                throw this.connectFailure("Unexpected pairing data")
            } else {
                context = {
                    network: network,
                    topic: connectionState.topic,
                    pairingString: pairingString,
                    pairingData: pairingData
                }
                AppStorage.setHashConnectContext(context, network)
            }

        } else {

            // Second connection
            try {
                await hashConnect.connect(context.topic, context.pairingData?.metadata)
            } catch(error) {
                AppStorage.setHashConnectContext(null, network)
                throw error
            }

        }

        // Updates signer
        const accountIds = context.pairingData?.accountIds ?? []
        const accountId = accountIds.length >= 1 ? accountIds[0] : null
        if (accountId !== null) {
            const provider = hashConnect.getProvider(network, context.topic, accountId)
            this.signer = hashConnect.getSigner(provider)
        } else {
            await this.disconnect()
        }
    }

    private async performCall<RequestT, ResponseT, OutputT>(request: Executable<RequestT, ResponseT, OutputT>): Promise<OutputT> {
        let result: Promise<OutputT>
        if (this.signer !== null) {
            if (request instanceof Transaction) {
                await request.freezeWithSigner(this.signer)
            }
            result = this.signer.call(request)
        } else {
            throw this.callFailure("Signer not found (bug)")
        }
        return result
    }

}

export interface HashConnectContext {
    network: string
    topic: string
    pairingString: string
    pairingData: MessageTypes.ApprovePairing
}
