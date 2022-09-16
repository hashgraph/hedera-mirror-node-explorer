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

import {TableController} from "@/utils/table/TableController";
import {Transaction, TransactionResponse} from "@/schemas/HederaSchemas";
import {Ref} from "vue";
import axios, {AxiosResponse} from "axios";


export class RewardsTransactionTableController extends TableController<Transaction, string> {

    public readonly accountId: Ref<string|null>

    //
    // Public
    //

    public constructor(accountId: Ref<string|null>, pageSize: Ref<number>) {
        super(pageSize, 10 * pageSize.value, 5000, 10, 100);
        this.accountId = accountId
        this.watchAndReload([this.accountId])
    }

    //
    // TableController
    //

    public async loadAfter(consensusTimestamp: string|null, limit: number): Promise<Transaction[]|null> {
        return this.safeLoadAfter(consensusTimestamp, limit, 10)
    }

    public async loadBefore(consensusTimestamp: string, limit: number): Promise<Transaction[]|null> {
        return this.loadBetween(null, consensusTimestamp, limit)
    }

    public keyFor(row: Transaction): string {
        return row.consensus_timestamp ?? ""
    }

    //
    // Private
    //

    private safeLoadAfter(consensusTimestamp: string|null, limit: number, countDown: number): Promise<Transaction[]|null> {
        let result: Promise<Transaction[]|null>

        const accountId = this.accountId.value
        if (accountId === null) {
            result = Promise.resolve(null)
        } else if (countDown == 0) {
            result = Promise.resolve([])
        } else {
            const params = {} as {
                limit: number
                "account.id": string | undefined
                timestamp: string | undefined
            }
            params.limit = limit
            params["account.id"] = accountId
            if (consensusTimestamp !== null) {
                params.timestamp = "lt:" + consensusTimestamp
            }
            const cb = (r: AxiosResponse<TransactionResponse>): Promise<Transaction[]|null> =>{
                let result: Promise<Transaction[]|null>
                const loadedTxs = r.data.transactions ?? []
                const drained = loadedTxs.length < limit
                const matchingTxs = RewardsTransactionTableController.filterTransactions(loadedTxs, accountId)
                const nextLimit = limit - matchingTxs.length
                if (drained || loadedTxs.length == matchingTxs.length || nextLimit == 0) {
                    result = Promise.resolve(matchingTxs)
                } else {
                    const lastTimestamp = this.keyFor(loadedTxs[loadedTxs.length - 1])
                    const resolve = (r: Transaction[]|null) =>  {
                        return Promise.resolve(r !== null ? matchingTxs.concat(r) : null)
                    }
                    result = this.safeLoadAfter(lastTimestamp, nextLimit, countDown - 1).then(resolve)
                }
                return result
            }
            result = axios.get<TransactionResponse>("api/v1/transactions", { params: params} ).then(cb)
        }

        return result
    }

    private loadBetween(ltTimestamp: string|null, gteTimestamp: string, limit: number): Promise<Transaction[]|null> {
        let result: Promise<Transaction[]|null>

        const accountId = this.accountId.value
        if (accountId === null) {
            result = Promise.resolve(null)
        } else {
            const params = "limit=" + limit
                + "&account.id=" + accountId
                + "&gteTimestamp=lt:" + ltTimestamp
                + (ltTimestamp !== null ? "&timestamp=lt:" + ltTimestamp : "")
            const cb = (r: AxiosResponse<TransactionResponse>): Promise<Transaction[]|null> =>{
                let result: Promise<Transaction[]|null>
                const loadedTxs = r.data.transactions ?? []
                const drained = loadedTxs.length < limit
                const matchingTxs = RewardsTransactionTableController.filterTransactions(loadedTxs, accountId)
                const nextLimit = limit - matchingTxs.length
                if (drained || loadedTxs.length == matchingTxs.length || nextLimit == 0) {
                    result = Promise.resolve(matchingTxs)
                } else {
                    const lastTimestamp = this.keyFor(loadedTxs[loadedTxs.length - 1])
                    if (lastTimestamp != gteTimestamp) {
                        const resolve = (r: Transaction[]|null) =>  {
                            return Promise.resolve(r !== null ? matchingTxs.concat(r) : null)
                        }
                        result = this.loadBetween(lastTimestamp, gteTimestamp, nextLimit).then(resolve)
                    } else {
                        result = Promise.resolve(matchingTxs)
                    }
                }
                return result
            }
            result = axios.get<TransactionResponse>("api/v1/transactions?" + params ).then(cb)
        }

        return result
    }

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
