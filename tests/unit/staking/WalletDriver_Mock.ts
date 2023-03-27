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

import {WalletDriver} from "@/utils/wallet/WalletDriver";
import {AccountAllowanceApproveTransaction, AccountUpdateTransaction} from "@hashgraph/sdk";
import {AccountBalanceTransactions} from "@/schemas/HederaSchemas";
import {Signer} from "@hashgraph/sdk/lib/Signer";

export class WalletDriver_Mock extends WalletDriver {

    private static WALLET_NAME = "WalletMock"

    public readonly account: AccountBalanceTransactions
    public readonly transactionId: string

    private connected = false
    private network: string|null = null

    public updateAccountCounter = 0

    //
    // Public
    //

    public constructor(account: AccountBalanceTransactions, transactionId: string) {
        super(WalletDriver_Mock.WALLET_NAME, null)
        this.account = account
        this.transactionId = transactionId
    }


    //
    // WalletDriver
    //

    public async connect(network: string): Promise<void> {
        if (!this.connected) {
            this.connected = true
            this.network = network
        }
    }

    public async disconnect(): Promise<void> {
        if (this.connected) {
            this.connected = false
            this.network = null
        }
    }

    public async executeTransaction(request: AccountUpdateTransaction|AccountAllowanceApproveTransaction): Promise<string> {
        let result: string

        this.updateAccountCounter += 1
        if (this.connected) {
            if (request instanceof AccountUpdateTransaction) {
                const targetAccountID = request.accountId?.toString()
                if (this.account.account == targetAccountID) {
                    if (request.stakedNodeId !== null) {
                        const stakeNodeId = request.stakedNodeId.toNumber()
                        this.account.staked_node_id = stakeNodeId != -1 ? stakeNodeId : null
                        this.account.staked_account_id = null
                        this.account.stake_period_start = "1668124800.000000000"
                    } else if (request.stakedAccountId !== null) {
                        const stakedAccountId = request.stakedAccountId.toString()
                        this.account.staked_node_id = null
                        this.account.staked_account_id = stakedAccountId != "0.0.0" ? stakedAccountId : null
                        this.account.stake_period_start = null
                    }
                    if (!this.account.staked_node_id && !this.account.staked_account_id) {
                        this.account.stake_period_start = null
                    }
                    if (request.declineStakingRewards !== null) {
                        this.account.decline_reward = request.declineStakingRewards
                    }
                    result = this.transactionId
                } else {
                    throw this.callFailure("Unexpected account id: " + targetAccountID)
                }
            } else {
                throw this.callFailure("Unexpected transaction subclass: " + request.constructor.name)
            }
        } else {
            throw this.callFailure("Not connected yet")
        }

        return Promise.resolve(result)
    }

    getSigner(): Signer | null {
        return null
    }

    getAccountId(): string | null {
        return this.connected ? (this.account.account ?? null) : null
    }

    isConnected(): boolean {
        return this.connected
    }
}
