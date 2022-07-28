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
import {AccountUpdateTransaction} from "@hashgraph/sdk";
import {RouteManager} from "@/utils/RouteManager";
import {WalletDriver} from "@/utils/wallet/WalletDriver";
import {WalletDriver_Blade} from "@/utils/wallet/WalletDriver_Blade";
import {WalletDriver_Hashpack} from "@/utils/wallet/WalletDriver_Hashpack";
import {timeGuard, TimeGuardError} from "@/utils/TimerUtils";

export class WalletManager {

    private readonly routeManager: RouteManager
    private readonly bladeDriver = new WalletDriver_Blade()
    private readonly hashpackDriver = new WalletDriver_Hashpack()
    private readonly drivers: Array<WalletDriver> = [this.bladeDriver, this.hashpackDriver]
    private readonly timeout = 30000; // milliseconds

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
        return this.drivers
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
        try {
            await timeGuard(this.activeDriver.connect(this.routeManager.currentNetwork.value), this.timeout)
            this.connectedRef.value = this.activeDriver.isConnected()
            this.accountIdRef.value = this.activeDriver.getAccountId()
        } catch(error) {
            if (error instanceof TimeGuardError) {
                this.activeDriver.connectFailure(this.activeDriver.silentMessage())
            } else {
                throw error
            }
        }
    }

    public async disconnect(): Promise<void> {
        try {
            await timeGuard(this.activeDriver.disconnect(), this.timeout)
        } catch(error) {
            if (error instanceof TimeGuardError) {
                this.activeDriver.connectFailure(this.activeDriver.silentMessage())
            } else {
                throw error
            }
        } finally {
            this.connectedRef.value = false
            this.accountIdRef.value = null
        }
    }

    public async changeStaking(nodeId: number|null, accountId: string|null, declineReward: boolean|null): Promise<string> {

        let result: string

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

            try {
                result = await timeGuard(this.activeDriver.updateAccount(trans), this.timeout)
            } catch(error) {
                if (error instanceof TimeGuardError) {
                    throw this.activeDriver.callFailure(this.activeDriver.silentMessage())
                } else {
                    throw error
                }
            }

        } else {
            throw this.activeDriver.callFailure("No account id")
        }

        return Promise.resolve(result)
    }

}
