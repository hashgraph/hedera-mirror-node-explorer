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
import {AccountUpdateTransaction, TransactionResponse} from "@hashgraph/sdk";

export class HashConnectManager {

    private readonly routeManager: RouteManager
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
        watch(this.routeManager.currentNetwork, (newValue) => this.networkDidChange(newValue))
        this.reconnect()
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

        // Creates HashConnect
        if (this.hashConnect === null) {

            this.hashConnect = new HashConnect(true)

            const hashConnectKey = AppStorage.getHashConnectPrivKey() ?? undefined
            const initData = await this.hashConnect.init(this.appMetadata, hashConnectKey)
            AppStorage.setHashConnectPrivKey(initData.privKey)

        }

        // Connects with network
        if (this.currentContext.value === null) {

            const network = this.routeManager.currentNetwork.value
            const context = AppStorage.getHashConnectContext(network)

            if (context === null) {

                // First connection
                const connectionState = await this.hashConnect.connect()
                const pairingString = this.hashConnect.generatePairingString(connectionState, network, true)
                const newContext: HashConnectContext = {
                    network: network,
                    topic: connectionState.topic,
                    pairingString: pairingString,
                    pairingData: null
                }
                AppStorage.setHashConnectContext(newContext, network)
                this.currentContext.value = newContext

                // Pairing
                this.hashConnect.findLocalWallets()
                this.hashConnect.connectToLocalWallet(pairingString)

                // Setup events
                this.hashConnect.pairingEvent.on((pairingData) => {
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

            } else {
                this.currentContext.value = context

                // Second connection
                await this.hashConnect.connect(context.topic, context.pairingData?.metadata)

                // Setup events
                this.hashConnect.pairingEvent.on((pairingData) => {
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
        this.currentContext.value = null
    }

    public async stakeToNode(nodeID: number): Promise<TransactionResponse> {
        let result: Promise<TransactionResponse>

        // Connects if needed
        await this.connect()

        // Updates account's stakeNodeId
        if (this.hashConnect !== null && this.currentContext.value !== null && this.accountId.value !== null) {
            const provider = this.hashConnect.getProvider(this.currentContext.value.network,
                this.currentContext.value.topic, this.accountId.value)
            const signer = this.hashConnect.getSigner(provider)
            const trans = await new AccountUpdateTransaction()
            trans.setAccountId(this.accountId.value)
            trans.setStakedNodeId(nodeID)
            await trans.freezeWithSigner(signer)
            result = trans.executeWithSigner(signer)

        } else {
            result = Promise.reject("Failed to connect to wallet")
        }

        return result;
    }

    //
    // Private
    //

    private networkDidChange(newValue: string) {
        this.currentContext.value = AppStorage.getHashConnectContext(newValue)
    }

    private reconnect() {
        const network = this.routeManager.currentNetwork.value
        if (AppStorage.getHashConnectContext(network) !== null) {
            this.connect().then()
        }
    }
}

export interface HashConnectContext {
    network: string
    topic: string
    pairingString: string
    pairingData: MessageTypes.ApprovePairing | null
}
