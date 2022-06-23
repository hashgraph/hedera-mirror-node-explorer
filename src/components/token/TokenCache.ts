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

import {EntityCacheV2} from "@/utils/EntityCacheV2";
import {Token, TokensResponse} from "@/schemas/HederaSchemas";
import axios, {AxiosResponse} from "axios";
import {computed, Ref, ref, watch} from "vue";

const DESCENDING = 'desc'

export class TokenCache extends EntityCacheV2<TokensResponse> {

    public readonly tokenType = ref<string|null>(null)
    private readonly limit: number
    private readonly sorting: string

    //
    // Public
    //

    public constructor(limit = 100) {
        super(5000, 10)
        this.limit = limit
        this.sorting = DESCENDING
        watch(this.tokenType, () => this.clear(), EntityCacheV2.WATCH_OPTIONS)
    }

    public readonly tokens: Ref<Array<Token>> = computed(() => {
        return this.response.value?.data?.tokens ?? []
    })

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
        if (this.tokenType.value != null && this.tokenType.value.length > 0) {
            params.type = this.tokenType.value
        }

        return axios.get<TokensResponse>("api/v1/tokens", { params: params} )
    }

}