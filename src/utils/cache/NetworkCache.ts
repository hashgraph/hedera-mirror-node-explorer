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

import {NetworkNode, NetworkNodesResponse} from "@/schemas/HederaSchemas";
import {SingletonCache} from "@/utils/cache/base/SingletonCache";
import axios, {AxiosResponse} from "axios";

export class NetworkCache extends SingletonCache<NetworkNode[]> {

    public static readonly instance = new NetworkCache()

    //
    // Cache
    //

    protected async load(): Promise<NetworkNode[]> {
        let result: NetworkNode[] = []
        let nextURL: string | null = "api/v1/network/nodes"
        const params = {
            limit: 25
        }
        while (nextURL !== null) {
            const response: AxiosResponse<NetworkNodesResponse>
                = await axios.get<NetworkNodesResponse>(nextURL, {params: params})
            result = result.concat(response.data.nodes ?? [])
            nextURL = response.data.links?.next ?? null
        }
        return Promise.resolve(result)
    }
}
