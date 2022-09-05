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

import {TableController} from "@/utils/table/TableController";
import {Transaction, TransactionResponse} from "@/schemas/HederaSchemas";
import {Ref} from "vue";
import axios, {AxiosResponse} from "axios";


export class TransactionTableController extends TableController<TransactionResponse, Transaction> {

    private readonly accountId: Ref<string|null>

    //
    // Public
    //

    public constructor(accountId: Ref<string|null>, autoRefresh: Ref<boolean>, pageSize: number) {
        super(pageSize, 10 * pageSize, 5000, 10);
        this.accountId = accountId
        this.watchAndReload([this.accountId])
    }

    //
    // TableController
    //

    public async loadLatest(previous: TransactionResponse|null): Promise<AxiosResponse<TransactionResponse>|null> {

        const params = {} as {
            limit: number
            "account.id": string | undefined
            // transactiontype: string | undefined
            // result: string | undefined
            timestamp: string | undefined
        }
        params.limit = this.pageSize
        if (this.accountId.value !== null) {
            params["account.id"] = this.accountId.value
        }
        if (previous !== null) {
            const transactions = previous?.transactions ?? []
            const lastTimestamp = transactions.length >= 1 ? transactions[0].consensus_timestamp : null
            if (lastTimestamp) {
                params.timestamp = "gt:" + lastTimestamp
            }
        }
        return axios
            .get<TransactionResponse>("api/v1/transactions", { params: params} )
    }

    public fetchRows(entity: TransactionResponse): Transaction[] {
        return entity.transactions ?? []
    }

    public nextURL(entity: TransactionResponse): string|null {
        return entity.links?.next ?? null
    }

    public mergeResponse( current: TransactionResponse, latest: TransactionResponse) : TransactionResponse {

        const currentTransactions = current.transactions ?? Array<Transaction>()
        const latestTransactions = latest.transactions ?? Array<Transaction>()
        const candidateTransactions = latestTransactions.concat(currentTransactions)
        current.transactions = candidateTransactions.slice(0, this.pageSize) // We mutate current to preserve next link

        return current
    }


}
