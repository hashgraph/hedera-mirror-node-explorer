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


import {WalletManager} from "@/utils/wallet/WalletManager";
import {HashConnect, HashConnectTypes} from "hashconnect";
import {AppStorage} from "@/AppStorage";
import {HashConnectContext} from "@/utils/HashConnectManager";
import {HederaLogo} from "@/utils/MetaMask";

export class HashpackManager extends WalletManager {

    //
    // WalletManager
    //

    public async connect(): Promise<void> {
        if (this.signerRef.value === null) {
            await this.connectToHashpack()
        }
    }

    public async disconnect(): Promise<void> {
        if (this.signerRef.value !== null) {
            await this.disconnectFromHashpack()
        }
    }

    protected shouldFreeze(): boolean {
        return true;
    }

    //
    // Private
    //

    private readonly appMetadata: HashConnectTypes.AppMetadata = {
        name: "Hedera Explorer",
        description: "A ledger explorer for the Hedera network",
        icon: HederaLogo
    }

    private async connectToHashpack(): Promise<void> {

        // connect / init
        const hashConnect = new HashConnect(false)
        const hashConnectKey = AppStorage.getHashConnectPrivKey() ?? undefined
        const initData = await hashConnect.init(this.appMetadata, hashConnectKey)
        AppStorage.setHashConnectPrivKey(initData.privKey)


        const network = this.routeManager.currentNetwork.value
        const context = AppStorage.getHashConnectContext(network)

        if (context === null) {

            // First connection
            const connectionState = await hashConnect.connect()
            const pairingString = hashConnect.generatePairingString(connectionState, network, true)
            const newContext: HashConnectContext = {
                network: network,
                topic: connectionState.topic,
                pairingString: pairingString,
                pairingData: null
            }
            AppStorage.setHashConnectContext(newContext, network)

            // Pairing
            hashConnect.findLocalWallets()
            hashConnect.connectToLocalWallet(pairingString)

            // Setup events
            const pairingData = await hashConnect.pairingEvent.once()
            if (pairingData.network == network) {
                const newContext: HashConnectContext = {
                    network: network,
                    topic: connectionState.topic,
                    pairingString: pairingString,
                    pairingData: pairingData
                }
                AppStorage.setHashConnectContext(newContext, network)
            }

            // Updates signer
            const accountIds = pairingData.accountIds
            const accountId = accountIds.length >= 1 ? accountIds[0] : null
            if (accountId !== null) {
                const provider = hashConnect.getProvider(network, connectionState.topic, accountId)
                this.signerRef.value = hashConnect.getSigner(provider)
                this.accountIdRef.value = accountId
            } else {
                await this.disconnect()
            }

        } else {

            // Second connection
            await hashConnect.connect(context.topic, context.pairingData?.metadata)

            // Updates signer
            const accountIds = context.pairingData?.accountIds ?? []
            const accountId = accountIds.length >= 1 ? accountIds[0] : null
            if (accountId !== null) {
                const provider = hashConnect.getProvider(network, context.topic, accountId)
                this.signerRef.value = hashConnect.getSigner(provider)
                this.accountIdRef.value = accountId
            } else {
                await this.disconnect()
            }

        }
    }

    public disconnectFromHashpack(): void {
        this.signerRef.value = null
        this.accountIdRef.value = null
    }

}
