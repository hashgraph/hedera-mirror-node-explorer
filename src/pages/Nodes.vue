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

  <hr class="h-top-banner" style="margin: 0; height: 4px"/>

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
            <NetworkDashboardItem :title="'Last Staked'" :value="lastStakedTime"/>
          </div>
          <div class="is-flex-direction-column">
            <NetworkDashboardItem :name="'HBAR'" :title="'Total Staked'" :value="totalStaked" :variation="'2.14'"/>
            <div class="mt-4"/>
            <NetworkDashboardItem :title="'Next Staking Period'" :value="nextStakedTime"/>
          </div>
          <div class="is-flex-direction-column">
            <NetworkDashboardItem :name="'HBAR'" :title="'Total Rewarded'" :value="totalRewarded" :variation="totalRewardedVariation"/>
            <div class="mt-4"/>
            <NetworkDashboardItem :title="'Staking Period'" :value="stakingPeriod"/>
          </div>
        </div>

        <div v-else>
          <div class="is-flex-direction-column">
            <NetworkDashboardItem :title="'Total Nodes'" :value="totalNodes"/>
            <div class="mt-4"/>
            <NetworkDashboardItem :title="'Last Staked'" :value="lastStakedTime"/>
            <div class="mt-4"/>
            <NetworkDashboardItem :name="'HBAR'" :title="'Total Staked'" :value="totalStaked" :variation="totalStakedVariation"/>
            <div class="mt-4"/>
            <NetworkDashboardItem :title="'Next Staking Period'" :value="nextStakedTime"/>
            <div class="mt-4"/>
            <NetworkDashboardItem :name="'HBAR'" :title="'Total Rewarded'" :value="totalRewarded" :variation="totalRewardedVariation"/>
            <div class="mt-4"/>
            <NetworkDashboardItem :title="'Staking Period'" :value="stakingPeriod"/>
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
        <NodeTable :nodes="nodes"/>
      </template>
    </DashboardCard>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeMount, ref} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";
import Footer from "@/components/Footer.vue";
import NodeTable from "@/components/node/NodeTable.vue";
import NetworkDashboardItem from "@/components/node/NetworkDashboardItem.vue";
import axios from "axios";
import {NetworkNode, NetworkNodesResponse} from "@/schemas/HederaSchemas";

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

    const totalNodes = computed(() => nodes.value!.length.toString() ?? "")
    const lastStakedTime = '10h 22min ago'
    const totalStaked = '1,209,109,578'
    const totalStakedVariation = '2.14'
    const nextStakedTime = 'in 14h 38min'
    const totalRewarded = '3,929,928'
    const totalRewardedVariation = '2.14'
    const stakingPeriod = '24h'

    onBeforeMount(() => fetchNodes())

    const fetchNodes = (nextUrl: string | null = null) => {
      const url = nextUrl ?? "api/v1/network/nodes"
      axios
          .get<NetworkNodesResponse>(url, {params: {limit: 25}})
          .then(result => {
            if (result.data.nodes) {
              nodes.value = nodes.value ? nodes.value.concat(result.data.nodes) : result.data.nodes
            }
            const next = result.data.links?.next
            if (next) {
              fetchNodes(next)
            }
          })
    }

    return {
      isSmallScreen,
      isTouchDevice,
      nodes,
      totalNodes,
      lastStakedTime,
      totalStaked,
      totalStakedVariation,
      nextStakedTime,
       totalRewarded,
       totalRewardedVariation,
       stakingPeriod,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>