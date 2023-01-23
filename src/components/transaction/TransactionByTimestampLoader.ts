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

import {Transaction, TransactionResponse} from "@/schemas/HederaSchemas";
import {EntityLoader} from "@/utils/loader/EntityLoader";
import {computed, ComputedRef, Ref} from "vue";
import axios, {AxiosResponse} from "axios";
import {TransactionID} from "@/utils/TransactionID";

export class TransactionByTimestampLoader extends EntityLoader<TransactionResponse> {

    public readonly timestamp: ComputedRef<string|null>

    //
    // Public
    //

    public constructor(timestamp: ComputedRef<string|null>) {
        super()
        this.timestamp = timestamp
        this.watchAndReload([this.timestamp])
    }

    public readonly transaction: Ref<Transaction | null> = computed(() => {
        return this.entity.value?.transactions && this.entity.value?.transactions.length > 0
            ? this.entity.value?.transactions[0]
            : null
    })

    public readonly transactionId = computed(() => this.transaction.value?.transaction_id ?? null)

    public readonly payerAccountId = computed(() => TransactionID.makePayerID(this.transaction.value?.transaction_id ?? ""))

    public lookupTransfer(contractID: string): number|null {
        let result = null
        if (this.transaction.value?.transfers){
            for (const t of this.transaction.value?.transfers) {
                if (t.account === contractID) {
                    result = t.amount
                    break
                }
            }
        }
        return result
    }

    //
    // EntityLoader
    //

    protected async load(): Promise<AxiosResponse<TransactionResponse>|null> {
        let result: Promise<AxiosResponse<TransactionResponse>|null>
        if (this.timestamp.value != null) {
            result = axios.get<TransactionResponse>("api/v1/transactions?timestamp=" + this.timestamp.value)
        } else {
            result = Promise.resolve(null)
        }
        return result
    }
}