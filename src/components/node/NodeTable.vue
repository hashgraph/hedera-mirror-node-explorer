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

  <div v-if="nodes" id="node-table">
    <o-table
        :data="nodes"
        :hoverable="true"
        :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"
        :paginated="false"
        :striped="true"
        default-sort="node_id"
        @cell-click="handleClick"
    >

      <o-table-column v-slot="props" field="nature" label="">
        <span class="icon has-text-info regular-node-column" style="font-size: 16px">
          <i v-if="isCouncilNode(props.row)" class="fas fa-building"></i>
          <i v-else class="fas fa-users"></i>
        </span>
      </o-table-column>

      <o-table-column v-slot="props" field="node_id" label="Node">
        <div class="is-numeric regular-node-column">
          {{ props.row.node_id }}
        </div>
      </o-table-column>

      <o-table-column v-if="!enableStaking" v-slot="props" field="node_account_id" label="Account">
        <div class="is-numeric regular-node-column">
          {{ props.row.node_account_id }}
        </div>
      </o-table-column>

      <o-table-column v-slot="props" field="description" label="Description">
        <div class="should-wrap regular-node-column is-inline-block">
          <StringValue :string-value="makeNodeDescriptionPrefix(props.row)" class="has-text-grey"/>
          <StringValue :string-value="makeNodeOwnerDescription(props.row)"/>
        </div>
      </o-table-column>

      <o-table-column v-if="enableStaking" v-slot="props" field="stake" label="Stake for Consensus" position="right">
        <o-tooltip :label="tooltipStake"
                   multiline
                   :delay="tooltipDelay"
                   class="h-tooltip">
          <div class="regular-node-column">
            <HbarAmount :amount="props.row.stake" :decimals="0"/>
          </div>
        </o-tooltip>
      </o-table-column>

      <o-table-column v-if="enableStaking" v-slot="props" field="percentage" label="%" position="right">
        <o-tooltip :delay="tooltipDelay"
                   :label="tooltipPercentage"
                   class="h-tooltip"
                   multiline>
          <div class="regular-node-column">
            <StringValue :string-value="makeWeightPercentage(props.row)"/>
          </div>
        </o-tooltip>
      </o-table-column>

      <o-table-column
          v-if="enableStaking"
          id="stake-range-column" v-slot="props" field="stake-range" label="Stake Range" position="right"
          style="padding-bottom: 2px; padding-top: 12px;"
      >
        <o-tooltip :delay="tooltipDelay" class="h-tooltip">
          <StakeRange :node="props.row" :network-analyzer="networkAnalyzer"/>
          <template #content>
            <div class="reward-range-tooltip">
              <div class="caption has-background-success has-text-right"></div>
              <p class="has-text-left">Rewarded:</p>
              <div class="has-text-weight-normal has-text-right">
                <HbarAmount :amount="props.row.stake_rewarded ?? 0" :decimals="0"/>
              </div>
              <div class="caption has-background-info"></div>
              <p class="has-text-left">Not Rewarded:</p>
              <div class="has-text-weight-normal has-text-right">
                <HbarAmount :amount="props.row.stake_not_rewarded ?? 0" :decimals="0"/>
              </div>
              <div/>
              <p class="has-text-left">Min:</p>
              <div class="has-text-weight-normal has-text-right">
                <HbarAmount :amount="props.row.min_stake ?? 0" :decimals="0"/>
              </div>
              <div/>
              <p class="has-text-left">Max:</p>
              <div class="has-text-weight-normal has-text-right">
                <HbarAmount :amount="props.row.max_stake ?? 0" :decimals="0"/>
              </div>
            </div>
          </template>
        </o-tooltip>
      </o-table-column>

      <o-table-column v-if="enableStaking" v-slot="props" field="last_reward_rate" label="Reward Rate" position="right">
        <o-tooltip :label="tooltipRewardRate"
                   multiline
                   :delay="tooltipDelay"
                   class="h-tooltip">
          <span class="regular-node-column">
            {{ makeAnnualizedRate(props.row.reward_rate_start) }}
          </span>
        </o-tooltip>
      </o-table-column>

    </o-table>
  </div>

  <EmptyTable v-if="nodes && nodes.length === 0"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, onBeforeUnmount, onMounted, PropType} from 'vue';
import {NetworkNode} from "@/schemas/HederaSchemas";
import {ORUGA_MOBILE_BREAKPOINT} from "@/BreakPoints";
import EmptyTable from "@/components/EmptyTable.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";
import StakeRange from "@/components/node/StakeRange.vue";
import {routeManager} from "@/router";
import StringValue from "@/components/values/StringValue.vue";
import {
  isCouncilNode,
  makeAnnualizedRate,
  makeNodeDescriptionPrefix,
  makeNodeOwnerDescription,
  makeStakePercentage
} from "@/schemas/HederaUtils";
import {NetworkAnalyzer} from "@/utils/analyzer/NetworkAnalyzer";
import {CoreConfig} from "@/config/CoreConfig";


//
// defineComponent
//

export default defineComponent({
  name: 'NodeTable',

  components: {StringValue, StakeRange, HbarAmount, EmptyTable},

  props: {
    nodes: Object as PropType<Array<NetworkNode> | undefined>,
    stakeTotal: Number,
  },

  setup(props) {
    const tooltipDelay = 500
    const tooltipStake = "Total amount of HBAR staked to this specific validator for consensus."
    const tooltipPercentage = "Total amount of HBAR staked to this validator for consensus / total amount of HBAR staked to all validators for consensus."
    const tooltipRewardRate = "Approximate annual reward rate based on the reward earned during the last 24h period."

    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)
    const coreConfig = CoreConfig.inject()
    const enableStaking = coreConfig.enableStaking

    const networkAnalyzer = new NetworkAnalyzer()
    onMounted(() => networkAnalyzer.mount())
    onBeforeUnmount(() => networkAnalyzer.unmount())

    const makeWeightPercentage = (node: NetworkNode) => {
      return node.stake && props.stakeTotal ? makeStakePercentage(node, props.stakeTotal) : "0"
    }

    const handleClick = (node: NetworkNode, c: unknown, i: number, ci: number, event: MouseEvent) => {
      if (node.node_id !== undefined) {
        routeManager.routeToNode(node.node_id, event)
      }
    }

    return {
      tooltipDelay,
      tooltipStake,
      tooltipPercentage,
      tooltipRewardRate,
      isTouchDevice,
      isMediumScreen,
      enableStaking,
      networkAnalyzer,
      isCouncilNode,
      makeNodeDescriptionPrefix,
      makeNodeOwnerDescription,
      makeWeightPercentage,
      makeAnnualizedRate,
      handleClick,
      ORUGA_MOBILE_BREAKPOINT,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>

#node-table table.o-table > tbody > tr > td {
  padding-top: 0;
  padding-bottom: 0;
}

.regular-node-column {
  padding-top: 8px;
  padding-bottom: 8px;
}

.caption {
  height: 0.8rem;
  width: 0.8rem;
  border: 1px solid white;
}

.reward-range-tooltip {
  display: grid;
  grid-template-columns: 1fr 4fr 3fr;
  column-gap: 0.5rem;
  row-gap: 0.25rem;
}

</style>
