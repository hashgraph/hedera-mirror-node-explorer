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

import {KeyOperator, SortOrder, TableController} from "@/utils/table/TableController";
import {Transaction, TransactionResponse} from "@/schemas/HederaSchemas";
import {ComputedRef} from "vue";
import axios, {AxiosResponse} from "axios";
import {Router} from "vue-router";


export class TransactionTableController extends TableController<Transaction, string> {

    private readonly transactionType: string
    private readonly transactionResult: string

    //
    // Public
    //

    public constructor(router: Router, pageSize: ComputedRef<number>,
                       transactionType = "",
                       transactionResult= "",
                       pageParamName = "p", keyParamName= "k") {
        super(router, pageSize, 10 * pageSize.value, 5000, 10, 100,
            pageParamName, keyParamName);
        this.transactionType = transactionType
        this.transactionResult = transactionResult
    }

    //
    // TableController
    //

    public async load(consensusTimestamp: string | null, operator: KeyOperator,
                      order: SortOrder, limit: number): Promise<Transaction[] | null> {

        const params = {} as {
            limit: number
            order: string
            transactiontype: string | undefined
            result: string | undefined
            timestamp: string | undefined
        }
        params.limit = limit
        params.order = order
        if (this.transactionType != "") {
            params.transactiontype = this.transactionType
        }
        if (this.transactionResult != "") {
            params.result = this.transactionResult
        }
        if (consensusTimestamp !== null) {
            params.timestamp = operator + ":" + consensusTimestamp
        }
        const cb = (r: AxiosResponse<TransactionResponse>): Promise<Transaction[] | null> => {
            return Promise.resolve(r.data.transactions ?? [])
        }

        return axios.get<TransactionResponse>("api/v1/transactions", {params: params}).then(cb)
    }

    public keyFor(row: Transaction): string {
        return row.consensus_timestamp ?? ""
    }

    public keyFromString(s: string): string | null {
        return s
    }

    public stringFromKey(key: string): string {
        return key
    }
}
