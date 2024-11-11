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

  <DashboardCard collapsible-key="rewardsEstimator">
    <template v-slot:title>
      <p class="h-is-secondary-title">Rewards Estimator</p>
    </template>
    <template v-slot:content>

      <div class="columns">
        <div class="column is-three-fifths">
          <div class="is-flex is-flex-direction-column is-align-items-flex-start">
            <p v-if="isMediumScreen" class="h-is-property-text mb-3">Choose a node to stake to</p>
            <p v-else class="h-is-text-size-3 mb-1">Choose a node to stake to</p>
            <o-field style="width: 100%">
              <o-select v-model="selectedNodeId" class="h-is-text-size-1" style="border-radius: 4px" :icon="nodeIcon">
                <optgroup label="Hedera council nodes">
                  <option v-for="n in nodes" :key="n.node_id" :value="n.node_id"
                          style="background-color: var(--h-theme-box-background-color)"
                          v-show="isCouncilNode(n)">
                    {{ makeNodeSelectorDescription(n) }}
                  </option>
                </optgroup>
                <optgroup v-if="hasCommunityNode" label="Community nodes">
                  <option v-for="n in nodes" :key="n.node_id" :value="n.node_id"
                          style="background-color: var(--h-theme-box-background-color)"
                          v-show="!isCouncilNode(n)">
                    {{ makeNodeSelectorDescription(n) }}
                  </option>
                </optgroup>
              </o-select>
            </o-field>
          </div>
        </div>
        <div class="column">
          <div class="is-flex is-flex-direction-column is-align-items-flex-start">
            <p v-if="isMediumScreen" class="h-is-property-text mb-3">Enter the number of hbars you want to stake</p>
            <p v-else class="h-is-text-size-3 mb-1">Enter number of hbars you want to stake</p>
            <input class="input is-small has-text-right" type="text" placeholder="0"
                   :value="amountStaked"
                   @input="handleInput"
                   style="width: 100%; height: 26px; margin-top: 1.5px; border-radius: 4px; border-width: 1px;
                     color: white; background-color: var(--h-theme-box-background-color)">
          </div>
        </div>
      </div>

      <div class="is-flex is-justify-content-space-between">
        <NetworkDashboardItem id="currentReward" name="HBAR" title="Current 24h Period Reward"
                              :value="currentReward.toString()"/>
        <NetworkDashboardItem id="monthlyReward" name="HBAR" title="Approx Monthly Reward"
                              :value="monthlyReward.toString()"/>
        <NetworkDashboardItem id="yearlyReward" name="HBAR" title="Approx Yearly Reward"
                              :value="yearlyReward.toString()"/>
        <NetworkDashboardItem id="yearlyRate" title="Approx Yearly Reward Rate" :value="annualizedRate"/>
      </div>

      <div v-html="htmlNotice"/>

    </template>
  </DashboardCard>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeMount, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import NetworkDashboardItem from "@/components/node/NetworkDashboardItem.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import {makeNodeSelectorDescription} from "@/schemas/HederaSchemas";
import {NodeAnalyzer} from "@/utils/analyzer/NodeAnalyzer";
import {isCouncilNode, makeNodeDescription} from "@/schemas/HederaUtils";
import {CoreConfig} from "@/config/CoreConfig";

export default defineComponent({
  name: 'RewardsCalculator',

  props: {
    network: String,
    amountInHbar: Number,
    nodeId: Number,
  },

  components: {
    DashboardCard,
    NetworkDashboardItem,
  },

  setup(props) {
    const htmlNotice = CoreConfig.inject().estimatorNotice ?? ""

    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    const selectedNodeId = ref<number | null>(props.nodeId ?? null)
    watch(() => props.nodeId, () => selectedNodeId.value = props.nodeId ?? null)

    //
    // Node
    //
    const nodeAnalyzer = new NodeAnalyzer(selectedNodeId)
    onMounted(() => nodeAnalyzer.mount())
    onBeforeUnmount(() => nodeAnalyzer.unmount())

    const nodeIcon = computed(() => {
      let result
      if (selectedNodeId.value !== null) {
        result = nodeAnalyzer.isCouncilNode.value ? "building" : "users"
      } else {
        result = ""
      }
      return result
    })

    const amountStaked = ref<number>(100)
    const updateAmountStaked = () => {
      amountStaked.value = props.amountInHbar ?? 100
    }
    watch(() => props.amountInHbar, updateAmountStaked)
    onBeforeMount(updateAmountStaked)

    const rewardRate = computed(() => nodeAnalyzer.rewardRate.value)
    const currentReward = computed(() => rewardRate.value && amountStaked.value ? Math.round(amountStaked.value * rewardRate.value * 10000) / 10000 : 0)
    const monthlyReward = computed(() => currentReward.value ? Math.round(currentReward.value * 30 * 100) / 100 : 0)
    const yearlyReward = computed(() => currentReward.value ? Math.round(currentReward.value * 365 * 10) / 10 : 0)

    const handleInput = (event: Event) => {
      const previousAmount = amountStaked.value
      const value = (event.target as HTMLInputElement).value
      const newAmount = Number(value)
      if (!Number.isNaN(newAmount) && newAmount >= 0 && newAmount <= 50000000000) {
        amountStaked.value = newAmount
      } else {
        amountStaked.value = -1
        amountStaked.value = previousAmount
      }
    }

    return {
      htmlNotice,
      isSmallScreen,
      isMediumScreen,
      isTouchDevice,
      selectedNodeId,
      nodeIcon,
      amountStaked,
      rewardRate,
      currentReward,
      monthlyReward,
      yearlyReward,
      annualizedRate: nodeAnalyzer.annualizedRate,
      nodes: nodeAnalyzer.networkAnalyzer.nodes,
      hasCommunityNode: nodeAnalyzer.networkAnalyzer.hasCommunityNode,
      makeNodeDescription,
      makeNodeSelectorDescription,
      isCouncilNode,
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
