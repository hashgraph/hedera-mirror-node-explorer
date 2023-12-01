<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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

  <section :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}" class="section">

    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Network</span>
      </template>
      <template v-slot:content>

          <div v-if="isSmallScreen" class="is-flex is-justify-content-space-between">
            <div class="is-flex-direction-column">
              <NetworkDashboardItem title="Last Staked" :value="formatSeconds((elapsedMin??0)*60) + ' ago'"/>
              <div class="mt-4"/>
              <NetworkDashboardItem title="Next Staking Period" :value="'in ' + formatSeconds((remainingMin??0)*60)"/>
              <div class="mt-4"/>
              <NetworkDashboardItem title="Staking Period" :value="formatSeconds((durationMin??0)*60)"/>
            </div>
            <div class="is-flex-direction-column">
              <NetworkDashboardItem name="HBAR" title="Total Staked" :value="makeFloorHbarAmount(stakeTotal)" :tooltip-label="stakeTotalTooltip"/>
              <div class="mt-4"/>
              <NetworkDashboardItem name="HBAR" title="Staked for Reward" :value="makeFloorHbarAmount(stakeRewardedTotal)" :tooltip-label="stakeRewardedTotalTooltip"/>
              <div class="mt-4"/>
              <NetworkDashboardItem name="HBAR" title="Maximum Staked for Reward" :value="makeFloorHbarAmount(maxStakeRewarded)" :tooltip-label="maxStakeRewardedTooltip"/>
            </div>
            <div class="is-flex-direction-column">
              <NetworkDashboardItem name="HBAR" title="Rewarded Last Period" :value="makeFloorHbarAmount(totalRewarded)" :tooltip-label="totalRewardedTooltip"/>
              <div class="mt-4"/>
              <NetworkDashboardItem title="Maximum Reward Rate" :value="makeAnnualizedRate(maxRewardRate)" :tooltip-label="maxRewardRateTooltip"/>
              <div class="mt-4"/>
              <NetworkDashboardItem title="Current Reward Rate" :value="makeAnnualizedRate(rewardRate)" :tooltip-label="rewardRateTooltip"/>
            </div>
          </div>
          <div v-else>
            <div class="is-flex-direction-column">
              <NetworkDashboardItem title="Last Staked" :value="formatSeconds((elapsedMin??0)*60) + ' ago'"/>
              <div class="mt-4"/>
              <NetworkDashboardItem title="Next Staking Period" :value="'in ' + formatSeconds((remainingMin??0)*60)"/>
              <div class="mt-4"/>
              <NetworkDashboardItem title="Staking Period" :value="formatSeconds((durationMin??0)*60)"/>
              <div class="mt-4"/>
              <NetworkDashboardItem name="HBAR" title="Total Staked" :value="makeFloorHbarAmount(stakeTotal)" :tooltip-label="stakeTotalTooltip"/>
              <div class="mt-4"/>
              <NetworkDashboardItem name="HBAR" title="Staked for Reward" :value="makeFloorHbarAmount(stakeRewardedTotal)" :tooltip-label="stakeRewardedTotalTooltip"/>
              <div class="mt-4"/>
              <NetworkDashboardItem name="HBAR" title="Maximum Staked for Reward" :value="makeFloorHbarAmount(maxStakeRewarded)" :tooltip-label="maxStakeRewardedTooltip"/>
              <div class="mt-4"/>
              <NetworkDashboardItem name="HBAR" title="Rewarded Last Period" :value="makeFloorHbarAmount(totalRewarded)" :tooltip-label="totalRewardedTooltip"/>
              <div class="mt-4"/>
              <NetworkDashboardItem title="Maximum Reward Rate" :value="makeAnnualizedRate(maxRewardRate)" :tooltip-label="maxRewardRateTooltip"/>
              <div class="mt-4"/>
              <NetworkDashboardItem title="Current Reward Rate" :value="makeAnnualizedRate(rewardRate)" :tooltip-label="rewardRateTooltip"/>
              <div class="mt-4"/>
            </div>
          </div>

      </template>
    </DashboardCard>

    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">{{ `${nodes.length}  Nodes` }}</span>
      </template>
      <template v-slot:content>
        <NodeTable :nodes="nodes"
                   :stake-total="stakeTotal"/>
      </template>
    </DashboardCard>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";
import Footer from "@/components/Footer.vue";
import NodeTable from "@/components/node/NodeTable.vue";
import NetworkDashboardItem from "@/components/node/NetworkDashboardItem.vue";
import {formatSeconds} from "@/utils/Duration";
import {StakeCache} from "@/utils/cache/StakeCache";
import {NetworkAnalyzer} from "@/utils/analyzer/NetworkAnalyzer";
import {makeAnnualizedRate} from "@/schemas/HederaUtils";

export default defineComponent({
  name: 'Nodes',
  methods: {makeAnnualizedRate},

  props: {
    network: String
  },

  components: {
    NetworkDashboardItem,
    NodeTable,
    Footer,
    DashboardCard
  },

  setup() {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)
    const stakeTotalTooltip = "Total Staked"
    const stakeRewardedTotalTooltip = "Total Staked for Reward"
    const maxStakeRewardedTooltip = "Maximum Staked for Reward"
    const totalRewardedTooltip = "Rewarded Last Period"
    const maxRewardRateTooltip = "Maximum Reward Rate"
    const rewardRateTooltip = "Current Reward Rate"

    const networkNodeAnalyzer = new NetworkAnalyzer()
    onMounted(() => networkNodeAnalyzer.mount())
    onBeforeUnmount(() => networkNodeAnalyzer.unmount())

    const stakeLookup = StakeCache.instance.makeLookup()
    onMounted(() => stakeLookup.mount())
    onBeforeUnmount(() => stakeLookup.unmount())

    const stakeTotal = computed(() => stakeLookup.entity.value?.stake_total ?? 0)
    const maxStakeRewarded = computed(() => stakeLookup.entity.value?.max_stake_rewarded ?? 0)
    const rewardRate = computed(() => stakeLookup.entity.value?.max_staking_reward_rate_per_hbar ?? 0)
    const maxRewardRate = computed(() => (stakeLookup.entity.value?.staking_reward_rate ?? 0) / networkNodeAnalyzer.stakeRewardedTotal.value * 100000000)

    const makeFloorHbarAmount = (tinyBarAmount: number) => Math.floor((tinyBarAmount ?? 0) / 100000000).toLocaleString('en-US')

    return {
      isSmallScreen,
      isTouchDevice,
      stakeTotalTooltip,
      stakeRewardedTotalTooltip,
      maxStakeRewardedTooltip,
      totalRewardedTooltip,
      maxRewardRateTooltip,
      rewardRateTooltip,
      nodes: networkNodeAnalyzer.nodes,
      totalNodes: networkNodeAnalyzer.nodeCount,
      stakeTotal,
      maxStakeRewarded,
      maxRewardRate,
      rewardRate,
      stakeRewardedTotal: networkNodeAnalyzer.stakeRewardedTotal,
      totalRewarded: networkNodeAnalyzer.totalRewarded,
      durationMin: networkNodeAnalyzer.durationMin,
      elapsedMin: networkNodeAnalyzer.elapsedMin,
      remainingMin: networkNodeAnalyzer.remainingMin,
      makeFloorHbarAmount,
      formatSeconds
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>