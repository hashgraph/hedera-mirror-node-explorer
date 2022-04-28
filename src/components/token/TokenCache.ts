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
import {TokensResponse} from "@/schemas/HederaSchemas";
import axios, {AxiosResponse} from "axios";

const DESCENDING = 'desc'

export class TokenCache extends EntityCache<TokensResponse> {

    private tokenType: string|null = null
    private readonly limit: number
    private readonly sorting: string

    //
    // Public
    //

    public constructor(limit = 100) {
        super(5000, 10)
        this.limit = limit
        this.sorting = DESCENDING
    }

    public setTokenType(newValue: string|null): void {
        this.tokenType = newValue
        this.clear()
    }

    //
    // EntityCache
    //

    protected load(): Promise<AxiosResponse<TokensResponse>> {

        const params = {} as {
            limit: number
            order: string
            type: string | undefined
        }
        params.limit = this.limit
        params.order = this.sorting
        if (this.tokenType != null && this.tokenType.length > 0) {
            params.type = this.tokenType
        }

        return axios.get<TokensResponse>("api/v1/tokens", { params: params} )
    }

}