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

  <div id="node-table">
    <o-table
        :data="nodes"
        :hoverable="true"
        :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"
        :paginated="false"
        :striped="true"
        default-sort="node_id"
        @click="handleClick"
    >

      <o-table-column v-slot="props" field="nature" label="">
        <span class="icon has-text-info" style="font-size: 16px">
          <i v-if="isCouncilNode(props.row)" class="fas fa-building"></i>
          <i v-else class="fas fa-users"></i>
        </span>
      </o-table-column>

      <o-table-column v-slot="props" field="node_id" label="Node">
        <div class="is-numeric regular-node-column">
          {{ props.row.node_id }}
        </div>
      </o-table-column>

      <o-table-column v-if="false" v-slot="props" field="node_account_id" label="Account">
        <div class="is-numeric regular-node-column">
          {{ props.row.node_account_id }}
        </div>
      </o-table-column>

      <o-table-column v-slot="props" field="description" label="Description">
        <div class="should-wrap regular-node-column is-inline-block">
          <StringValue :string-value="makeDescription(props.row)"/>
        </div>
      </o-table-column>

      <o-table-column v-slot="props" field="stake" label="Stake" position="right">
        <o-tooltip :label="tooltipStake"
                   multiline
                   :delay="tooltipDelay"
                   class="h-tooltip">
          <span class="regular-node-column">
            <HbarAmount :amount="makeUnclampedStake(props.row)" :decimals="0"/>
            <span v-if="props.row.stake" class="ml-1">{{ '(' + makeWeightPercentage(props.row) + ')' }}</span>
            <span v-else class="ml-1 has-text-grey">(&lt;Min)</span>
          </span>
        </o-tooltip>
      </o-table-column>

      <o-table-column v-slot="props" field="stake_not_rewarded" label="Staked For No Reward" position="right">
        <o-tooltip :delay="tooltipDelay"
                   :label="tooltipNotRewarded"
                   class="h-tooltip"
                   multiline>
           <span class="regular-node-column">
             <HbarAmount :amount="props.row.stake_not_rewarded ?? 0" :decimals="0"/>
          </span>
        </o-tooltip>
      </o-table-column>

      <o-table-column id="stake-range-column" v-slot="props" field="stake-range" label="Stake Range" position="right"
                      style="padding-bottom: 2px; padding-top: 12px;">
        <o-tooltip :delay="tooltipDelay" class="h-tooltip">
          <StakeRange :node="props.row"/>
          <template #content>
            <div class="reward-range-tooltip">
              <div class="caption has-background-success has-text-right"></div>
              <p class="has-text-left">Rewarded:</p>
              <div class="has-text-weight-normal has-text-right"><HbarAmount :amount="props.row.stake_rewarded ?? 0" :decimals="0"/></div>
              <div class="caption has-background-info"></div>
              <p class="has-text-left">Not Rewarded:</p>
              <div class="has-text-weight-normal has-text-right"><HbarAmount :amount="props.row.stake_not_rewarded ?? 0" :decimals="0"/></div>
              <div/>
              <p class="has-text-left">Min:</p>
              <div class="has-text-weight-normal has-text-right"><HbarAmount :amount="props.row.min_stake ?? 0" :decimals="0"/></div>
              <div/>
              <p class="has-text-left">Max:</p>
              <div class="has-text-weight-normal has-text-right"><HbarAmount :amount="props.row.max_stake ?? 0" :decimals="0"/></div>
            </div>
          </template>
        </o-tooltip>
      </o-table-column>

      <o-table-column v-slot="props" field="last_reward_rate" label="Reward Rate" position="right">
        <o-tooltip :label="tooltipRewardRate"
                   multiline
                   :delay="tooltipDelay"
                   class="h-tooltip">
          <span class="regular-node-column">
            {{ makeAnnualizedRate(props.row) }}
          </span>
        </o-tooltip>
      </o-table-column>

    </o-table>
  </div>

  <EmptyTable v-if="!nodes.length"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, PropType, ref} from 'vue';
import {NetworkNode} from "@/schemas/HederaSchemas";
import {ORUGA_MOBILE_BREAKPOINT} from '@/App.vue';
import EmptyTable from "@/components/EmptyTable.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";
import StakeRange from "@/components/node/StakeRange.vue";
import {routeManager} from "@/router";
import {NodeRegistry} from "@/components/node/NodeRegistry";
import StringValue from "@/components/values/StringValue.vue";
import {makeAnnualizedRate, makeStakePercentage, makeUnclampedStake} from "@/schemas/HederaUtils";


//
// defineComponent
//

export default defineComponent({
  name: 'NodeTable',

  components: {StringValue, StakeRange, HbarAmount, EmptyTable},

  props: {
    nodes: Object as PropType<Array<NetworkNode> | undefined>,
    unclampedStakeTotal: Number,
    stakeTotal: Number,
  },

  setup(props) {
    const tooltipDelay = 500
    const tooltipStake = "This is the total amount staked to this node, followed by its consensus weight " +
        "(weight is absent when the amount staked is below minimum)."
    const tooltipNotRewarded = "This is the total amount staked to this node by accounts that have chosen " +
        "to decline rewards (and all accounts staked to those accounts)."
    const tooltipRewardRate = "This is an approximate annual reward rate based on the reward earned during the " +
        "last 24h period."

    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)

    const isCouncilNode = (node: NetworkNode) => NodeRegistry.isCouncilNode(ref(node.node_id ?? null), ref(null))
    const makeDescription = (node: NetworkNode) => NodeRegistry.getDescription(ref(node.node_id ?? null), ref(null))
    const makeWeightPercentage = (node: NetworkNode) => {
      return node.stake && props.stakeTotal ? makeStakePercentage(node, props.stakeTotal) : 0
    }

    const handleClick = (node: NetworkNode) => {
      routeManager.routeToNode(node.node_id ?? 0)
    }

    return {
      tooltipDelay,
      tooltipStake,
      tooltipNotRewarded,
      tooltipRewardRate,
      isTouchDevice,
      isMediumScreen,
      isCouncilNode,
      makeDescription,
      makeUnclampedStake,
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
