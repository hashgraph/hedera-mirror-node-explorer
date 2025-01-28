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

import {computed, ref} from "vue";
import {TaskController} from "@/dialogs/core/task/TaskController.ts";
import {TransactionID} from "@/utils/TransactionID.ts";
import {TransactionByIdCache} from "@/utils/cache/TransactionByIdCache.ts";
import {TransactionDetail} from "@/schemas/MirrorNodeSchemas.ts";
import {WalletClientRejectError} from "@/utils/wallet/client/WalletClient.ts";
import {isSuccessfulResult} from "@/utils/TransactionTools.ts";

export abstract class TransactionGroupController extends TaskController {

    public readonly transactionPromises  = ref<Promise<string|null>[]>([])
    public readonly transactionResults = ref<(TransactionDetail|string|null)[]>([])
    public readonly transactionErrors = ref<unknown[]>([])

    //
    // Public
    //

    public readonly transactionCount = computed(
        () => this.transactionResults.value.length + this.transactionErrors.value.length)

    public readonly errorCount = computed(() => this.transactionErrors.value.length)

    public readonly successStatusCount = computed(() => {
        let result = 0
        for (const r of this.transactionResults.value) {
            if (typeof r === "object") {
                const td = r as TransactionDetail
                if (isSuccessfulResult(td.result)) {
                    result += 1
                }
            }
        }
        return result
    })

    public readonly failureStatusCount = computed(() => {
        let result = 0
        for (const r of this.transactionResults.value) {
            if (typeof r === "object") {
                const td = r as TransactionDetail
                if (!isSuccessfulResult(td.result)) {
                    result += 1
                }
            }
        }
        return result
    })

    public readonly unknownStatusCount = computed(() => {
        let result = 0
        for (const r of this.transactionResults.value) {
            if (typeof r != "object") { // r is a transaction id
                result += 1
            }
        }
        return result
    })

    public readonly mainFeedback = computed(() => {
        let result: string
        const transactionCount = this.transactionCount.value
        if (this.errorCount.value === transactionCount) {
            // All transactions have throw an error
            result = "Operation failed"
        } else if (this.successStatusCount.value === transactionCount) {
            // All transactions have been executed and returned a successful status
            result = "Operation completed successfully"
        } else if (this.failureStatusCount.value === transactionCount) {
            // All transactions have been executed and returned a failed status
            result = "Operation completed with failures"
        } else if (this.unknownStatusCount.value === transactionCount) {
            // All transactions have been executed but are not yet available through mirror node
            result = "Operation completed. Transaction statuses will be available soon."
        } else {
            result = "Operation has been executed partially"
        }
        return result
    })

    public readonly extraFeedback = computed(() => {
        let result: string|null
        if (this.successStatusCount.value == this.transactionCount.value) {
            result = null
        } else {
            result = ""
            if (this.successStatusCount.value >= 1) {
                result = this.successStatusCount.value + " have completed successfully. "
            }
            if (this.failureStatusCount.value >= 1) {
                result = this.failureStatusCount.value + " have completed but unsuccessfully. "
            }
            if (this.unknownStatusCount.value >= 1) {
                result = this.unknownStatusCount.value + " have completed without a known status. "
            }
        }
        return result
    })

    //
    // To be subclassed
    //

    protected abstract makeTransactions(): Promise<string|null>[]


    //
    // TaskController
    //

    public async execute(): Promise<void> {

        this.transactionPromises.value = this.makeTransactions()

        let rejected = false
        const transactionIds: (string|null)[] = []
        for (const t of this.transactionPromises.value) {
            try {
                const tid = await t
                transactionIds.push(tid)
            } catch(error) {
                if (error instanceof WalletClientRejectError) {
                    rejected = true
                    break
                } else {
                    this.transactionErrors.value.push(error)
                }
            }
        }

        for (const t of transactionIds) {
            if (t === null) {
                this.transactionResults.value.push(t)
            } else { // t is a transaction id
                const tid = TransactionID.normalize(t)
                const td = await TransactionByIdCache.instance.lookup(tid)
                if (td == null) {
                    this.transactionResults.value.push(td)
                } else {
                    this.transactionResults.value.push(tid)
                }
            }
        }

        if (rejected && this.transactionResults.value.length == 0 && this.transactionErrors.value.length == 0) {
            // User has rejected the first transaction => task did not start at all => we close dialog silently
            this.showDialog.value = false
        }
    }

}
