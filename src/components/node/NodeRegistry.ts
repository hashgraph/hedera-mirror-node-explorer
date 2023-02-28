/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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

import {NetworkNode} from "@/schemas/HederaSchemas";
import {computed, ComputedRef, ref, Ref} from "vue";
import {NodesLoader} from "@/components/node/NodesLoader";
import {NodeCursor} from "@/components/node/NodeCursor";

export class NodeRegistry {

    public static readonly instance = new NodeRegistry()

    private readonly loader: NodesLoader
    private isLoaded: boolean

    //
    // Public
    //

    public constructor() {
        this.loader = new NodesLoader()
        this.isLoaded = false
    }

    public readonly nodes: ComputedRef<NetworkNode[]> = computed(() => this.loader.entity.value?.nodes ?? [])

    public readonly nodeCount = computed(() => this.nodes.value?.length ?? 0)

    public readonly node0 = computed(() => this.nodes.value.length >= 1 ? this.nodes.value[0] : null)

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

    public readonly stakeScaleEnd: ComputedRef<number> = computed(() => {
        let result = 0
        for (const n of this.nodes.value) {
            const thisMax = Math.max(n.max_stake ?? 0, n.stake ?? 0)
            result = Math.max(result, thisMax)
        }
        return result
    })

    public readonly hasCommunityNode: ComputedRef<boolean> = computed(() => {
        for (const n of this.nodes.value) {
            if (! NodeRegistry.isCouncilNode(ref(n.node_id ?? 0))) {
                return true
            }
        }
        return false
    })

    public reload(): void {
        this.loader.clear()
        this.loader.requestLoad()
    }

    public static getCursor(nodeId: Ref<number|null> = ref(null),
                     nodeAccountId: Ref<string|null> = ref(null)): NodeCursor {
        return new NodeCursor(nodeId, nodeAccountId)
    }

    public static isCouncilNode(nodeId: Ref<number|null> = ref(null),
                                nodeAccountId: Ref<string|null> = ref(null)): boolean {
        return NodeRegistry.getCursor(nodeId, nodeAccountId).isCouncilNode.value
    }

    public static getDescription(nodeId: Ref<number|null> = ref(null),
                          nodeAccountId: Ref<string|null> = ref(null)): string|null {
        return NodeRegistry.getCursor(nodeId, nodeAccountId).nodeDescription.value
    }

    public static getShortDescription(nodeId: Ref<number | null> = ref(null),
                                      nodeAccountId: Ref<string | null> = ref(null)): string | null {
        return NodeRegistry.getCursor(nodeId, nodeAccountId).shortNodeDescription.value
    }
}
