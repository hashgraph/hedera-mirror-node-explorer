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

import {EntityCache} from "@/utils/EntityCache";
import {Transaction, TransactionResponse} from "@/schemas/HederaSchemas";
import axios, {AxiosResponse} from "axios";

export class TransactionCache extends EntityCache<TransactionResponse> {

    private accountId: string|null = null
    private transactionType: string|null = null
    private transactionResult: string|null = null
    private readonly limit: number

    //
    // Public
    //

    public constructor(limit = 100) {
        super(5000, 10)
        this.limit = limit
    }

    public setAccountId(newValue: string|null): void {
        this.accountId = newValue
        this.clear()
    }

    public setTransactionType(newValue: string|null): void {
        this.transactionType = newValue
        this.clear()
    }

    public setTransactionResult(newValue: string|null): void {
        this.transactionResult = newValue
        this.clear()
    }

    public getLastTimestamp(): string|null {
        let result: string|null
        const transactions = this.getEntity()?.transactions
        if (transactions != null && transactions.length >= 1) {
            result = transactions[0].consensus_timestamp ?? null
        } else {
            result = null
        }
        return result
    }


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
        if (this.accountId != null && this.accountId.length > 0) {
            params["account.id"] = this.accountId
        }
        if (this.transactionType != null && this.transactionType.length > 0) {
            params.transactiontype = this.transactionType
        }
        if (this.transactionResult != null && this.transactionResult.length > 0) {
            params.result = this.transactionResult
        }
        const lastTimestamp = this.getLastTimestamp()
        if (lastTimestamp != null) {
            params.timestamp = "gt:" + lastTimestamp
        }
        return axios
            .get<TransactionResponse>("api/v1/transactions", { params: params} )
            .then(response => this.mergeResponse(response, lastTimestamp))
    }

    //
    // EntityCache
    //

    private mergeResponse( next: AxiosResponse<TransactionResponse>, lastTimestamp: string|null) :
        AxiosResponse<TransactionResponse> {

        const prev = this.getResponse()
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
