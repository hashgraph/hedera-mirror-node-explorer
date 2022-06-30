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
      <o-table-column v-slot="props" field="node_id" label="Node">
        <div class="is-numeric">
          {{ props.row.node_id }}
        </div>
      </o-table-column>

      <o-table-column v-slot="props" field="node_account_id" label="Account">
        <div class="is-numeric">
          {{ props.row.node_account_id }}
        </div>
      </o-table-column>

      <o-table-column v-slot="props" field="hosted_by" label="Hosted By">
        <div class="should-wrap">
          <BlobValue v-bind:blob-value="makeHost(props.row)" v-bind:show-none="true"/>
        </div>
      </o-table-column>

      <o-table-column v-slot="props" field="location" label="Location">
        <div class="should-wrap">
          <BlobValue v-bind:blob-value="makeLocation(props.row)" v-bind:show-none="true"/>
        </div>
      </o-table-column>

      <div v-if="isStakingEnabled">
        <o-table-column v-slot="props" field="stake" label="Stake" position="right">
          <HbarAmount :amount="props.row.stake" :decimals="0"/>
          <span>{{ ' (' + makeStakePercentage(props.row) + '%)' }}</span>
        </o-table-column>

        <o-table-column v-slot="props" field="stake_not_rewarded" label="Unrewarded Stake" position="right">
          <HbarAmount :amount="props.row.stake_not_rewarded" :decimals="0"/>
        </o-table-column>

<!--        <o-table-column field="stake_range" label="Stake Range">-->
<!--          <div class="is-flex-direction-column h-is-stake-range-bar">-->
<!--            <progress id="range" class="progress is-large is-info h-is-progress-bar" max="100"-->
<!--                      style="max-height: 8px; margin-bottom: 1px;" :value="45"></progress>-->
<!--            <div class="is-flex is-justify-content-space-between">-->
<!--              <img alt="Minimum staking mark" class="image" src="@/assets/min-mark.png"-->
<!--                   style="max-height: 8px; margin-left: 16px">-->
<!--              <img alt="Maximum staking mark" class="image" src="@/assets/max-mark.png" style="max-height: 8px">-->
<!--            </div>-->
<!--          </div>-->
<!--        </o-table-column>-->

      </div>
    </o-table>
  </div>

  <EmptyTable v-if="!nodes.length"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, PropType} from 'vue';
import {NetworkNode} from "@/schemas/HederaSchemas";
import BlobValue from "@/components/values/BlobValue.vue";
import {ORUGA_MOBILE_BREAKPOINT} from '@/App.vue';
import EmptyTable from "@/components/EmptyTable.vue";
import {operatorRegistry} from "@/schemas/OperatorRegistry";
import HbarAmount from "@/components/values/HbarAmount.vue";
import router from "@/router";


//
// defineComponent
//

export default defineComponent({
  name: 'NodeTable',

  components: {HbarAmount, EmptyTable, BlobValue},

  props: {
    nodes: Object as PropType<Array<NetworkNode> | undefined>,
    totalStaked: Number
  },

  setup(props) {
    const isStakingEnabled = process.env.VUE_APP_ENABLE_STAKING === 'true'

    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)

    const makeHost = (node: NetworkNode) => node.node_account_id ? operatorRegistry.lookup(node.node_account_id)?.name : null
    const makeLocation = (node: NetworkNode) => node.node_account_id ? operatorRegistry.lookup(node.node_account_id)?.location : null
    const makeStakePercentage = (node: NetworkNode) => {
      return node.stake && props.totalStaked ? node.stake / props.totalStaked : 0
    }

    const handleClick = (node: NetworkNode) => {
      router.push({name: 'NodeDetails', params: {nodeId: node.node_id}})
    }

    return {
      isStakingEnabled,
      isTouchDevice,
      isMediumScreen,
      makeHost,
      makeLocation,
      makeStakePercentage,
      handleClick,
      ORUGA_MOBILE_BREAKPOINT
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>

</style>
