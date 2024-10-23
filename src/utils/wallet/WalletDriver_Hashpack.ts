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


import {HashConnect, HashConnectTypes, MessageTypes} from "hashconnect";
import {HederaLogo} from "@/utils/wallet/WalletDriver";
import {WalletDriver_Hedera} from "@/utils/wallet/WalletDriver_Hedera";
import {timeGuard, TimeGuardError} from "@/utils/TimerUtils";
import {Signer} from "@hashgraph/sdk";

export class WalletDriver_Hashpack extends WalletDriver_Hedera {

    //
    // https://github.com/Hashpack/hashconnect
    //

    private hashConnect: HashConnect | null = null
    private network: string | null = null
    private lastHashConnectKey: string | null = null
    private lastHashConnectContext: HashConnectContext | null = null;

    //
    // Public
    //

    public constructor() {
        super("HashPack",
            "https://uploads-ssl.webflow.com/61ce2e4bcaa2660da2bb419e/61cf5cc71c9324950d7e071d_logo-colour-white.svg",
            "data:image/png;base64,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")
    }


    //
    // WalletDriver
    //

    public async connect(network: string): Promise<string[]> {
        return await this.performConnect(network)
    }

    public async disconnect(): Promise<void> {
        this.hashConnect = null
        this.network = null
        return Promise.resolve()
    }


    //
    // WalletDriver_Hedera
    //

    public makeSigner(accountId: string): Signer | null {
        let result: Signer | null
        if (this.hashConnect !== null && this.network !== null && this.lastHashConnectContext !== null) {
            const provider = this.hashConnect.getProvider(this.network, this.lastHashConnectContext.topic, accountId)
            result = this.hashConnect.getSigner(provider)
        } else {
            result = null
        }
        return result
    }

    public isCancelError(/* reason: unknown */): boolean {
        // Unused by this driver
        return false
    }

    //
    // Private
    //

    private readonly appMetadata: HashConnectTypes.AppMetadata = {
        name: "Hedera Explorer",
        description: "A ledger explorer for the Hedera network",
        icon: HederaLogo
    }

    private async performConnect(network: string): Promise<string[]> {

        // connect / init
        const hashConnect = new HashConnect(false)
        const initData = await hashConnect.init(this.appMetadata, this.lastHashConnectKey ?? undefined)
        this.lastHashConnectKey = initData.privKey

        if (this.lastHashConnectContext === null || this.lastHashConnectContext.network != network) {

            // First connection
            const connectionState = await hashConnect.connect()
            const pairingString = hashConnect.generatePairingString(connectionState, network, true)

            // Find extension
            hashConnect.findLocalWallets()
            try {
                await timeGuard(hashConnect.foundExtensionEvent.once(), 200)
            } catch (error) {
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
            if (pairingData.network != network) {
                throw this.connectFailure("Unexpected pairing data")
            } else {
                this.lastHashConnectContext = {
                    network: network,
                    topic: connectionState.topic,
                    pairingString: pairingString,
                    pairingData: pairingData
                }
            }

        } else {

            // Second connection
            try {
                await hashConnect.connect(
                    this.lastHashConnectContext.topic,
                    this.lastHashConnectContext.pairingData.metadata)
            } catch (error) {
                this.lastHashConnectContext = null
                throw error
            }

        }

        this.hashConnect = hashConnect
        this.network = network
        return this.lastHashConnectContext.pairingData.accountIds ?? []
    }

}

export interface HashConnectContext {
    network: string
    topic: string
    pairingString: string
    pairingData: MessageTypes.ApprovePairing
}
