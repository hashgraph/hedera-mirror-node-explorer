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
import {Transaction, TransactionResponse} from "@/schemas/HederaSchemas";
import axios, {AxiosResponse} from "axios";
import {computed, ref, Ref, watch} from "vue";

export class TransactionCacheV2 extends EntityCacheV2<TransactionResponse> {

    public readonly accountId: Ref<string> = ref("");
    public readonly transactionType: Ref<string> = ref("");
    public readonly transactionResult: Ref<string> = ref("");

    private readonly limit: number

    //
    // Public
    //

    public constructor(limit = 100) {
        super(5000, 10)
        this.limit = limit

        watch(() => this.accountId, () => this.clear)
        watch(() => this.transactionType, () => this.clear)
        watch(() => this.transactionResult, () => this.clear)
    }

    public readonly lastTimestamp = computed(() => {
        let result: string
        const transactions = this.transactions.value
        if (transactions && transactions.length >= 1) {
            result = transactions[0].consensus_timestamp ?? ""
        } else {
            result = ""
        }
        return result
    })

    public readonly transactions: Ref<Array<Transaction>> = computed(() => {
        return this.response.value?.data?.transactions ?? []
    })

    //
    // EntityCache
    //

    protected load(): Promise<AxiosResponse<TransactionResponse>> {

        const params = {} as {
            limit: number
            "account.id": string | undefined
            transactiontype: string | undefined
            result: string | undefined
            timestamp: string | undefined
        }
        params.limit = this.limit
        if (this.accountId.value != "") {
            params["account.id"] = this.accountId.value
        }
        if (this.transactionType.value != "") {
            params.transactiontype = this.transactionType.value
        }
        if (this.transactionResult.value != "") {
            params.result = this.transactionResult.value
        }
        if (this.lastTimestamp.value != "") {
            params.timestamp = "gt:" + this.lastTimestamp.value
        }
        return axios
            .get<TransactionResponse>("api/v1/transactions", { params: params} )
            .then(response => this.mergeResponse(response, this.lastTimestamp.value))
    }

    //
    // EntityCache
    //

    private mergeResponse( next: AxiosResponse<TransactionResponse>, lastTimestamp: string|null) :
        AxiosResponse<TransactionResponse> {

        const prev = this.response.value
        if (prev != null && lastTimestamp != null) {
            const prevTransactions = prev.data.transactions ?? Array<Transaction>()
            const nextTransactions = next.data.transactions ?? Array<Transaction>()
            const survivorCount = Math.max(0, prevTransactions.length - nextTransactions.length)
            const survivors = prevTransactions.slice(0, survivorCount)
            next.data.transactions = nextTransactions.concat(survivors)
        }

        return next
    }
}
