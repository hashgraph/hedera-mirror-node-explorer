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

import {KeyOperator, SortOrder, TableController} from "@/utils/table/TableController";
import {Transaction, TransactionResponse} from "@/schemas/HederaSchemas";
import {ComputedRef, ref, Ref} from "vue";
import axios, {AxiosResponse} from "axios";
import {Router} from "vue-router";
import {fetchStringQueryParam} from "@/utils/RouteManager";


export class TransactionTableController extends TableController<Transaction, string> {

    private readonly accountId: Ref<string | null>
    private readonly accountIdMandatory: boolean

    public readonly transactionType: Ref<string> = ref("");
    public readonly transactionResult: Ref<string> = ref("");

    //
    // Public
    //

    public constructor(router: Router, accountId: Ref<string | null>, pageSize: ComputedRef<number>,
                       accountIdMandatory: boolean,
                       pageParamName = "p", keyParamName= "k") {
        super(router, pageSize, 10 * pageSize.value, 5000, 10, 100,
            pageParamName, keyParamName);
        this.accountId = accountId
        this.accountIdMandatory = accountIdMandatory
        this.watchAndReload([this.accountId, this.transactionType, this.transactionResult])
    }

    //
    // TableController
    //

    public async load(consensusTimestamp: string | null, operator: KeyOperator,
                      order: SortOrder, limit: number): Promise<Transaction[] | null> {
        let result: Promise<Transaction[] | null>

        if (this.accountIdMandatory && this.accountId.value === null) {
            result = Promise.resolve(null)
        } else {
            const params = {} as {
                limit: number
                order: string
                "account.id": string | undefined
                transactiontype: string | undefined
                result: string | undefined
                timestamp: string | undefined
            }
            params.limit = limit
            params.order = order
            if (this.accountId.value !== null) {
                params["account.id"] = this.accountId.value
            }
            if (this.transactionType.value != "") {
                params.transactiontype = this.transactionType.value
            }
            if (this.transactionResult.value != "") {
                params.result = this.transactionResult.value
            }
            if (consensusTimestamp !== null) {
                params.timestamp = operator + ":" + consensusTimestamp
            }
            const cb = (r: AxiosResponse<TransactionResponse>): Promise<Transaction[] | null> => {
                return Promise.resolve(r.data.transactions ?? [])
            }
            result = axios.get<TransactionResponse>("api/v1/transactions", {params: params}).then(cb)
        }

        return result
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
