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

import {computed, Ref} from "vue";
import {TransactionDetail, TransactionType} from "@/schemas/HederaSchemas";

export class TransactionGroupAnalyzer {

    public readonly transactions: Ref<TransactionDetail[]|null>

    //
    // Public
    //

    public constructor(transactions: Ref<TransactionDetail[]|null>) {
        this.transactions = transactions
    }

    public readonly parentTransaction = computed(() => {
        let result: TransactionDetail | null = null
        for (const t of this.transactions.value ?? []) {
            if (t.nonce === 0) {
                result = t
                break
            }
        }
        return result
    })

    public readonly childTransactions = computed(() => {
        const result = new Array<TransactionDetail>()
        for (const t of this.transactions.value ?? []) {
            if (t.parent_consensus_timestamp) {
                result.push(t)
            }
        }
        return result
    })

    public readonly scheduledTransaction = computed(() => {
        let result: TransactionDetail | null = null
        if (this.transactions.value !== null && this.transactions.value.length == 2) {
            for (const t of this.transactions.value) {
                if (t.scheduled) {
                    result = t
                    break
                }
            }
        } else {
            result = null
        }
        return result
    })

    public readonly schedulingTransaction = computed(() => {
        let result: TransactionDetail|null = null
        if (this.transactions.value !== null && this.transactions.value.length == 2) {
            for (const t of this.transactions.value) {
                if (t.name === TransactionType.SCHEDULECREATE) {
                    result = t
                    break
                }
            }
        } else {
            result = null
        }
        return result
    })


}

