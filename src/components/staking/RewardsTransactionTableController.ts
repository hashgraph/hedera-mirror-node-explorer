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

import {KeyOperator, SortOrder, TableControllerV3} from "@/utils/table/TableControllerV3";
import {Transaction, TransactionResponse} from "@/schemas/HederaSchemas";
import {ComputedRef, Ref} from "vue";
import axios, {AxiosResponse} from "axios";
import {Router} from "vue-router";


export class RewardsTransactionTableController extends TableControllerV3<Transaction, string> {

    public readonly accountId: Ref<string|null>

    //
    // Public
    //

    public constructor(router: Router, accountId: Ref<string|null>, pageSize: ComputedRef<number>) {
        super(router, pageSize, 10 * pageSize.value, 5000, 10, 100);
        this.accountId = accountId
        this.watchAndReload([this.accountId])
    }

    //
    // TableController
    //

    public async load(consensusTimestamp: string | null, operator: KeyOperator,
                      order: SortOrder, limit: number): Promise<Transaction[] | null> {
        let result: Promise<Transaction[] | null>

        const accountId = this.accountId.value
        if (accountId === null) {
            result = Promise.resolve(null)
        } else {
            const params = {} as {
                limit: number
                "account.id": string | undefined
                timestamp: string | undefined
            }
            params.limit = this.maxLimit // Note : we ask maximum because we are going to filter result
            params["account.id"] = accountId
            if (consensusTimestamp !== null) {
                params.timestamp = "lt:" + consensusTimestamp
            }
            const cb = (r: AxiosResponse<TransactionResponse>): Promise<Transaction[] | null> => {
                const loadedTxs = r.data.transactions ?? []
                const matchingTxs = RewardsTransactionTableController.filterTransactions(loadedTxs, accountId)
                const resultTxs = matchingTxs.slice(0, limit)
                return Promise.resolve(resultTxs)
            }
            result = axios.get<TransactionResponse>("api/v1/transactions", {params: params}).then(cb)
        }

        return result
    }

    public keyFor(row: Transaction): string {
        return row.consensus_timestamp ?? ""
    }

    public keyFromString(s: string): string | null {
        return s
    }

    public stringFromKey(key: string): string {
        return key
    }

    //
    // Private
    //

    private static rewardAccountId = "0.0.800"

    private static filterTransactions(input: Array<Transaction>, accountId: string): Array<Transaction> {
        const result: Array<Transaction> = []
        for (const t of input) {
            if (RewardsTransactionTableController.getAmountRewarded(t, accountId) > 0) {
                result.push(t)
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
