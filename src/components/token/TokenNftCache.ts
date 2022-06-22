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
import {Nft, Nfts} from "@/schemas/HederaSchemas";
import axios, {AxiosResponse} from "axios";
import {computed, Ref, ref, watch} from "vue";

const ASCENDING = 'asc'

export class TokenNftCache extends EntityCacheV2<Nfts> {

    public readonly tokenId = ref<string|null>(null)
    private readonly limit: number
    private readonly order: string

    //
    // Public
    //

    public constructor(limit = 100) {
        super(5000, 10)
        this.limit = limit
        this.order = ASCENDING
        watch(this.tokenId, () => this.clear())
    }

    public readonly nfts: Ref<Array<Nft>> = computed(() => {
        return this.response.value?.data?.nfts ?? []
    })

    //
    // EntityCache
    //

    protected load(): Promise<AxiosResponse<Nfts>> {
        const params = {
            limit: this.limit,
            order: this.order
        }
        return axios.get<Nfts>("api/v1/tokens/" + this.tokenId.value + "/nfts", { params: params} )
    }

}
