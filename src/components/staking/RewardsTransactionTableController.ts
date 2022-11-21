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

import {KeyOperator, SortOrder, TableController} from "@/utils/table/TableController";
import {Reward, RewardResponse, Transaction, TransactionResponse} from "@/schemas/HederaSchemas";
import {ComputedRef, Ref} from "vue";
import axios from "axios";
import {Router} from "vue-router";


export class RewardsTransactionTableController extends TableController<Reward, string> {

    public readonly accountId: Ref<string|null>

    //
    // Public
    //

    public constructor(router: Router, accountId: Ref<string|null>, pageSize: ComputedRef<number>) {
        super(router, pageSize, 10 * pageSize.value, 5000, 0, 100);
        this.accountId = accountId
        this.watchAndReload([this.accountId])
    }

    //
    // TableController
    //

    private mode = Mode.Unknown

    public async load(consensusTimestamp: string | null, operator: KeyOperator,
                      order: SortOrder, limit: number): Promise<Reward[] | null> {
        let result: Reward[] | null

        if (this.mode == Mode.Real || this.mode == Mode.Unknown) {
            try {
                result = await this.loadNextReal(consensusTimestamp, operator, order, limit)
                if (result !== null) {
                    this.mode = Mode.Real
                }
            } catch(error) {
                if (axios.isAxiosError(error) && error.response?.status == 404 && this.mode == Mode.Unknown) {
                    result = await this.loadNextEmulated(consensusTimestamp, operator, order, limit)
                    this.mode = Mode.Simulated
                } else {
                    throw error
                }
            }
        } else {
            result = await this.loadNextEmulated(consensusTimestamp, operator, order, limit)
        }

        return Promise.resolve(result)
    }

    public keyFor(row: Reward): string {
        return row.timestamp ?? ""
    }

    public keyFromString(s: string): string | null {
        return s
    }

    public stringFromKey(key: string): string {
        return key
    }

    //
    // Private (loadNextXXX)
    //

    private async loadNextReal(consensusTimestamp: string | null, operator: KeyOperator,
                         order: SortOrder, limit: number): Promise<Reward[] | null> {
        let result: Reward[] | null

        const accountId = this.accountId.value
        if (accountId === null) {
            result = null
        } else {
            const params = {} as {
                limit: number
                timestamp: string | undefined,
                order: string
            }
            params.limit = limit
            params.order = order
            if (consensusTimestamp !== null) {
                params.timestamp =  operator + ":" + consensusTimestamp
            }
            const url = "api/v1/accounts/" + accountId + "/rewards"
            const response = await axios.get<RewardResponse>(url, {params: params})
            result = response.data.rewards ?? []
        }

        return Promise.resolve(result)
    }

    private async loadNextEmulated(consensusTimestamp: string | null, operator: KeyOperator,
                             order: SortOrder, limit: number): Promise<Reward[] | null> {
        let result: Reward[] | null

        const accountId = this.accountId.value
        if (accountId === null) {
            result = null
        } else {
            const params = {} as {
                limit: number
                "account.id": string | undefined
                timestamp: string | undefined
                order: string
            }
            params.limit = this.maxLimit // Note : we ask maximum because we are going to filter result
            params.order = order
            params["account.id"] = accountId
            if (consensusTimestamp !== null) {
                params.timestamp = operator + ":" + consensusTimestamp
            }
            const response = await axios.get<TransactionResponse>("api/v1/transactions", {params: params})
            const loadedTxs = response.data.transactions ?? []
            const matchingTxs = RewardsTransactionTableController.filterTransactions(loadedTxs, accountId)
            result = matchingTxs.slice(0, limit)
        }

        return Promise.resolve(result)
    }

    //
    // Private
    //

    private static rewardAccountId = "0.0.800"

    private static filterTransactions(input: Array<Transaction>, accountId: string): Array<Reward> {
        const result: Array<Reward> = []
        for (const t of input) {
            const amountRewarded = RewardsTransactionTableController.getAmountRewarded(t, accountId)
            if (amountRewarded > 0) {
                const newReward: Reward = {
                    account_id: accountId,
                    timestamp: t.consensus_timestamp ?? "0",
                    amount: amountRewarded

                }
                result.push(newReward)
            }
        }
        return result
    }

    public static getAmountRewarded(transaction: Transaction, accountId: string): number {
        let result = 0
        let rewardCandidate = null
        if (transaction.transfers) {
            for (const t of transaction.transfers) {
                if (t.account === RewardsTransactionTableController.rewardAccountId && t.amount < 0) {
                    rewardCandidate = Math.abs(t.amount)
                    break
                }
            }
            if (rewardCandidate) {
                for (const t of transaction.transfers) {
                    if (t.amount === rewardCandidate && t.account === accountId) {
                        result = rewardCandidate
                        break
                    }
                }
            }
        }
        return result
    }
}

enum Mode { Unknown, Real, Simulated }
