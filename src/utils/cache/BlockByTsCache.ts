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

import {EntityCache} from "@/utils/cache/base/EntityCache"
import {Block, BlocksResponse} from "@/schemas/HederaSchemas";
import axios from "axios";

export class BlockByTsCache extends EntityCache<string, Block|null> {

    public static readonly instance = new BlockByTsCache()

    //
    // Cache
    //

    protected async load(timestamp: string): Promise<Block|null> {
        let result: Promise<Block|null>

        // timestamp=gte:1598572646.192587000&order=asc&limit=1

        const params = {} as {
            timestamp: string
            limit: number
            order: string
        }
        params.timestamp = 'gte:' + timestamp
        params.limit = 1
        params.order = 'asc'
        try {
            const response = await axios.get<BlocksResponse>("api/v1/blocks", { params: params} )
            const blocks = response.data.blocks ?? []
            result = Promise.resolve(blocks.length >= 1 ? blocks[0] : null)
        } catch(error) {
            if (axios.isAxiosError(error) && error.response?.status == 404) {
                result = Promise.resolve(null)
            } else {
                throw error
            }
        }
        return result
    }

}

