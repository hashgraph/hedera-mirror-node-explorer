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

import { computed, ref, watch } from "vue";
import {
    AccountAllowanceApproveTransaction,
    AccountAllowanceDeleteTransaction,
    AccountUpdateTransaction,
    NftId,
    TokenId,
} from "@hashgraph/sdk";
import { RouteManager } from "@/utils/RouteManager";
import { WalletDriver } from "@/utils/wallet/WalletDriver";
import { WalletDriver_Blade } from "@/utils/wallet/WalletDriver_Blade";
import { WalletDriver_Hashpack } from "@/utils/wallet/WalletDriver_Hashpack";
import { timeGuard, TimeGuardError } from "@/utils/TimerUtils";

export class WalletManager {
    private readonly routeManager: RouteManager;
    private readonly bladeDriver = new WalletDriver_Blade();
    private readonly hashpackDriver = new WalletDriver_Hashpack();
    private readonly drivers: Array<WalletDriver> = [
        this.bladeDriver,
        this.hashpackDriver,
    ];
    private readonly timeout = 30000; // milliseconds

    private readonly connectedRef = ref(false);
    private readonly accountIdRef = ref<string | null>(null);

    private activeDriver: WalletDriver = this.hashpackDriver;
    private readonly walletNameRef = ref(this.activeDriver.name);

    //
    // Public
    //

    public constructor(routeManager: RouteManager) {
        this.routeManager = routeManager;
        watch(this.routeManager.currentNetwork, () => this.disconnect());
    }

    public getDrivers(): WalletDriver[] {
        return this.drivers;
    }

    public getActiveDriver(): WalletDriver {
        return this.activeDriver;
    }

    public setActiveDriver(newValue: WalletDriver): void {
        if (this.activeDriver != newValue) {
            this.activeDriver = newValue;
            this.connectedRef.value = this.activeDriver.isConnected();
            this.accountIdRef.value = this.activeDriver.getAccountId();
            this.walletNameRef.value = this.activeDriver.name;
        }
    }

    public connected = computed(() => this.connectedRef.value);

    public accountId = computed(() => this.accountIdRef.value);

    public walletName = computed(() => this.walletNameRef.value);

    public async connect(): Promise<void> {
        try {
            await timeGuard(
                this.activeDriver.connect(
                    this.routeManager.currentNetwork.value,
                ),
                this.timeout,
            );
            this.connectedRef.value = this.activeDriver.isConnected();
            this.accountIdRef.value = this.activeDriver.getAccountId();
        } catch (error) {
            if (error instanceof TimeGuardError) {
                this.activeDriver.connectFailure(
                    this.activeDriver.silentMessage(),
                );
            } else {
                throw error;
            }
        }
    }

    public async disconnect(): Promise<void> {
        try {
            await timeGuard(this.activeDriver.disconnect(), this.timeout);
        } catch (error) {
            if (error instanceof TimeGuardError) {
                this.activeDriver.connectFailure(
                    this.activeDriver.silentMessage(),
                );
            } else {
                throw error;
            }
        } finally {
            this.connectedRef.value = false;
            this.accountIdRef.value = null;
        }
    }

    public async changeStaking(
        nodeId: number | null,
        accountId: string | null,
        declineReward: boolean | null,
    ): Promise<string> {
        let result: string;

        // Connects if needed
        await this.connect();

        // Updates account's stakeNodeId
        if (this.accountId.value !== null) {
            const trans = await new AccountUpdateTransaction();
            trans.setAccountId(this.accountId.value);
            if (nodeId !== null) {
                trans.setStakedNodeId(nodeId);
            } else if (accountId !== null) {
                trans.setStakedAccountId(accountId);
            } else {
                trans.setStakedNodeId(-1);
                trans.setStakedAccountId("0.0.0");
            }
            if (declineReward !== null) {
                trans.setDeclineStakingReward(declineReward);
            }

            result = await this.executeTransaction(trans);
        } else {
            throw this.activeDriver.callFailure("No account id");
        }

        return Promise.resolve(result);
    }

    public async approveHbarAllowance(
        spender: string,
        amount: number,
    ): Promise<string> {
        let result: string;

        // Connects if needed
        await this.connect();

        // Approves
        if (this.accountId.value !== null) {
            const trans = new AccountAllowanceApproveTransaction();
            trans.approveHbarAllowance(this.accountId.value, spender, amount);
            result = await this.executeTransaction(trans);
        } else {
            throw this.activeDriver.callFailure("Invalid parameters");
        }

        return Promise.resolve(result);
    }

    public async approveTokenAllowance(
        token: string,
        spender: string,
        amount: number,
    ): Promise<string> {
        let result: string;

        // Connects if needed
        await this.connect();

        // Approves
        if (this.accountId.value !== null) {
            const trans = new AccountAllowanceApproveTransaction();
            trans.approveTokenAllowance(
                token,
                this.accountId.value,
                spender,
                amount,
            );
            result = await this.executeTransaction(trans);
        } else {
            throw this.activeDriver.callFailure("Invalid parameters");
        }

        return Promise.resolve(result);
    }

    public async approveNFTAllowance(
        token: string,
        spender: string,
        serialNumbers: number[],
    ): Promise<string> {
        let result: string;

        // Connects if needed
        await this.connect();

        // Approves
        if (this.accountId.value !== null) {
            const trans = new AccountAllowanceApproveTransaction();
            if (1 <= serialNumbers.length && serialNumbers.length <= 20) {
                const tid = TokenId.fromString(token);
                for (const sn of serialNumbers) {
                    trans.approveTokenNftAllowance(
                        new NftId(tid, sn),
                        this.accountId.value,
                        spender,
                    );
                }
            } else if (serialNumbers.length == 0) {
                trans.approveTokenNftAllowanceAllSerials(
                    token,
                    this.accountId.value,
                    spender,
                );
            } else {
                throw this.activeDriver.callFailure(
                    "Invalid serial number count (" +
                        serialNumbers.length +
                        ")",
                );
            }
            result = await this.executeTransaction(trans);
        } else {
            throw this.activeDriver.callFailure("Invalid parameters");
        }

        return Promise.resolve(result);
    }

    public async deleteNftAllowance(
        token: string,
        serialNumbers: number[],
    ): Promise<string> {
        let result: string;

        // Connects if needed
        await this.connect();

        // Approves
        if (this.accountId.value !== null) {
            const trans = new AccountAllowanceDeleteTransaction();
            if (1 <= serialNumbers.length && serialNumbers.length <= 20) {
                const tid = TokenId.fromString(token);
                for (const sn of serialNumbers) {
                    trans.deleteAllTokenNftAllowances(
                        new NftId(tid, sn),
                        this.accountId.value,
                    );
                }
            } else {
                throw this.activeDriver.callFailure(
                    "Invalid serial number count (" +
                        serialNumbers.length +
                        ")",
                );
            }
            result = await this.executeTransaction(trans);
        } else {
            throw this.activeDriver.callFailure("Invalid parameters");
        }

        return Promise.resolve(result);
    }

    //
    // Private
    //

    protected async executeTransaction(
        t:
            | AccountUpdateTransaction
            | AccountAllowanceApproveTransaction
            | AccountAllowanceDeleteTransaction,
    ): Promise<string> {
        let result: string;
        try {
            result = await timeGuard(
                this.activeDriver.executeTransaction(t),
                this.timeout,
            );
        } catch (error) {
            if (error instanceof TimeGuardError) {
                throw this.activeDriver.callFailure(
                    this.activeDriver.silentMessage(),
                );
            } else {
                throw error;
            }
        }
        return Promise.resolve(result);
    }
}
