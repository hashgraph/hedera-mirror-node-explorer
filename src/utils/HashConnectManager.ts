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

import {computed, Ref, ref} from "vue";
import {AppStorage} from "@/AppStorage";
import {HashConnect, HashConnectTypes, MessageTypes} from "hashconnect";
import {HederaLogo} from "@/utils/MetaMask";

export class HashConnectManager {

    private readonly initData: Ref<HashConnectTypes.InitilizationData | null> = ref(null)
    private readonly connectionContext: Ref<HashConnectConnectionContext | null> = ref(null)
    private readonly pairingData: Ref<MessageTypes.ApprovePairing | null> = ref(null)

    private readonly appMetadata: HashConnectTypes.AppMetadata = {
        name: "Hedera Explorer",
        description: "A ledger explorer for the Hedera network",
        icon: HederaLogo
    }

    private hashConnect: HashConnect | null = null

    //
    // Public
    //

    public readonly connectedNetwork = computed<string | undefined>(() => {
        return this.connectionContext.value?.network
    })

    public readonly paired = computed<boolean>(() => {
        return this.pairingData.value != null
    })

    public readonly pairedWalletName = computed<string|undefined>( () => {
        return this.pairingData.value?.metadata.name
    })

    public readonly pairedWalletIconURL = computed<string|undefined>( () => {
        return this.pairingData.value?.metadata.icon
    })

    public readonly pairedAccountIds = computed<Array<string>>(() => {
        return this.pairingData.value?.accountIds ?? []
    })

    public async connect(network: string): Promise<void> {

        if (this.connectionContext.value?.network == network) {

            await Promise.resolve()

        } else {

            // Creates HashConnect
            if (this.hashConnect === null) {
                this.hashConnect = new HashConnect(true)
            }

            // Initializes
            const hashConnectKey = AppStorage.getHashConnectPrivKey() ?? undefined
            this.initData.value = await this.hashConnect.init(this.appMetadata, hashConnectKey)
            AppStorage.setHashConnectPrivKey(this.initData.value.privKey)

            // Connects with network
            const connectionContext = AppStorage.getHashConnectConnectionContext(network)
            if (connectionContext == null) {

                // First connection with network
                const connectionState = await this.hashConnect.connect()
                const pairingString = this.hashConnect.generatePairingString(connectionState, network, true)
                this.connectionContext.value = {
                    network: network,
                    topic: connectionState.topic,
                    pairingString: pairingString
                }
                AppStorage.setHashConnectConnectionContext(this.connectionContext.value, network)
                this.hashConnect.findLocalWallets()
                this.hashConnect.connectToLocalWallet(pairingString)

            } else {
                this.connectionContext.value = connectionContext

                // Second connection
                const pairingData = AppStorage.getHashConnectPairingData(network)
                await this.hashConnect.connect(connectionContext.topic, pairingData?.metadata)
                this.hashConnect.connectToLocalWallet(connectionContext.pairingString)
            }

            // Setups events
            this.hashConnect.pairingEvent.on((pairingData) => {

                this.pairingData.value = pairingData
                AppStorage.setHashConnectPairingData(this.pairingData.value, network)

                console.log(JSON.stringify(this.pairingData.value))
            });

        }

    }

    public reset(): void {
        AppStorage.setHashConnectPrivKey(null)
        for (const network of ["mainnet", "testnet"]) {
            AppStorage.setHashConnectConnectionContext(null, network)
            AppStorage.setHashConnectPairingData(null, network)
        }
        this.initData.value = null
        this.connectionContext.value = null
        this.pairingData.value = null
    }

}

export interface HashConnectConnectionContext {
    network: string
    topic: string
    pairingString: string
}

export const hashConnectManager = new HashConnectManager()