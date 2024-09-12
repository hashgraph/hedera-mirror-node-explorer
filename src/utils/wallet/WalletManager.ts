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

import {computed, ref, watch} from "vue";
import {RouteManager} from "@/utils/RouteManager";
import {WalletDriver} from "@/utils/wallet/WalletDriver";
import {WalletDriver_Blade} from "@/utils/wallet/WalletDriver_Blade";
import {WalletDriver_Hashpack} from "@/utils/wallet/WalletDriver_Hashpack";
import {timeGuard, TimeGuardError} from "@/utils/TimerUtils";
import {WalletDriver_Hedera} from "@/utils/wallet/WalletDriver_Hedera";
import {WalletDriver_Metamask} from "@/utils/wallet/WalletDriver_Metamask";
import {WalletDriver_Ethereum} from "@/utils/wallet/WalletDriver_Ethereum";
import {WalletDriver_Coinbase} from "@/utils/wallet/WalletDriver_Coinbase";
import {WalletDriver_Brave} from '@/utils/wallet//WalletDriver_Brave';
import {ContractResultDetails} from "@/schemas/HederaSchemas";
import {AccountUpdateTransaction} from "@hashgraph/sdk";

export class WalletManager {

    private readonly routeManager: RouteManager
    private readonly bladeDriver = new WalletDriver_Blade()
    private readonly braveDriver = new WalletDriver_Brave()
    private readonly hashpackDriver = new WalletDriver_Hashpack()
    private readonly metamaskDriver = new WalletDriver_Metamask()
    private readonly coinbaseDriver = new WalletDriver_Coinbase()
    private readonly drivers: Array<WalletDriver> = [
        this.bladeDriver, this.hashpackDriver, this.metamaskDriver, this.coinbaseDriver, this.braveDriver]
    private readonly timeout = 30000; // milliseconds


