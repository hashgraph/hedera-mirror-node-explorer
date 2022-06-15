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

    <o-table-column v-slot="props" field="description" label="Description">
      <div class="should-wrap">
        <BlobValue v-bind:blob-value="makeDescription(props.row)" v-bind:show-none="true"/>
      </div>
    </o-table-column>

    <o-table-column field="stake" label="Stake">
      <div class="should-wrap">
        <HbarAmount :amount="0"  />
      </div>
    </o-table-column>

  </o-table>

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
import router from "@/router";
import {operatorRegistry} from "@/schemas/OperatorRegistry";
import HbarAmount from "@/components/values/HbarAmount.vue";


//
// defineComponent
//

export default defineComponent({
  name: 'NodeTable',

  components: {HbarAmount, EmptyTable, BlobValue},

  props: {
    nodes: Object as PropType<Array<NetworkNode>|undefined>,
  },

  setup() {
    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)

    const makeDescription = (node: NetworkNode) => {
      let result
      if (node.description) {
        result = node.description
      } else {
        result = node.node_account_id ? operatorRegistry.lookup(node.node_account_id)?.getDescription() : null
      }
      return result
    }

    const handleClick = (n: NetworkNode) => {
      router.push({name: 'NodeDetails', params: { nodeId: n.node_id}})
    }

    return {
      isTouchDevice,
      isMediumScreen,
      makeDescription,
      handleClick,
      ORUGA_MOBILE_BREAKPOINT
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
