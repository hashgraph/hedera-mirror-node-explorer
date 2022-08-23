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

import {EntityLoader} from "@/utils/EntityLoader";
import {TransactionResponse} from "@/schemas/HederaSchemas";
import {ref, watch, Ref, computed} from "vue";
import axios, {AxiosResponse} from "axios";

export class BlockTransactionsLoader extends EntityLoader<TransactionResponse> {

    //
    // Public
    //

    public constructor() {
        super()
        watch([this.timestamp, this.limit], () => this.requestLoad())
    }

    public transactions = computed(() => this.entity.value?.transactions ?? [])

    public readonly timestamp: Ref<string|null> = ref(null)
    public readonly limit: Ref<number|null> = ref(null)

    //
    // EntityLoader
    //

    protected async load(): Promise<AxiosResponse<TransactionResponse>|null> {
        let result: Promise<AxiosResponse<TransactionResponse>|null>
        if (this.limit.value && this.timestamp.value) {
            const params = {} as {
                limit: number,
                timestamp: string
            }
            params.limit = Math.min(this.limit.value ?? 0, 100)
            params.timestamp = "lte:" + this.timestamp.value
            result = axios.get<TransactionResponse>("api/v1/transactions", { params: params} )
        } else {
            result = Promise.resolve(null)
        }
        return result
    }
}
