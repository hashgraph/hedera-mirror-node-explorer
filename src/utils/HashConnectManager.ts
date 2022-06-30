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
import {HashConnect, HashConnectTypes} from "hashconnect";
import {HederaLogo} from "@/utils/MetaMask";
import WalletMetadata = HashConnectTypes.WalletMetadata;

export class HashConnectManager {

    private readonly initData: Ref<HashConnectTypes.InitilizationData | null> = ref(null)
    private readonly connectionState: Ref<HashConnectTypes.ConnectionState | null> = ref(null)
    private readonly pairingString: Ref<string|null> = ref(null)
    private readonly walletMetadata: Ref<WalletMetadata|null> = ref(null)

    private readonly appMetadata: HashConnectTypes.AppMetadata = {
        name: "Hedera Explorer",
        description: "A ledger explorer for the Hedera network",
        icon: HederaLogo
    }

    private hashConnect: HashConnect | null = null

    //
    // Public
    //

    public readonly connected = computed<boolean>(() => {
        return this.connectionState.value != null
    })

    public readonly walletName = computed<string|undefined>(() => {
        return this.walletMetadata.value?.name
    })

    public async connect(): Promise<void> {

        // Creates HashConnect
        if (this.hashConnect === null) {
            this.hashConnect = new HashConnect(true)
        }

        // Initializes
        const hashConnectKey = AppStorage.getHashConnectPrivKey() ?? undefined
        this.initData.value = await this.hashConnect.init(this.appMetadata, hashConnectKey)
        AppStorage.setHashConnectPrivKey(this.initData.value.privKey)

        // Connects
        const topic = AppStorage.getHashConnectTopic() ?? undefined
        this.connectionState.value = await this.hashConnect.connect(topic)
        AppStorage.setHashConnectTopic(this.connectionState.value.topic)

        // Pairing
        this.pairingString.value = AppStorage.getHashConnectPairingString()
        if (this.pairingString.value === null) {
            this.pairingString.value = this.hashConnect.generatePairingString(
                this.connectionState.value, "testnet", false);
            AppStorage.setHashConnectPairingString(this.pairingString.value)
        }

        // Find wallets
        this.hashConnect.connectToLocalWallet(this.pairingString.value)
        this.hashConnect.findLocalWallets()
        this.hashConnect.foundExtensionEvent.once((walletMetadata) => {
            this.walletMetadata.value = walletMetadata
            console.log("walletMetadata=" + JSON.stringify(this.walletMetadata.value))
        })

        // Extensions
    }

}

export const hashConnectManager = new HashConnectManager()