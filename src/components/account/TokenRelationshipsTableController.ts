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

import {TokenRelationship, TokenRelationshipResponse,} from "@/schemas/HederaSchemas";
import {Ref} from "vue";
import axios from "axios";
import {KeyOperator, SortOrder, TableController} from "@/utils/table/TableController";
import {Router} from "vue-router";

export class TokenRelationshipsTableController extends TableController<TokenRelationship, string> {

    private readonly accountId: Ref<string | null>

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
            pageParamName,
            keyParamName
        )
        this.accountId = accountId
        this.watchAndReload([this.accountId, this.pageSize])
    }

    //
    // TableController
    //

    public async load(tokenId: string | null, operator: KeyOperator, order: SortOrder, limit: number): Promise<TokenRelationship[] | null> {
        let result
        if (this.accountId.value !== null) {
            const params = {} as {
                limit: number
                "token.id": string | undefined
                order: string
            }
            params.limit = limit
            params.order = TableController.invertSortOrder(order)
            const keyOperator = TableController.invertKeyOperator(operator)
            if (tokenId !== null) {
                params["token.id"] = keyOperator + ":" + tokenId
            }
            const url = `api/v1/accounts/${this.accountId.value}/tokens`
            const r = await axios.get<TokenRelationshipResponse>(url, {params: params})
            result = Promise.resolve(r.data.tokens ?? [])
        } else {
            result = Promise.resolve(null)
        }
        return result
    }

    public keyFor(row: TokenRelationship): string {
        return row.token_id ?? ""
    }

    public stringFromKey(key: string): string {
        return key;
    }

    public keyFromString(s: string): string | null {
        return s;
    }
}
