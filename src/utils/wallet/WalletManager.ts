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

import {computed, ref, watch} from "vue";
import {AccountUpdateTransaction, TransactionResponse} from "@hashgraph/sdk";
import {RouteManager} from "@/utils/RouteManager";
import {WalletDriver} from "@/utils/wallet/WalletDriver";
import {WalletDriver_Blade} from "@/utils/wallet/WalletDriver_Blade";
import {WalletDriver_Hashpack} from "@/utils/wallet/WalletDriver_Hashpack";

export class WalletManager {

    private readonly routeManager: RouteManager
    private readonly bladeDriver = new WalletDriver_Blade()
    private readonly hashpackDriver = new WalletDriver_Hashpack()

    private readonly connectedRef = ref(false)
    private readonly accountIdRef = ref<string|null>(null)

    private activeDriver: WalletDriver = this.hashpackDriver

    //
    // Public
    //

    public constructor(routeManager: RouteManager) {
        this.routeManager = routeManager
        watch(this.routeManager.currentNetwork, () => this.disconnect())
    }

    public getDrivers(): WalletDriver[] {
        return [this.bladeDriver, this.hashpackDriver]
    }

    public getActiveDriver(): WalletDriver {
        return this.activeDriver
    }

    public setActiveDriver(newValue: WalletDriver): void {
        if (this.activeDriver != newValue) {
            this.activeDriver = newValue;
            this.connectedRef.value = this.activeDriver.isConnected()
            this.accountIdRef.value = this.activeDriver.getAccountId()
        }
    }

    public connected = computed(() => this.connectedRef.value)

    public accountId = computed(() => this.accountIdRef.value)

    public async connect(): Promise<void> {
        await this.activeDriver.connect(this.routeManager.currentNetwork.value)
        this.connectedRef.value = this.activeDriver.isConnected()
        this.accountIdRef.value = this.activeDriver.getAccountId()
    }

    public async disconnect(): Promise<void> {
        await this.activeDriver.disconnect()
        this.connectedRef.value = this.activeDriver.isConnected()
        this.accountIdRef.value = null
    }

    public async changeStaking(nodeId: number|null, accountId: string|null, declineReward: boolean|null): Promise<TransactionResponse> {

        console.log("changeStaking - nodeId:        " + nodeId)
        console.log("                accountId:     " + accountId)
        console.log("                declineReward: " + declineReward)

        let result: Promise<TransactionResponse>

        // Connects if needed
        await this.connect()

        // Updates account's stakeNodeId
        if (this.accountId.value !== null) {
            const trans = await new AccountUpdateTransaction()
            trans.setAccountId(this.accountId.value)
            if (nodeId !== null) {
                trans.setStakedNodeId(nodeId)
            } else if (accountId !== null) {
                trans.setStakedAccountId(accountId)
            } else {
                trans.setStakedNodeId(-1)
                trans.setStakedAccountId("0.0.0")
            }
            if (declineReward !== null) {
                trans.setDeclineStakingReward(declineReward)
            }
            result = this.activeDriver.call(trans)

        } else {
            result = Promise.reject("Failed to connect to wallet")
        }

        return result;
    }

}
