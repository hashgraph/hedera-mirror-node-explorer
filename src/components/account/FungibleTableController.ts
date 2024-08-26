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

import {Token, TokensResponse, TokenType,} from "@/schemas/HederaSchemas";
import {Ref} from "vue";
import axios from "axios";
import {KeyOperator, SortOrder, TableController} from "@/utils/table/TableController";
import {Router} from "vue-router";
import {TransactionTableController} from "@/components/transaction/TransactionTableController";

export class FungibleTableController extends TableController<Token, string> {

    //
    // Public
    //

    public readonly accountId: Ref<string | null>

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
            pageParamName,
            keyParamName
        )
        this.accountId = accountId
        this.watchAndReload([this.accountId, this.pageSize])
    }

    //
    // TableController
    //

    public async load(tokenId: string | null, operator: KeyOperator, order: SortOrder, limit: number): Promise<Token[] | null> {
        let result

        if (this.accountId.value === null) {
            result = Promise.resolve(null)
        } else {
            order = TransactionTableController.invertSortOrder(order)
            operator = TransactionTableController.invertKeyOperator(operator)

            const params = {} as {
                "account.id": string
                limit: number
                "token.id": string | undefined
                order: string
                type: string | undefined
            }
            params["account.id"] = this.accountId.value
            params.limit = limit
            params.order = order
            if (tokenId !== null) {
                params["token.id"] = operator + ":" + tokenId
            }
            params.type = TokenType.FUNGIBLE_COMMON

            const url = `api/v1/tokens`
            const response = await axios.get<TokensResponse>(url, {params: params})
            result = Promise.resolve(response.data.tokens ?? null)
        }
        return result
    }

    public keyFor(row: Token): string {
        return row.token_id ?? ""
    }

    public stringFromKey(key: string): string {
        return key;
    }

    public keyFromString(s: string): string | null {
        return s;
    }
}
