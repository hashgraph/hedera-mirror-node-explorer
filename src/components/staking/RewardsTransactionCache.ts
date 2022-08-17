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

import {Transaction} from "@/schemas/HederaSchemas";
import {ref, Ref, watch} from "vue";
import {TransactionCacheV2} from "@/components/transaction/TransactionCacheV2";
import {EntityCacheV2} from "@/utils/EntityCacheV2";

export class RewardsTransactionCache extends TransactionCacheV2 {

    private static rewardAccountId = "0.0.800"

    //
    // Public
    //

    public constructor(limit = 100) {
        super(limit)
        watch([this.accountId, this.transactions],
            () => this.filterTransactions(), EntityCacheV2.WATCH_OPTIONS)
    }

    public readonly filteredTransactions: Ref<Array<Transaction>> = ref([])

    private filterTransactions(): void {
        const result: Array<Transaction> = []
        for (const t of this.transactions.value) {
            if (RewardsTransactionCache.getAmountRewarded(t, this.accountId.value) > 0) {
                result.push(t)
            }
        }
        this.filteredTransactions.value = result
    }

    public static getAmountRewarded(transaction: Transaction, accountId: string): number {
        let result = 0
        let rewardCandidate = null
        if (transaction.transfers) {
            for (const t of transaction.transfers) {
                if (t.account === RewardsTransactionCache.rewardAccountId && t.amount < 0) {
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
