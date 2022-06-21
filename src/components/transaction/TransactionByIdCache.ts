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

import {EntityCacheV2} from "@/utils/EntityCacheV2";
import {Transaction, TransactionByIdResponse, TransactionResponse} from "@/schemas/HederaSchemas";
import axios, {AxiosResponse} from "axios";
import {computed, Ref, ref, watch} from "vue";

export class TransactionByIdCache extends EntityCacheV2<TransactionByIdResponse> {

    public readonly transactionId = ref<string|null>(null)
    private readonly limit: number

    //
    // Public
    //

    public constructor(limit = 100) {
        super(5000, 10)
        this.limit = limit
        watch(this.transactionId, () => this.clear())
    }

    public readonly transactions: Ref<Array<Transaction>> = computed(() => {
        return this.response.value?.data?.transactions ?? []
    })


    //
    // EntityCache
    //

    protected load(): Promise<AxiosResponse<TransactionByIdResponse>> {
        let result: Promise<AxiosResponse<TransactionByIdResponse>>
        if (this.transactionId.value !== null) {
            result = axios.get<TransactionResponse>("api/v1/transactions/" + this.transactionId.value )
        } else {
            result = Promise.reject("transactionId is null")
        }
        return result
    }
}
