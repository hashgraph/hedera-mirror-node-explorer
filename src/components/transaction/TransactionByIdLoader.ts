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

import {Transaction, TransactionByIdResponse} from "@/schemas/HederaSchemas";
import {EntityLoader} from "@/utils/loader/EntityLoader";
import {computed, ComputedRef, Ref} from "vue";
import axios, {AxiosResponse} from "axios";

export class TransactionByIdLoader extends EntityLoader<TransactionByIdResponse> {

    public readonly transactionId: ComputedRef<string|null>

    //
    // Public
    //

    public constructor(transactionId: ComputedRef<string|null>) {
        super()
        this.transactionId = transactionId
    }

    public readonly transactions: Ref<Array<Transaction>> = computed(() => {
        return this.entity.value?.transactions ?? []
    })

    //
    // EntityLoader
    //

    protected async load(): Promise<AxiosResponse<TransactionByIdResponse>|null> {
        let result: Promise<AxiosResponse<TransactionByIdResponse>|null>
        if (this.transactionId.value != null) {
            result = axios.get<TransactionByIdResponse>("api/v1/transactions/" + this.transactionId.value)
        } else {
            result = Promise.resolve(null)
        }
        return result
    }


}