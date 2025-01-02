<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2024 Hedera Hashgraph, LLC
  -
  - Licensed under the Apache License, Version 2.0 (the "License");
  - you may not use this file except in compliance with the License.
  - You may obtain a copy of the License at
  -
  -      http://www.apache.org/licenses/LICENSE-2.0
  -
  - Unless required by applicable law or agreed to in writing, software
  - distributed under the License is distributed on an "AS IS" BASIS,
  - WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  - See the License for the specific language governing permissions and
  - limitations under the License.
  -
  -->

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                     TEMPLATE                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>
  <div class="is-flex-direction-column stake-range-column">
    <div class="miniBar" :style="{'width': progressSize+'px'}">
      <div
          class="miniBarProgress plain-range"
          :style="{'left': 0, 'width': '100%'}"
      />
      <div
          class="miniBarProgress unrewarded-range"
          :style="{'left': 0, 'width': (stakeRewardedProgress + stakeNotRewardedProgress)+'%'}"
      />
      <div
          v-if="stakeRewardedProgress > 2"
          class="miniBarProgress"
          :class="{'rewarded-range': isPastRewardThreshold, 'unrewarded-range': !isPastRewardThreshold}"
          :style="{'left': 0, 'width': stakeRewardedProgress+'%'}"
      />
    </div>

    <div class="is-flex">
      <img alt="Minimum staking mark" src="@/assets/min-mark.png"
           class="image" style="max-height: 8px" :style="{'margin-left': minStakePix}">
      <img alt="Maximum staking mark" src="@/assets/max-mark.png"
           class="image" style="max-height: 8px" :style="{'margin-left': maxStakePix}">
    </div>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, PropType} from "vue";
import {NetworkNode} from "@/schemas/MirrorNodeSchemas";
import {NetworkAnalyzer} from "@/utils/analyzer/NetworkAnalyzer";

const progressSize = 250 // size (width) of progress in pixels

const props = defineProps({
  node: Object as PropType<NetworkNode | undefined>,
  networkAnalyzer: {
    type: Object as PropType<NetworkAnalyzer>,
    required: true
  }
})

const minStake = computed(
    () => props.node?.min_stake ?? null)
const maxStake = computed(
    () => props.node?.max_stake ?? null)

const unclampedStake = computed(
    () => (props.node?.stake_rewarded ?? 0) + (props.node?.stake_not_rewarded ?? 0))

const progressScale = computed(
    () => props.networkAnalyzer.stakeScaleEnd.value)

const stakeRewardedProgress = computed(() => {
  let result
  if (progressScale.value) {
    if ((props.node?.stake_rewarded ?? 0) < progressScale.value) {
      result = (props.node?.stake_rewarded ?? 0) / progressScale.value * 100
    } else {
      result = 100
    }
  } else {
    result = 0
  }
  return result
})

const stakeNotRewardedProgress = computed(() => {
  let result
  if (progressScale.value) {
    if (unclampedStake.value < progressScale.value) {
      result = (props.node?.stake_not_rewarded ?? 0) / progressScale.value * 100
    } else {
      result = 100 - stakeRewardedProgress.value
    }
  } else {
    result = 0
  }
  return result
})

const isPastRewardThreshold = computed(() =>
    minStake.value !== null && unclampedStake.value >= minStake.value
)

const minStakePercent = computed(() =>
    minStake.value && progressScale.value ? minStake.value / progressScale.value * 100 : 0)
const minStakePix = computed(() => {
  const pixels = Math.round(minStakePercent.value / 100 * progressSize)
  return pixels.toString() + 'px'
})

const maxStakePercent = computed(() =>
    maxStake.value && progressScale.value ? maxStake.value / progressScale.value * 100 : 0)
const maxStakePix = computed(() => {
  const pixels = Math.round((maxStakePercent.value - minStakePercent.value) / 100 * progressSize - 20)
  return pixels.toString() + 'px'
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>

.miniBarProgress {
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 4px;
}

.miniBar {
  height: 8px;
  position: relative;
  margin-bottom: 1px;
}

.rewarded-range {
  border: 1px solid var(--text-success);
  background-color: var(--text-success);
}

.unrewarded-range {
  border: 1px solid var(--text-accent2);
  background-color: var(--text-accent2)
}

.plain-range {
  border: 1px solid var(--border-secondary);
  background-color: var(--border-secondary)
}

</style>
