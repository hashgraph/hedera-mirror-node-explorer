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
import {computed, Ref} from "vue";
import {TransactionCacheV2} from "@/components/transaction/TransactionCacheV2";

export class RewardsTransactionCache extends TransactionCacheV2 {

    private static rewardAccountId = "0.0.46822468"

    //
    // Public
    //

    public constructor(limit = 100) {
        super(limit)
    }

    public readonly filteredTransactions: Ref<Array<Transaction>> = computed(() => {
        const result: Array<Transaction> = []
        for (const t of this.transactions.value) {
            if (RewardsTransactionCache.filterTransaction(t)) {
                result.push(t)
            }
        }
        return result
    })

    private static filterTransaction(transaction: Transaction): boolean {
        let result = false
        if (transaction.transfers) {
            for (const t of transaction.transfers) {
                if (t.account === RewardsTransactionCache.rewardAccountId && t.amount < 0) {
                    result = true
                    break
                }
            }
        }
        return result
    }
}
