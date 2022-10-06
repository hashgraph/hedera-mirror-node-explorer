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

import {NetworkNode, NetworkNodesResponse} from "@/schemas/HederaSchemas";
import axios, {AxiosResponse} from "axios";
import {computed, ComputedRef} from "vue";
import {EntityBatchLoader} from "@/utils/EntityBatchLoader";

export class NodesLoader extends EntityBatchLoader<NetworkNodesResponse> {

    //
    // Public
    //

    public readonly nodes: ComputedRef<NetworkNode[]> = computed(() => this.entity.value?.nodes ?? [])

    public readonly nodeCount = computed(() => this.nodes.value?.length ?? 0)

    public readonly totalRewarded: ComputedRef<number> = computed(() => {
        let result = 0
        for (const n of this.nodes.value) {
            result += (n.reward_rate_start ?? 0) * (n.stake_rewarded ?? 0) / 100000000
        }
        return result
    })

    public readonly unclampedStakeTotal: ComputedRef<number> = computed(() => {
        let result = 0
        for (const n of this.nodes.value) {
            result += (n.stake_rewarded ?? 0) + (n.stake_not_rewarded ?? 0)
        }
        return result
    })

    public readonly node0 = computed(() => this.nodes.value.length >= 1 ? this.nodes.value[0] : null)
    public readonly stakeTotal = computed(() => this.node0.value?.stake_total ?? 0)

    public readonly stakeRewardedTotal: ComputedRef<number> = computed(() => {
        let result = 0
        for (const n of this.nodes.value) {
            result += n.stake_rewarded ?? 0
        }
        return result
    })

    public readonly stakeUnrewardedTotal: ComputedRef<number> = computed(() => {
        let result = 0
        for (const n of this.nodes.value) {
            result += n.stake_not_rewarded ?? 0
        }
        return result
    })

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
