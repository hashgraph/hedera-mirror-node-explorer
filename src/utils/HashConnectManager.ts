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

import {computed, Ref, ref, watch} from "vue";
import {HashConnect, HashConnectTypes, MessageTypes} from "hashconnect";
import {AppStorage} from "@/AppStorage";
import {HederaLogo} from "@/utils/MetaMask";
import {RouteManager} from "@/utils/RouteManager";

export class HashConnectManager {

    private readonly routeManager: RouteManager
    private readonly initData: Ref<HashConnectTypes.InitilizationData | null> = ref(null)
    private readonly currentContext: Ref<HashConnectContext | null> = ref(null)

    private readonly appMetadata: HashConnectTypes.AppMetadata = {
        name: "Hedera Explorer",
        description: "A ledger explorer for the Hedera network",
        icon: HederaLogo
    }

    private hashConnect: HashConnect | null = null


    //
    // Public
    //

    public constructor(routeManager: RouteManager) {
        this.routeManager = routeManager
        this.currentContext.value = AppStorage.getHashConnectContext(this.routeManager.currentNetwork.value)
        watch(this.routeManager.currentNetwork, (newValue) => this.networkDidChange(newValue))
    }

    public readonly connected = computed<boolean>(() => {
        return this.currentContext.value != null
    })

    public readonly connectedNetwork = computed<string|null>(() => {
        return this.currentContext.value?.network ?? null
    })

    public readonly accountIds = computed<string[]>(() => {
        return this.currentContext.value?.pairingData?.accountIds ?? []
    })

    public readonly accountId = computed<string|null>( () => {
        return this.accountIds.value.length >= 1 ? this.accountIds.value[0] : null
    })

    public readonly walletName = computed<string|null>(() => {
        return this.currentContext.value?.pairingData?.metadata.name ?? null
    })

    public readonly walletIconURL = computed<string|null>(() => {
        return this.currentContext.value?.pairingData?.metadata.icon ?? null
    })

    public async connect(): Promise<void> {

        if (this.currentContext.value != null) {

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
            const network = this.routeManager.currentNetwork.value
            const context = AppStorage.getHashConnectContext(network)
            if (context == null) {

                // First connection
                await this.firstConnect(this.hashConnect, network)

             } else {

                // Second connection
                await this.secondConnect(this.hashConnect, context);
           }

        }

    }

    public disconnect(): void {

        if (this.currentContext.value != null) {
            AppStorage.setHashConnectContext(null, this.currentContext.value.network)
            this.currentContext.value = null
        }
    }


    public reset(): void {
        AppStorage.setHashConnectPrivKey(null)
        for (const network of ["mainnet", "testnet"]) {
            AppStorage.setHashConnectContext(null, network)
        }
        this.initData.value = null
        this.currentContext.value = null
    }


    //
    // Private
    //

    private networkDidChange(newValue: string) {
        this.currentContext.value = AppStorage.getHashConnectContext(newValue)
    }

    private async firstConnect(hashConnect: HashConnect, network: string) {

        // First connection with network
        const connectionState = await hashConnect.connect()
        const pairingString = hashConnect.generatePairingString(connectionState, network, true)
        hashConnect.findLocalWallets()
        hashConnect.connectToLocalWallet(pairingString)

        // Setup events
        hashConnect.pairingEvent.once((pairingData) => {
            if (pairingData.network == network) {
                const newContext: HashConnectContext = {
                    network: network,
                    topic: connectionState.topic,
                    pairingString: pairingString,
                    pairingData: pairingData
                }
                AppStorage.setHashConnectContext(newContext, network)
                this.currentContext.value = newContext
            }
        });
    }

    private async secondConnect(hashConnect: HashConnect, context: HashConnectContext) {

        // Second connection
        await hashConnect.connect(context.topic, context.pairingData?.metadata)
        this.currentContext.value = context

        // Setup events
        hashConnect.pairingEvent.once((pairingData) => {
            if (pairingData.network == context.network) {
                const newContext: HashConnectContext = {
                    network: context.network,
                    topic: context.topic,
                    pairingString: context.pairingString,
                    pairingData: pairingData
                }
                AppStorage.setHashConnectContext(newContext, newContext.network);
                this.currentContext.value = newContext
            }
        });
    }

}

export interface HashConnectContext {
    network: string
    topic: string
    pairingString: string
    pairingData: MessageTypes.ApprovePairing
}
