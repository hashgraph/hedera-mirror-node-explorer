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
import {drainTransactions} from "@/schemas/HederaUtils";
import {ref, Ref} from "vue";
import axios from "axios";
import {Router} from "vue-router";


export class TransactionTableController extends TableController<Transaction, string> {

    private readonly accountId: Ref<string | null>
    private readonly transactionType: string
    private readonly transactionResult: string

    //
    // Public
    //

    public constructor(router: Router, pageSize: Ref<number>,
                       transactionType = "",
                       transactionResult = "",
                       storageKey: string | null,
                       pageParamName = "p",
                       keyParamName = "k",
                       accountId: Ref<string | null> = ref(null)) {
        super(
            router,
            pageSize,
            10 * pageSize.value,
            TableController.FAST_REFRESH_PERIOD,
            TableController.FAST_REFRESH_COUNT,
            100,
            pageParamName,
            keyParamName
        );
        this.transactionType = transactionType
        this.transactionResult = transactionResult
        this.accountId = accountId
        this.storageKey = storageKey
        this.watchAndReload([this.accountId, this.pageSize])
    }

    public storageKey: string | null

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
            "account.id": string | undefined
        }
        params.limit = limit
        params.order = order
        if (this.transactionType != "") {
            params.transactiontype = this.transactionType
        }
        if (this.transactionResult != "") {
            params.result = this.transactionResult
        }
        if (this.accountId.value !== null) {
            params["account.id"] = this.accountId.value
        }
        if (consensusTimestamp !== null) {
            params.timestamp = operator + ":" + consensusTimestamp
        }
        const r = await axios.get<TransactionResponse>("api/v1/transactions", {params: params})
        const result = await drainTransactions(r.data, limit)

        return Promise.resolve(result)
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


