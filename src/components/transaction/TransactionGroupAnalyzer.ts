// SPDX-License-Identifier: Apache-2.0

import {computed, Ref} from "vue";
import {TransactionDetail, TransactionType} from "@/schemas/MirrorNodeSchemas";

export class TransactionGroupAnalyzer {

    public readonly transactions: Ref<TransactionDetail[] | null>

    //
    // Public
    //

    public constructor(transactions: Ref<TransactionDetail[] | null>) {
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
        return this.childTransactions.value.length ? result : null
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
        let result: TransactionDetail | null = null
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

