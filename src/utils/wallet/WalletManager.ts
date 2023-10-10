/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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
import {RouteManager} from "@/utils/RouteManager";
import {WalletDriver} from "@/utils/wallet/WalletDriver";
import {WalletDriver_Blade} from "@/utils/wallet/WalletDriver_Blade";
import {WalletDriver_Hashpack} from "@/utils/wallet/WalletDriver_Hashpack";
import {timeGuard, TimeGuardError} from "@/utils/TimerUtils";
import {WalletDriver_Hedera} from "@/utils/wallet/WalletDriver_Hedera";
import {WalletDriver_Metamask} from "@/utils/wallet/WalletDriver_Metamask";

export class WalletManager {

    private readonly routeManager: RouteManager
    private readonly bladeDriver = new WalletDriver_Blade()
    private readonly hashpackDriver = new WalletDriver_Hashpack()
    private readonly metamaskDriver = new WalletDriver_Metamask()
    private readonly drivers: Array<WalletDriver> = [this.bladeDriver, this.hashpackDriver, this.metamaskDriver]
    private readonly timeout = 30000; // milliseconds


    private activeDriver: WalletDriver = this.hashpackDriver
    private readonly connectedRef = ref(false)
    private readonly walletNameRef = ref(this.activeDriver.name)
    private readonly accountIdRef = ref<string|null>(null)
    private readonly hederaWalletRef = ref<boolean>(this.activeDriver instanceof WalletDriver_Hedera)

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
            this.walletNameRef.value = this.activeDriver.name
            this.hederaWalletRef.value = this.activeDriver instanceof WalletDriver_Hedera
        }
    }

    public connected = computed(() => this.connectedRef.value)

    public accountId = computed(() => this.accountIdRef.value)

    public walletName = computed(() => this.walletNameRef.value)

    public isHederaWallet = computed(() => this.hederaWalletRef.value)

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
        if (this.activeDriver instanceof WalletDriver_Hedera) {
            return this.activeDriver.changeStaking(nodeId, accountId, declineReward)
        } else {
            throw this.activeDriver.unsupportedOperation()
        }
    }

    public async approveHbarAllowance(spender: string, amount: number): Promise<string> {
        if (this.activeDriver instanceof WalletDriver_Hedera) {
            return this.activeDriver.approveHbarAllowance(spender, amount)
        } else {
            throw this.activeDriver.unsupportedOperation()
        }
    }

    public async approveTokenAllowance(token: string, spender: string, amount: number): Promise<string> {
        if (this.activeDriver instanceof WalletDriver_Hedera) {
            return this.activeDriver.approveTokenAllowance(token, spender, amount)
        } else {
            throw this.activeDriver.unsupportedOperation()
        }
    }

    public async approveNFTAllowance(token: string, spender: string, serialNumbers: number[]): Promise<string> {
        if (this.activeDriver instanceof WalletDriver_Hedera) {
            return this.activeDriver.approveNFTAllowance(token, spender, serialNumbers)
        } else {
            throw this.activeDriver.unsupportedOperation()
        }
    }

    public async associateToken(tokenId: string): Promise<string> {
        return this.activeDriver.associateToken(tokenId)
    }

    public async dissociateToken(tokenId: string): Promise<string> {
        return this.activeDriver.dissociateToken(tokenId)
    }


    //
    // public async deleteNftAllowance(token: string, serialNumbers: number[]): Promise<string> {
    //     if (this.activeDriver instanceof WalletDriver_Hedera) {
    //         await this.activeDriver.deleteNftAllowance(token, spender, amount)
    //     } else {
    //         throw this.activeDriver.unsupportedOperation()
    //     }
    // }

}
