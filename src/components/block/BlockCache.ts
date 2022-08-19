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
import {Block, BlocksResponse} from "@/schemas/HederaSchemas";
import axios, {AxiosResponse} from "axios";
import {computed, Ref} from "vue";

export class BlockCache extends EntityCacheV2<BlocksResponse> {

    private readonly limit: number

    //
    // Public
    //

    public constructor(limit = 100) {
        super(5000, 10)
        this.limit = limit
    }

    public readonly lastNumber = computed(() => {
        let result: number
        const blocks = this.blocks.value
        if (blocks && blocks.length >= 1) {
            result = blocks[0].number ?? -1
        } else {
            result = -1
        }
        return result
    })

    public readonly blocks: Ref<Array<Block>> = computed(() => {
        return this.response.value?.data?.blocks ?? []
    })

    //
    // EntityCache
    //

    protected load(): Promise<AxiosResponse<BlocksResponse>> {

        const params = {} as {
            limit: number,
            "block.number": string
        }
        params.limit = this.limit
        if (this.lastNumber.value != -1) {
            params["block.number"] = "gt:" + this.lastNumber.value
        }
        console.log("BlockCache::load")
        console.log("       prams.limit: " + params.limit)
        console.log("       prams.block.number: " + params["block.number"])
        return axios
            .get<BlocksResponse>("api/v1/blocks", { params: params} )
            .then((response) => {
                console.log("       response.data.blocks?.length: " + response.data.blocks?.length)
                return this.mergeResponse(response, this.lastNumber.value)
            })
    }

    //
    // EntityCache
    //

    private mergeResponse( next: AxiosResponse<BlocksResponse>, lastNumber: number) :
        AxiosResponse<BlocksResponse> {

        const prev = this.response.value
        if (prev != null && lastNumber != -1) {
            const prevBlocks = prev.data.blocks ?? Array<Block>()
            const nextBlocks = next.data.blocks ?? Array<Block>()
            const survivorCount = Math.max(0, prevBlocks.length - nextBlocks.length)
            const survivors = prevBlocks.slice(0, survivorCount)
            next.data.blocks = nextBlocks.concat(survivors)
        }

        return next
    }
}
