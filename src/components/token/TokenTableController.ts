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
import {Token, TokensResponse} from "@/schemas/HederaSchemas";
import {Ref} from "vue";
import axios, {AxiosResponse} from "axios";

export class TokenTableController extends TableController<Token, string> {

    private readonly tokenType: Ref<string | null>

    //
    // Public
    //

    public constructor(pageSize: Ref<number>, tokenType: Ref<string | null>) {
        super(pageSize, 10 * pageSize.value, 5000, 10, 100);
        this.tokenType = tokenType
        this.watchAndReload([this.tokenType])
    }

    //
    // TableController
    //

    public async loadAfter(tokenId: string | null, limit: number): Promise<Token[] | null> {
        return this.load(tokenId, "lt", limit)
    }

    public async loadBefore(tokenId: string, limit: number): Promise<Token[] | null> {
        return this.load(tokenId, "gte", limit)
    }

    public keyFor(row: Token): string {
        return row.token_id ?? ""
    }

    //
    // Private
    //

    private load(tokenId: string | null, operator: string, limit: number): Promise<Token[] | null> {

        const params = {} as {
            limit: number
            "token.id": string | undefined
            order: string
            type: string | undefined
        }
        params.limit = limit
        if (tokenId !== null) {
            params["token.id"] = operator + ":" + tokenId
        }
        params.order = 'desc'
        if (this.tokenType.value !== null) {
            params.type = this.tokenType.value
        }
        const cb = (r: AxiosResponse<TokensResponse>): Promise<Token[] | null> => {
            return Promise.resolve(r.data.tokens ?? [])
        }
        return axios.get<TokensResponse>("api/v1/tokens", {params: params}).then(cb)
    }
}
