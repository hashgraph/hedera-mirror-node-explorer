<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2022 Hedera Hashgraph, LLC
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
    <progress id="range" class="progress is-large stake-progress"
              :class="{'is-info': !isStakeInRange, 'is-success': isStakeInRange}"
              style="width: 120px; max-height: 8px; margin-bottom: 1px;"
              max="100" v-bind:value="stakeProgress">
    </progress>
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

<script lang="ts">


//
// defineComponent
//

import {computed, defineComponent, PropType} from "vue";
import {NetworkNode} from "@/schemas/HederaSchemas";

export default defineComponent({
  name: 'StakeRange',

  components: {},

  props: {
    node: Object as PropType<NetworkNode | undefined>,
  },

  setup(props) {

    const stake = computed(
        () => props.node?.stake ?? null)
    const minStake = computed(
        () => props.node?.min_stake ?? null)
    const maxStake = computed(
        () => props.node?.max_stake ?? null)

    const unclampedStake = computed(
        () => (props.node?.stake_rewarded ?? 0) + (props.node?.stake_not_rewarded ?? 0))

    const progressScale = computed(
        () => maxStake.value ? maxStake.value * 1.2 : 0)

    const stakeProgress = computed(
        () => progressScale.value ? unclampedStake.value  / progressScale.value * 100 : 0)

    const isStakeInRange = computed(() => {
      let result: boolean
      if (stake.value && minStake.value && maxStake.value) {
        result = stake.value >= minStake.value && stake.value < maxStake.value
      }
      else {
        result = false
      }

      return result
    })

    const progressSize = 120 // size (width) of progress in pixels

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


    return {
      stakeProgress,
      isStakeInRange,
      minStakePix,
      maxStakePix,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>

.stake-range-column {
  padding-bottom: 2px;
  padding-top: 12px;
}

</style>
