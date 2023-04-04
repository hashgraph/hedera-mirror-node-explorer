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
import {Block} from "@/schemas/HederaSchemas";
import axios from "axios";
import {BlockByHashCache} from "@/utils/cache/BlockByHashCache";

export class BlockByNbCache extends EntityCache<number, Block|null> {

    public static readonly instance = new BlockByNbCache()

    //
    // Public
    //

    public updateWithBlock(block: Block): void {
        if (block.number) {
            this.forget(block.number)
            this.promises.set(block.number, Promise.resolve(block))
        }
    }

    //
    // Cache
    //

    protected async load(nb: number): Promise<Block|null> {
        let result: Promise<Block|null>

        try {
            const response = await axios.get<Block>("api/v1/blocks/" + nb)
            result = Promise.resolve(response.data)
            BlockByHashCache.instance.updateWithBlock(response.data)
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

