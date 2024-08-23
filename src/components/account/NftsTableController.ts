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

import {Nft, Nfts} from "@/schemas/HederaSchemas";
import {Ref} from "vue";
import axios from "axios";
import {getNonStrictOperator, KeyOperator, SortOrder, TableController} from "@/utils/table/TableController";
import {Router} from "vue-router";
import {TransactionTableController} from "@/components/transaction/TransactionTableController";

export class NftsTableController extends TableController<Nft, string> {

    public readonly accountId: Ref<string | null>

    //
    // Public
    //

    public constructor(
        router: Router,
        accountId: Ref<string | null>,
        pageSize: Ref<number>,
        pageParamName = "p",
        keyParamName = "k"
    ) {
        super(
            router,
            pageSize,
            10 * pageSize.value,
            TableController.SLOW_REFRESH_PERIOD,
            TableController.SLOW_REFRESH_COUNT,
            100,
            pageParamName, keyParamName
        )
        this.accountId = accountId
        this.watchAndReload([this.accountId, this.pageSize])
    }

    //
    // TableController
    //

    public async load(key: string | null, operator: KeyOperator, order: SortOrder, limit: number): Promise<Nft[] | null> {
        if (this.accountId.value == null) {
            return Promise.resolve(null)
        }

        order = TransactionTableController.invertSortOrder(order)
        operator = TransactionTableController.invertKeyOperator(operator)

        const params = {} as {
            limit: number
            "token.id": string | undefined
            serialnumber: string | undefined
            order: string
        }
        params.limit = limit
        params.order = order

        if (key !== null) {
            const items = key.split('-')
            const token = items[0] ?? null
            const serial = items[1] ?? null

            params["token.id"] = token ? `${getNonStrictOperator(operator)}:${token}` : undefined
            params.serialnumber = serial ? `${operator}:${serial}` : undefined
        }

        const url = `api/v1/accounts/${this.accountId.value}/nfts`
        const response = await axios.get<Nfts>(url, {params: params},)

        return Promise.resolve(response.data.nfts ?? null)
    }

    public keyFor(row: Nft): string {
        return row.token_id && row.serial_number ? `${row.token_id}-${row.serial_number}` : ""
    }

    public stringFromKey(key: string): string {
        return key
    }

    public keyFromString(s: string): string | null {
        return s
    }
}
