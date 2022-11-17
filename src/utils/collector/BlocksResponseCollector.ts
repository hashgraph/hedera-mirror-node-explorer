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

import {BlocksResponse} from "@/schemas/HederaSchemas";
import {Collector} from "@/utils/collector/Collector";
import axios, {AxiosResponse} from "axios";

export class BlocksResponseCollector extends Collector<BlocksResponse, string> {

    public static readonly instance = new BlocksResponseCollector()

    //
    // Collector
    //

    protected load(timestamp: string): Promise<AxiosResponse<BlocksResponse>> {

        // timestamp=gte:1598572646.192587000&order=asc&limit=1

        const params = {} as {
            timestamp: string
            limit: number
            order: string
        }
        params.timestamp = 'gte:' + timestamp
        params.limit = 1
        params.order = 'asc'

        return axios.get<BlocksResponse>("api/v1/blocks", { params: params} )
    }
}