    private activeDriver: WalletDriver = this.hashpackDriver
    private readonly connectedRef = ref(false)
    private readonly walletNameRef = ref(this.activeDriver.name)
    private readonly accountIdRef = ref<string | null>(null)
    private readonly accountIdsRef = ref<string[]>([])
    private readonly hederaWalletRef = ref<boolean>(this.activeDriver instanceof WalletDriver_Hedera)
    private readonly isEthereumWalletRef = ref<boolean>(this.activeDriver instanceof WalletDriver_Ethereum)

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
            this.connectedRef.value = false
            this.accountIdRef.value = null
            this.walletNameRef.value = this.activeDriver.name
            this.hederaWalletRef.value = this.activeDriver instanceof WalletDriver_Hedera
            this.isEthereumWalletRef.value = this.activeDriver instanceof WalletDriver_Ethereum
        }
    }

    public connected = computed(() => this.connectedRef.value)

    public accountId = computed(() => this.accountIdRef.value)

    public accountIds = computed(() => this.accountIdsRef.value)

    public walletName = computed(() => this.walletNameRef.value)

    public isHederaWallet = computed(() => this.hederaWalletRef.value)

    public isEthereumWallet = computed(() => this.isEthereumWalletRef.value)

    public async connect(): Promise<void> {
        let accountIds: string[]
        try {
            accountIds = await timeGuard(this.activeDriver.connect(this.routeManager.currentNetwork.value), this.timeout)
        } catch (error) {
            if (error instanceof TimeGuardError) {
                throw this.activeDriver.connectFailure(this.activeDriver.silentMessage())
            } else {
                throw error
            }
        }
        if (accountIds.length >= 1) {
            this.connectedRef.value = true
            this.accountIdRef.value = accountIds[0]
            this.accountIdsRef.value = accountIds
        } else {
            await this.activeDriver.disconnect()
            this.connectedRef.value = false
            this.accountIdRef.value = null
            this.accountIdsRef.value = []
            throw this.activeDriver.connectFailure("No Hedera account found in wallet")
        }
    }

    public async disconnect(): Promise<void> {
        try {
            await timeGuard(this.activeDriver.disconnect(), this.timeout)
        } catch (error) {
            if (error instanceof TimeGuardError) {
                this.activeDriver.connectFailure(this.activeDriver.silentMessage())
            } else {
                throw error
            }
        } finally {
            this.connectedRef.value = false
            this.accountIdRef.value = null
            this.accountIdsRef.value = []
        }
    }

    public async changeAccount(accountId: string): Promise<void> {
        if (this.accountIdsRef.value.indexOf(accountId) !== -1) {
            this.accountIdRef.value = accountId
        } else {
            throw this.activeDriver.callFailure("changeAccount")
        }
        return Promise.resolve()
    }

    public async changeStaking(nodeId: number | null, accountId: string | null, declineReward: boolean | null): Promise<string> {
        if (this.accountIdRef.value !== null) {
            if (this.activeDriver instanceof WalletDriver_Hedera) {
                return this.activeDriver.changeStaking(this.accountIdRef.value, nodeId, accountId, declineReward)
            } else {
                throw this.activeDriver.unsupportedOperation()
            }
        } else {
            throw this.activeDriver.callFailure("changeStaking")
        }
    }

    public async updateAccount(transaction: AccountUpdateTransaction): Promise<string> {
        if (this.accountIdRef.value !== null) {
            if (this.activeDriver instanceof WalletDriver_Hedera) {
                return this.activeDriver.updateAccount(this.accountIdRef.value, transaction)
            } else {
                throw this.activeDriver.unsupportedOperation()
            }
        } else {
            throw this.activeDriver.callFailure("updateAccount")
        }
    }

    public async approveHbarAllowance(spender: string, amount: number): Promise<string> {
        if (this.accountIdRef.value !== null) {
            if (this.activeDriver instanceof WalletDriver_Hedera) {
                return this.activeDriver.approveHbarAllowance(this.accountIdRef.value, spender, amount)
            } else {
                throw this.activeDriver.unsupportedOperation()
            }
        } else {
            throw this.activeDriver.callFailure("approveHbarAllowance")
        }
    }

    public async approveTokenAllowance(token: string, spender: string, amount: number): Promise<string> {
        if (this.accountIdRef.value !== null) {
            if (this.activeDriver instanceof WalletDriver_Hedera) {
                return this.activeDriver.approveTokenAllowance(this.accountIdRef.value, token, spender, amount)
            } else {
                throw this.activeDriver.unsupportedOperation()
            }
        } else {
            throw this.activeDriver.callFailure("approveTokenAllowance")
        }
    }

    public async approveNFTAllowance(token: string, spender: string, serialNumbers: number[]): Promise<string> {
        if (this.accountIdRef.value !== null) {
            if (this.activeDriver instanceof WalletDriver_Hedera) {
                return this.activeDriver.approveNFTAllowance(this.accountIdRef.value, token, spender, serialNumbers)
            } else {
                throw this.activeDriver.unsupportedOperation()
            }
        } else {
            throw this.activeDriver.callFailure("approveNFTAllowance")
        }
    }

    public async deleteNftAllowance(token: string, serialNumber: number): Promise<string> {
        if (this.accountIdRef.value !== null) {
            if (this.activeDriver instanceof WalletDriver_Hedera) {
                return this.activeDriver.deleteNftAllowance(this.accountIdRef.value, token, serialNumber)
            } else {
                throw this.activeDriver.unsupportedOperation()
            }
        } else {
            throw this.activeDriver.callFailure("deleteNftAllowance")
        }
    }

    public async deleteNftAllSerialsAllowance(token: string, spender: string): Promise<string> {
        if (this.accountIdRef.value !== null) {
            if (this.activeDriver instanceof WalletDriver_Hedera) {
                return this.activeDriver.deleteNftAllSerialsAllowance(this.accountIdRef.value, token, spender)
            } else {
                throw this.activeDriver.unsupportedOperation()
            }
        } else {
            throw this.activeDriver.callFailure("deleteNftAllSerialsAllowance")
        }
    }

    public async associateToken(tokenId: string): Promise<string> {
        if (this.accountIdRef.value !== null) {
            return this.activeDriver.associateToken(this.accountIdRef.value, tokenId)
        } else {
            throw this.activeDriver.callFailure("associateToken")
        }
    }

    public async dissociateToken(tokenId: string): Promise<string> {
        if (this.accountIdRef.value !== null) {
            return this.activeDriver.dissociateToken(this.accountIdRef.value, tokenId)
        } else {
            throw this.activeDriver.callFailure("dissociateToken")
        }
    }

    public async watchToken(token: string, serialNumber?: string): Promise<void> {
        if (this.accountIdRef.value !== null) {
            if (this.activeDriver instanceof WalletDriver_Ethereum) {
                return this.activeDriver.watchToken(this.accountIdRef.value, token, serialNumber)
            } else {
                throw this.activeDriver.unsupportedOperation()
            }
        } else {
            throw this.activeDriver.callFailure("watchTokenInMetamask")
        }
    }

    public async callContract(contractId: string, contractAddress: string, functionData: string): Promise<ContractResultDetails | string> {
        if (this.accountIdRef.value !== null) {
            return this.activeDriver.callContract(contractId, contractAddress, functionData,
                this.accountIdRef.value)
        } else {
            throw this.activeDriver.callFailure("callContract")
        }
    }

}
