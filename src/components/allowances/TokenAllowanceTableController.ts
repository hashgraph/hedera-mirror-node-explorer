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
import {TokenAllowance, TokenAllowancesResponse} from "@/schemas/HederaSchemas";
import {Ref} from "vue";
import axios, {AxiosResponse} from "axios";
import {Router} from "vue-router";

export class TokenAllowanceTableController extends TableController<TokenAllowance, string> {

    //
    // Public
    //

    public readonly accountId: Ref<string | null>

    public constructor(
        router: Router,
        accountId: Ref<string | null>,
        pageSize: Ref<number>,
        pageParamName = "p", keyParamName = "k"
    ) {
        super(router, pageSize, 10 * pageSize.value, 5000, 0, 100,
            pageParamName, keyParamName);
        this.accountId = accountId
        this.watchAndReload([this.accountId, this.pageSize])
    }

    //
    // TableController
    //

    public async load(
        key: string | null,
        operator: KeyOperator,
        order: SortOrder,
        limit: number
    ): Promise<TokenAllowance[] | null> {
        let result: Promise<TokenAllowance[] | null>

        if (this.accountId.value === null) {
            result = Promise.resolve(null)
        } else {
            const params = {} as {
                limit: number
                order: string
                "spender.id": string | undefined
                "token.id": string | undefined
            }
            params.limit = limit
            params.order = TableController.invertSortOrder(order)
            if (key !== null) {
                const items = key.split('-')
                const spender = items[0] ?? null
                const token = items[1] ?? null
                if (params.order === SortOrder.ASC) {
                    params["spender.id"] = spender ? KeyOperator.gte + ":" + spender : undefined
                    params["token.id"] = token ? KeyOperator.gt + ":" + token : undefined
                } else {
                    params["spender.id"] = spender ? KeyOperator.lte + ":" + spender : undefined
                    params["token.id"] = token ? KeyOperator.lt + ":" + token : undefined
                }
            }
            const cb = (r: AxiosResponse<TokenAllowancesResponse>): Promise<TokenAllowance[] | null> => {
                return Promise.resolve(r.data.allowances ?? [])
            }
            result = axios.get<TokenAllowancesResponse>("api/v1/accounts/" + this.accountId.value + "/allowances/tokens", {params: params})
                .then(cb)
        }

        return result
    }

    public keyFor(row: TokenAllowance): string {
        return row.spender && row.token_id ? `${row.spender}-${row.token_id}` : ""
    }

    public keyFromString(s: string): string | null {
        return s
    }

    public stringFromKey(key: string): string {
        return key
    }

}
