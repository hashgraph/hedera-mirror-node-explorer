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

  <DashboardCard>
    <template v-slot:title>
      <p class="h-is-primary-title">Rewards Calculator</p>
    </template>
    <template v-slot:table>

      <div class="columns">
        <div class="column is-three-fifths">
          <div class="is-flex is-flex-direction-column is-align-items-flex-start">
            <p v-if="isMediumScreen" class="h-is-property-text mb-3">Choose node staked to</p>
            <p v-else class="h-is-text-size-3 mb-1">Choose node staked to</p>
            <o-field style="width: 100%">
              <o-select v-model="selectedNodeId" class="h-is-text-size-1" style="border-radius: 4px">
                <option v-for="n in nodes" :key="n.node_id" :value="n.node_id"
                        style="background-color: var(--h-theme-box-background-color)">
                  {{ makeNodeDescription(n) }} - {{ makeNodeStake(n) }}
                </option>
              </o-select>
            </o-field>
          </div>
        </div>
        <div class="column">
          <div class="is-flex is-flex-direction-column is-align-items-flex-start">
            <p v-if="isMediumScreen" class="h-is-property-text mb-3">Enter HBAR amount staked</p>
            <p v-else class="h-is-text-size-3 mb-1">Enter HBAR amount staked</p>
              <input class="input is-small has-text-right" type="text" placeholder="0"
                     :value="amountStaked"
                     @input="event => handleInput(event.target.value)"
                     style="width: 100%; height: 26px; margin-top: 1.5px; border-radius: 4px; border-width: 1px;
                     color: white; background-color: var(--h-theme-box-background-color)">
          </div>
        </div>
      </div>

      <div class="is-flex is-justify-content-space-between">
        <NetworkDashboardItem :name="'HBAR'" :title="'Current 24h Period Reward'" :value="currentReward.toString()"/>
        <NetworkDashboardItem :name="'HBAR'" :title="'Approx Monthly Reward'" :value="monthlyReward.toString()"/>
        <NetworkDashboardItem :name="'HBAR'" :title="'Approx Yearly Reward'" :value="yearlyReward.toString()"/>
        <NetworkDashboardItem :title="'Approx Yearly Reward Rate'" :value="yearlyRate*100 + '%'"/>
      </div>

      <div class="mt-2 h-is-text-size-2 is-italic has-text-grey">
        These numbers are not individualized and only for illustrative purposes.
        Please see the
        <a href="https://docs.hedera.com/guides/core-concepts/staking" class="is-underlined has-text-grey">
          staking documentation
        </a>
        for factors that can influence these numbers.
      </div>

    </template>
  </DashboardCard>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeMount, onMounted, PropType, ref, watch} from 'vue';
import NetworkDashboardItem from "@/components/node/NetworkDashboardItem.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import {NetworkNode, NetworkNodesResponse} from "@/schemas/HederaSchemas";
import axios from "axios";
import {operatorRegistry} from "@/schemas/OperatorRegistry";

export default defineComponent({
  name: 'RewardsCalculator',

  props: {
    network: String,
    amountInHbar: Number,
    nodeId: Number as PropType<number|null>
  },

  components: {
    DashboardCard,
    NetworkDashboardItem,
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    const selectedNodeId = ref<number | null>(props.nodeId ?? null)
    watch(() => props.nodeId, () => selectedNodeId.value = props.nodeId ?? null)

    const amountStaked = ref<number>( 100)
    const updateAmountStaked = () => {
      amountStaked.value = props.amountInHbar ?? 100
    }
    watch(() => props.amountInHbar, updateAmountStaked)
    onBeforeMount(updateAmountStaked)

    const rewardRate = computed(() =>
        (nodes.value && selectedNodeId.value !== null && selectedNodeId.value < nodes.value.length)
            ? nodes.value[selectedNodeId.value].reward_rate_start
            : 0)
    const currentReward = computed(() => rewardRate.value && amountStaked.value ? Math.round(amountStaked.value * rewardRate.value * 10000) / 10000 : 0)
    const monthlyReward = computed(() => currentReward.value ? Math.round(currentReward.value * 30 * 100) / 100 : 0)
    const yearlyReward = computed(() => currentReward.value ? Math.round(currentReward.value * 365 * 10) / 10 : 0)
    const yearlyRate = computed(() => rewardRate.value ? Math.round(rewardRate.value * 365 * 10000) / 10000  : 0)

    //
    // Nodes
    //
    const nodes = ref<Array<NetworkNode> | null>([])
    const stakeTotal = ref(0)

    const fetchNodes = (nextUrl: string | null = null) => {
      const url = nextUrl ?? "api/v1/network/nodes"
      axios
          .get<NetworkNodesResponse>(url, {params: {limit: 25}})
          .then(result => {
            if (result.data.nodes) {
              nodes.value = nodes.value ? nodes.value.concat(result.data.nodes) : result.data.nodes
            }
            stakeTotal.value = nodes.value ? nodes.value[0].stake_total ?? 0 : 0
            const next = result.data.links?.next
            if (next) {
              fetchNodes(next)
            // } else {
            //   // FAKED VALUES FOR NODE REWARD RATES
            //   if (nodes.value) {
            //     for (let i = 0; i < nodes.value?.length; i++) {
            //       nodes.value[i].reward_rate_start = i * 1.25 / 365 / 100
            //     }
            //   }
            }
          })
    }

    onMounted(() => {
      fetchNodes()
    })

    const makeNodeDescription = (node: NetworkNode) => {
      let result
      if (node.description) {
        result = node.description
      } else {
        result = node.node_account_id ? operatorRegistry.lookup(node.node_account_id)?.getDescription() : null
      }
      return result
    }

    const makeNodeStake = (node: NetworkNode) => {
      const amountFormatter = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0
      })
      const percentFormatter = new Intl.NumberFormat("en-US", {
        style: 'percent',
        maximumFractionDigits: 0
      })
      const stakeAmount = node.stake ? node.stake / 100000000 : 0
      const percentMax = node.stake && node.max_stake ? node.stake / node.max_stake : 0

      let result = amountFormatter.format(stakeAmount) + "ℏ staked"
      if (percentMax !== 0) {
        result += " (" + percentFormatter.format(percentMax) + " of max)"
      }
      return result
    }

    const handleInput = (value: string) => {
      const previousAmount = amountStaked.value
      const newAmount = Number(value)
      if (!Number.isNaN(newAmount) && newAmount >= 0 && newAmount <= 50000000000) {
        amountStaked.value = newAmount
      } else {
        amountStaked.value = -1
        amountStaked.value = previousAmount
      }
    }

    return {
      isSmallScreen,
      isMediumScreen,
      isTouchDevice,
      selectedNodeId,
      amountStaked,
      rewardRate,
      currentReward,
      monthlyReward,
      yearlyReward,
      yearlyRate,
      nodes,
      makeNodeDescription,
      makeNodeStake,
      handleInput
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>
.o-ctrl-sel {
  width: 100%;
}
</style>