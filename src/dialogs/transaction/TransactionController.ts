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
import {WalletClientError, WalletClientRejectError} from "@/utils/wallet/client/WalletClient.ts";
import {TransactionByIdCache} from "@/utils/cache/TransactionByIdCache.ts";
import {isSuccessfulResult} from "@/utils/TransactionTools.ts";
import {TransactionID} from "@/utils/TransactionID.ts";

export abstract class TransactionController extends TaskController {


    //
    // Public
    //

    public readonly transactionId = ref<string|null>(null)
    public readonly transactionError = ref<unknown>(null)
    public readonly transactionResult = ref<string|null>(null)

    public readonly mainErrorMessage = computed(() => {
        let result: string
        if (this.transactionError.value instanceof WalletClientError) {
            result = this.transactionError.value.message
        } else {
            result = "Operation did not complete"
        }
        return result
    })

    public readonly extraErrorMessage = computed(() => {
        let result: string
        if (this.transactionError.value instanceof WalletClientError) {
            result = this.transactionError.value.extra
        } else {
            result = JSON.stringify(this.transactionError.value)
        }
        return result
    })

    public readonly isFailedResult = computed(() => {
        const r = this.transactionResult.value
        return r !== null && !isSuccessfulResult(r)
    })

    //
    // To be subclassed
    //

    protected async executeTransaction(): Promise<string|null> {
        throw "Must be subclassed"
    }

    //
    // TaskController
    //

    public async execute(): Promise<void> {
        try {
            this.transactionId.value = await this.executeTransaction()
            this.transactionError.value = null
        } catch(error) {
            if (error instanceof WalletClientRejectError) {
                this.transactionId.value = null
                this.transactionError.value = null
                this.showDialog.value = false
            } else {
                this.transactionId.value = null
                this.transactionError.value = error
            }
        }
        if (this.transactionId.value !== null) {
            const tid = TransactionID.normalize(this.transactionId.value)
            const t = await TransactionByIdCache.instance.lookup(tid)
            this.transactionResult.value = t?.result ?? null
        } else {
            this.transactionResult.value = null
        }
    }

}
