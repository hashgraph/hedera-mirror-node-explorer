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

import {computed, ComputedRef, ref, Ref, watch, WatchStopHandle} from "vue";
import {StakingPeriod} from "@/utils/StakingPeriod";
import {isCouncilNode} from "@/schemas/MirrorNodeUtils.ts";
import {NetworkCache} from "@/utils/cache/NetworkCache";


export class NetworkAnalyzer {

    public readonly networkLookup = NetworkCache.instance.makeLookup()
    public readonly stakingPeriod: Ref<StakingPeriod | null> = ref(null)
    private intervalHandle = -1
    private watchHandle: WatchStopHandle | null = null

    //
    // Public
    //

    public mount(): void {
        this.networkLookup.mount()
        this.updateStakingPeriod()
        this.intervalHandle = window.setInterval(this.updateStakingPeriod, 10000)
        this.watchHandle = watch(this.nodes, this.updateStakingPeriod)
    }

    public unmount(): void {
        this.networkLookup.unmount()
        this.stakingPeriod.value = null
        window.clearInterval(this.intervalHandle)
        this.intervalHandle = -1
        if (this.watchHandle !== null) {
            this.watchHandle()
            this.watchHandle = null
        }
    }

    public readonly nodes = computed(() => this.networkLookup.entity.value ?? [])

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
        let nbNodes = 0
        for (const n of this.nodes.value) {
            if (isCouncilNode(n)) {
                const thisMax = Math.max(n.max_stake ?? 0, (n.stake_rewarded ?? 0) + (n.stake_not_rewarded ?? 0))
                result += thisMax
                nbNodes++
            }
        }
        if (nbNodes) {
            result = result / nbNodes * 1.3
        }
        return result
    })

    public readonly durationMin
        = computed(() => this.stakingPeriod.value?.durationMin ?? null)
    public readonly elapsedMin
        = computed(() => this.stakingPeriod.value?.elapsedMin ?? null)
    public readonly remainingMin
        = computed(() => this.stakingPeriod.value?.remainingMin ?? null)

    //
    // Private
    //

    private readonly updateStakingPeriod = () => {
        let startTimeInSec, endTimeInSec
        const node0 = this.node0.value
        if (node0 !== null) {
            startTimeInSec = node0.staking_period?.from ? Number.parseInt(node0.staking_period?.from) : null
            endTimeInSec = node0.staking_period?.to ? Number.parseInt(node0.staking_period?.to) : null
        } else {
            startTimeInSec = null
            endTimeInSec = null
        }
        this.stakingPeriod.value = new StakingPeriod(startTimeInSec, endTimeInSec)
    }

}
