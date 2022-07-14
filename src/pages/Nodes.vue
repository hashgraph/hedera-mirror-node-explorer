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

  <section :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}" class="section">

    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Network</span>
      </template>
      <template v-slot:table>

          <div v-if="isSmallScreen" class="is-flex is-justify-content-space-between">
            <div class="is-flex-direction-column">
              <NetworkDashboardItem :title="'Total Nodes'" :value="totalNodes"/>
              <div class="mt-4"/>
              <NetworkDashboardItem :title="'Last Staked'" :value="formatSeconds(elapsedMin*60) + ' ago'"/>
            </div>
            <div class="is-flex-direction-column">
              <NetworkDashboardItem :name="'HBAR'" :title="'Total Staked'" :value="totalStaked.toString()"/>
              <div class="mt-4"/>
              <NetworkDashboardItem :title="'Next Staking Period'" :value="'in ' + formatSeconds(remainingMin*60)"/>
            </div>
            <div class="is-flex-direction-column">
              <NetworkDashboardItem :name="'HBAR'" :title="'Total Rewarded'" :value="totalRewarded.toString()"/>
              <div class="mt-4"/>
              <NetworkDashboardItem :title="'Staking Period'" :value="formatSeconds(durationMin*60)"/>
            </div>
          </div>
          <div v-else>
            <div class="is-flex-direction-column">
              <NetworkDashboardItem :title="'Total Nodes'" :value="totalNodes"/>
              <div class="mt-4"/>
              <NetworkDashboardItem :title="'Last Staked'" :value="formatSeconds(elapsedMin*60) + 'ago'"/>
              <div class="mt-4"/>
              <NetworkDashboardItem :name="'HBAR'" :title="'Total Staked'" :value="totalStaked.toString()"/>
              <div class="mt-4"/>
              <NetworkDashboardItem :title="'Next Staking Period'" :value="'in' + formatSeconds(remainingMin*60)"/>
              <div class="mt-4"/>
              <NetworkDashboardItem :name="'HBAR'" :title="'Total Rewarded'" :value="totalRewarded.toString()"/>
              <div class="mt-4"/>
              <NetworkDashboardItem :title="'Staking Period'" :value="formatSeconds(durationMin*60)"/>
              <div class="mt-6"/>
            </div>
          </div>

      </template>
    </DashboardCard>

    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Nodes</span>
      </template>
      <template v-slot:table>
        <NodeTable :nodes="nodes" :total-staked="totalStaked"/>
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
import axios from "axios";
import {NetworkNode, NetworkNodesResponse} from "@/schemas/HederaSchemas";
import {formatSeconds} from "@/utils/Duration";
import {StakingPeriod} from "@/utils/StakingPeriod";

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

    let nodes = ref<Array<NetworkNode> | null>([])
    const totalNodes = computed(() => nodes.value?.length.toString() ?? "")

    const totalStaked = ref(0)
    const totalRewarded = ref(0)
    const stakingPeriod = ref<StakingPeriod | null>(null)

    const durationMin = computed(() => stakingPeriod.value?.durationMin ? (stakingPeriod.value.durationMin) : null)
    const elapsedMin = computed(() => stakingPeriod.value?.elapsedMin ? (stakingPeriod.value.elapsedMin) : null)
    const remainingMin = computed(() => stakingPeriod.value?.remainingMin ? (stakingPeriod.value?.remainingMin) : null)

    let intervalHandle = -1

    onMounted(() => {
      fetchNodes()
      updateStakingPeriod()
      intervalHandle = window.setInterval( () => updateStakingPeriod(), 10000)
    })

    onBeforeUnmount(() => {
      window.clearInterval(intervalHandle)
      intervalHandle = -1
    })

    const fetchNodes = (nextUrl: string | null = null) => {
      const url = nextUrl ?? "api/v1/network/nodes"
      axios
          .get<NetworkNodesResponse>(url, {params: {limit: 25}})
          .then(result => {
            if (result.data.nodes) {
              nodes.value = nodes.value ? nodes.value.concat(result.data.nodes) : result.data.nodes
              for (const n of result.data.nodes) {
                if (n.stake) {
                  totalStaked.value += n.stake
                }
                if (n.stake_rewarded) {
                  totalRewarded.value += n.stake_rewarded
                }
              }
            }
            const next = result.data.links?.next
            if (next) {
              fetchNodes(next)
            }
          })
    }

    const updateStakingPeriod = () => {
      let startTimeInSec, endTimeInSec
      if (nodes.value?.length) {
        startTimeInSec = nodes.value[0].staking_period?.from ? Number.parseInt(nodes.value[0].staking_period?.from) : null
        endTimeInSec = nodes.value[0].staking_period?.to ? Number.parseInt(nodes.value[0].staking_period?.to) : null
      } else {
        startTimeInSec = null
        endTimeInSec = null
      }
      stakingPeriod.value = new StakingPeriod(startTimeInSec, endTimeInSec)
    }

    return {
      isSmallScreen,
      isTouchDevice,
      nodes,
      totalNodes,
      totalStaked,
      totalRewarded,
      durationMin,
      elapsedMin,
      remainingMin,
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