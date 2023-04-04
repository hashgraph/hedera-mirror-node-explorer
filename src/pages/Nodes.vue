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
              <NetworkDashboardItem title="Total Nodes" :value="totalNodes.toString()"/>
              <div class="mt-4"/>
              <NetworkDashboardItem title="Last Staked" :value="formatSeconds(elapsedMin*60) + ' ago'"/>
            </div>
            <div class="is-flex-direction-column">
              <NetworkDashboardItem name="HBAR" title="Total Staked" :value="makeFloorHbarAmount(unclampedStakeTotal)"/>
              <div class="mt-4"/>
              <NetworkDashboardItem title="Next Staking Period" :value="'in ' + formatSeconds(remainingMin*60)"/>
            </div>
            <div class="is-flex-direction-column">
              <NetworkDashboardItem name="HBAR" title="Last Period Reward" :value="makeFloorHbarAmount(totalRewarded)"/>
              <div class="mt-4"/>
              <NetworkDashboardItem title="Staking Period" :value="formatSeconds(durationMin*60)"/>
            </div>
          </div>
          <div v-else>
            <div class="is-flex-direction-column">
              <NetworkDashboardItem title="Total Nodes" :value="totalNodes.toString()"/>
              <div class="mt-4"/>
              <NetworkDashboardItem title="Last Staked" :value="formatSeconds(elapsedMin*60) + ' ago'"/>
              <div class="mt-4"/>
              <NetworkDashboardItem name="HBAR" title="Total Staked" :value="makeFloorHbarAmount(unclampedStakeTotal)"/>
              <div class="mt-4"/>
              <NetworkDashboardItem title="Next Staking Period" :value="'in ' + formatSeconds(remainingMin*60)"/>
              <div class="mt-4"/>
              <NetworkDashboardItem name="HBAR" title="Last Period Reward" :value="makeFloorHbarAmount(totalRewarded)"/>
              <div class="mt-4"/>
              <NetworkDashboardItem title="Staking Period" :value="formatSeconds(durationMin*60)"/>
              <div class="mt-6"/>
            </div>
          </div>

      </template>
    </DashboardCard>

    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Nodes</span>
      </template>
      <template v-slot:content>
        <NodeTable :nodes="nodes"
                   :unclamped-stake-total="unclampedStakeTotal"
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

import {computed, defineComponent, inject, onBeforeUnmount, onMounted, ref} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";
import Footer from "@/components/Footer.vue";
import NodeTable from "@/components/node/NodeTable.vue";
import NetworkDashboardItem from "@/components/node/NetworkDashboardItem.vue";
import {formatSeconds} from "@/utils/Duration";
import {StakingPeriod} from "@/utils/StakingPeriod";
import {StakeCache} from "@/utils/cache/StakeCache";
import {NodeRegistry} from "@/components/node/NodeRegistry";

export default defineComponent({
  name: 'Nodes',

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

    const stakeLookup = StakeCache.instance.makeLookup()
    onMounted(() => stakeLookup.mount())
    onBeforeUnmount(() => stakeLookup.unmount())

    const stakeTotal = computed(() => stakeLookup.entity.value?.stake_total ?? 0)

    const stakingPeriod = ref<StakingPeriod | null>(null)

    const durationMin = computed(() => stakingPeriod.value?.durationMin ??  null)
    const elapsedMin = computed(() => stakingPeriod.value?.elapsedMin ?? null)
    const remainingMin = computed(() => stakingPeriod.value?.remainingMin ?? null)

    let intervalHandle = -1

    onMounted(() => {
      updateStakingPeriod()
      intervalHandle = window.setInterval( () => updateStakingPeriod(), 10000)
    })

    onBeforeUnmount(() => {
      window.clearInterval(intervalHandle)
      intervalHandle = -1
    })

    const updateStakingPeriod = () => {
      let startTimeInSec, endTimeInSec
      const node0 = NodeRegistry.instance.node0.value
      if (node0) {
        startTimeInSec = node0.staking_period?.from ? Number.parseInt(node0.staking_period?.from) : null
        endTimeInSec = node0.staking_period?.to ? Number.parseInt(node0.staking_period?.to) : null
      } else {
        startTimeInSec = null
        endTimeInSec = null
      }
      stakingPeriod.value = new StakingPeriod(startTimeInSec, endTimeInSec)
    }

    const makeFloorHbarAmount = (tinyBarAmount: number) => Math.floor((tinyBarAmount ?? 0) / 100000000).toLocaleString('en-US')

    return {
      isSmallScreen,
      isTouchDevice,
      nodes: NodeRegistry.instance.nodes,
      totalNodes: NodeRegistry.instance.nodeCount,
      stakeTotal,
      unclampedStakeTotal: NodeRegistry.instance.unclampedStakeTotal,
      totalRewarded: NodeRegistry.instance.totalRewarded,
      durationMin,
      elapsedMin,
      remainingMin,
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