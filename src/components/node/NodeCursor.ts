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

import {makeShortNodeDescription, NetworkNode} from "@/schemas/HederaSchemas";
import {computed, ComputedRef, ref, Ref} from "vue";
import {NodeRegistry} from "@/components/node/NodeRegistry";
import {makeDefaultNodeDescription} from "@/schemas/HederaUtils";

export class NodeCursor {

    private readonly nodeId: Ref<number|null>
    private readonly nodeAccountId: Ref<string|null>

    //
    // Public
    //

    public constructor(nodeId: Ref<number|null> = ref(null), nodeAccountId: Ref<string|null> = ref(null)) {
        this.nodeId = nodeId
        this.nodeAccountId = nodeAccountId
    }

    public readonly node: ComputedRef<NetworkNode|null> = computed(() => {
        let result: NetworkNode|null = null
        if (this.nodeId.value !== null || this.nodeAccountId.value !== null) {
            for (const n of NodeRegistry.instance.nodes.value) {
                if (n.node_id == this.nodeId.value || n.node_account_id == this.nodeAccountId.value) {
                    result = n
                    break
                }
            }
        }
        return result
    })

    public readonly nodeDescription: ComputedRef<string|null> = computed(() => {
        let result: string|null
        if (this.node.value !== null) {
            if (this.node.value.description) {
                result = this.node.value.description
            } else {
                result = makeDefaultNodeDescription(this.node.value?.node_id ?? null)
            }
        } else {
            result = null
        }
        return result
    })

    public readonly shortNodeDescription: ComputedRef<string|null> = computed(() => {
        return this.nodeDescription.value ? makeShortNodeDescription(this.nodeDescription.value) : null
    })

    //
    // Public (staking)
    //

    public readonly rewardRate = computed(() =>
        this.node.value?.reward_rate_start
            ? this.node.value.reward_rate_start / 100000000
            : 0)

    public readonly approxYearlyRate = computed(() => {
        const formatter = new Intl.NumberFormat("en-US", {
            style: 'percent',
            maximumFractionDigits: 2
        })
        return formatter.format(this.rewardRate.value * 365);
    })

    public readonly stake = computed(() => this.node.value?.stake ?? 0)
    public readonly minStake = computed(() => this.node.value?.min_stake ?? 0)
    public readonly maxStake = computed(() => this.node.value?.max_stake ?? 0)
    public readonly stakeRewarded = computed(() => this.node.value?.stake_rewarded ?? 0)
    public readonly stakeUnrewarded = computed(() => this.node.value?.stake_not_rewarded ?? 0)
}
