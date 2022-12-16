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

import {NetworkNodesResponse} from "@/schemas/HederaSchemas";
import axios, {AxiosResponse} from "axios";
import {EntityBatchLoader} from "@/utils/loader/EntityBatchLoader";

export class NodesLoader extends EntityBatchLoader<NetworkNodesResponse> {

    //
    // EntityBatchLoader
    //

    protected async loadNext(nextURL: string|null): Promise<AxiosResponse<NetworkNodesResponse>|null> {
        return axios.get<NetworkNodesResponse>(nextURL ?? "api/v1/network/nodes")
    }

    protected nextURL(entity: NetworkNodesResponse): string | null {
        return entity.links?.next ?? null
    }

    protected mergeResponses(last: AxiosResponse<NetworkNodesResponse>, next: AxiosResponse<NetworkNodesResponse>): AxiosResponse<NetworkNodesResponse> {
        const lastNodes = last.data.nodes ?? []
        const nextNodes = next.data.nodes ?? []
        last.data.nodes = lastNodes.concat(nextNodes)
        return last
    }
}
