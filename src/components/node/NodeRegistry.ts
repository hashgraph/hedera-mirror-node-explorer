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

import {NetworkNode} from "@/schemas/HederaSchemas";
import {computed, ComputedRef, Ref} from "vue";
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

    public readonly nodes: ComputedRef<NetworkNode[]> = computed(() => this.getLoader().nodes.value)

    public readonly node0 = computed(() => this.getLoader().node0.value)

    public readonly nodeCount = computed(() => this.getLoader().nodeCount.value)

    public readonly unclampedStakeTotal = computed(() => this.getLoader().unclampedStakeTotal.value)

    public readonly totalRewarded = computed(() => this.getLoader().totalRewarded.value)

    public readonly stakeRewardedTotal = computed(() => this.getLoader().stakeRewardedTotal.value)

    public readonly stakeUnrewardedTotal = computed(() => this.getLoader().stakeUnrewardedTotal.value)

    public reload(): void {
        if (this.isLoaded) {
            this.loader.clear()
        }
        this.loader.requestLoad()
    }

    public getLoader(): NodesLoader {
        if (! this.isLoaded) {
            this.loader.requestLoad()
            this.isLoaded = true
        }
        return this.loader
    }

    public getCursor(nodeId: Ref<number|null>): NodeCursor {
        return new NodeCursor(nodeId, this.getLoader())
    }

    public getDescription(nodeId: Ref<number|null>): string|null {
        return this.getCursor(nodeId).nodeDescription.value
    }
}
