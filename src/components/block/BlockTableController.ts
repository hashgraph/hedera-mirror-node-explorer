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
import {Block, BlocksResponse} from "@/schemas/HederaSchemas";
import {Ref} from "vue";
import axios, {AxiosResponse} from "axios";

export class BlockTableController extends TableController<Block, number> {

    //
    // Public
    //

    public constructor(pageSize: Ref<number>) {
        super(pageSize, 10 * pageSize.value, 5000, 10, 100);
    }

    //
    // TableController
    //

    public async loadAfter(blockNb: number | null, limit: number): Promise<Block[] | null> {
        return this.load(blockNb, "lt", limit)
    }

    public async loadBefore(blockNb: number, limit: number): Promise<Block[] | null> {
        return this.load(blockNb, "gte", limit)
    }

    public keyFor(row: Block): number {
        return row.number ?? -1
    }

    //
    // Private
    //

    private load(blockNb: number | null, operator: string, limit: number): Promise<Block[] | null> {

        const params = {} as {
            limit: number
            "block.number": string
            order: string
        }
        params.limit = limit
        params.order = 'desc'
        if (blockNb !== null) {
            params["block.number"] = operator + ":" + blockNb
        }
        const cb = (r: AxiosResponse<BlocksResponse>): Promise<Block[] | null> => {
            return Promise.resolve(r.data.blocks ?? [])
        }

        return  axios.get<BlocksResponse>("api/v1/blocks", {params: params}).then(cb)
    }
}
