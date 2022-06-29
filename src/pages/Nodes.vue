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

        <div v-if="isStakingEnabled">
          <div v-if="isSmallScreen" class="is-flex is-justify-content-space-between">
            <div class="is-flex-direction-column">
              <NetworkDashboardItem :title="'Total Nodes'" :value="totalNodes"/>
              <div class="mt-4"/>
              <NetworkDashboardItem :title="'Last Staked'" :value="formatSeconds(sinceLastStakedTime)"/>
            </div>
            <div class="is-flex-direction-column">
              <NetworkDashboardItem :name="'HBAR'" :title="'Total Staked'" :value="totalStaked.toString()"/>
              <div class="mt-4"/>
              <NetworkDashboardItem :title="'Next Staking Period'" :value="formatSeconds(untilNextStakedTime)"/>
            </div>
            <div class="is-flex-direction-column">
              <NetworkDashboardItem :name="'HBAR'" :title="'Total Rewarded'" :value="totalRewarded.toString()"/>
              <div class="mt-4"/>
              <NetworkDashboardItem :title="'Staking Period'" :value="'24 hours'"/>
            </div>
          </div>
          <div v-else>
            <div class="is-flex-direction-column">
              <NetworkDashboardItem :title="'Total Nodes'" :value="totalNodes"/>
              <div class="mt-4"/>
              <NetworkDashboardItem :title="'Last Staked'" :value="formatSeconds(sinceLastStakedTime)"/>
              <div class="mt-4"/>
              <NetworkDashboardItem :name="'HBAR'" :title="'Total Staked'" :value="totalStaked.toString()"/>
              <div class="mt-4"/>
              <NetworkDashboardItem :title="'Next Staking Period'" :value="formatSeconds(untilNextStakedTime)"/>
              <div class="mt-4"/>
              <NetworkDashboardItem :name="'HBAR'" :title="'Total Rewarded'" :value="totalRewarded.toString()"/>
              <div class="mt-4"/>
              <NetworkDashboardItem :title="'Staking Period'" :value="'24 hours'"/>
              <div class="mt-6"/>
            </div>
          </div>
        </div>
        <div v-else>
          <div v-if="isSmallScreen" class="is-flex is-justify-content-space-between">
            <div class="is-flex-direction-column">
              <NetworkDashboardItem :title="'Total Nodes'" :value="totalNodes"/>
            </div>
          </div>
          <div v-else>
            <div class="is-flex-direction-column">
              <NetworkDashboardItem :title="'Total Nodes'" :value="totalNodes"/>
              <div class="mt-6"/>
            </div>
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

import {computed, defineComponent, inject, onBeforeMount, ref} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";
import Footer from "@/components/Footer.vue";
import NodeTable from "@/components/node/NodeTable.vue";
import NetworkDashboardItem from "@/components/node/NetworkDashboardItem.vue";
import axios from "axios";
import {NetworkNode, NetworkNodesResponse} from "@/schemas/HederaSchemas";
import {formatSeconds} from "@/utils/Duration";

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
    const STAKING_PERIOD = 60 * 60 * 24

    const isStakingEnabled = process.env.VUE_APP_ENABLE_STAKING === 'true'

    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    let nodes = ref<Array<NetworkNode> | null>([])

    const totalNodes = computed(() => nodes.value?.length.toString() ?? "")

    const totalStaked = ref(0)
    const totalRewarded = ref(0)

    const sinceLastStakedTime = computed(() => {
      const now = new Date()
      console.log("Current time: " + now.toLocaleTimeString())
      const midnight = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0,0,0)
      return Math.round((now.getTime() - midnight) / 1000 / 60) * 60
    })

    const untilNextStakedTime = computed(() => STAKING_PERIOD - sinceLastStakedTime.value)

    onBeforeMount(() => fetchNodes())

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

    return {
      isStakingEnabled,
      isSmallScreen,
      isTouchDevice,
      nodes,
      totalNodes,
      sinceLastStakedTime,
      totalStaked,
      untilNextStakedTime,
      totalRewarded,
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