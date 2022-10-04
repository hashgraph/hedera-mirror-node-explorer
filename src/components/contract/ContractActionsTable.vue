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

  <div id="contractActionsTable">
    <o-table
        :data="actions"
        :hoverable="true"
        :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"
        :paginated="false"
        :striped="true"
        default-sort="node_id"
        @click="handleClick"
    >
      <o-table-column v-slot="props" field="index" label="Index">
        <div class="is-numeric regular-node-column">
          {{ props.row.index }}
        </div>
      </o-table-column>

      <o-table-column v-slot="props" field="call_depth" label="Call Depth">
        <div class="is-numeric regular-node-column">
          {{ props.row.call_depth }}
        </div>
      </o-table-column>

      <o-table-column v-slot="props" field="call_type" label="Call Type">
        <div class="regular-node-column">
          {{ props.row.call_operation_type }}
        </div>
      </o-table-column>

      <o-table-column v-slot="props" field="from" label="From">
        <div class="regular-node-column">
          {{ props.row.from }}
        </div>
      </o-table-column>

      <o-table-column v-slot="props" field="amount" label="Amount">
        <div class="is-numeric regular-node-column">
          {{ props.row.value }}
        </div>
      </o-table-column>

      <o-table-column v-slot="props" field="to" label="To">
        <div class="regular-node-column">
          {{ props.row.to }}
        </div>
      </o-table-column>

      <o-table-column v-slot="props" field="gas_limit" label="Gas Limit">
        <div class="is-numeric regular-node-column">
          {{ props.row.gas }}
        </div>
      </o-table-column>

    </o-table>
  </div>

  <EmptyTable v-if="!actions.length"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, PropType} from 'vue';
import {ContractAction} from "@/schemas/HederaSchemas";
import {ORUGA_MOBILE_BREAKPOINT} from '@/App.vue';
import EmptyTable from "@/components/EmptyTable.vue";

//
// defineComponent
//

export default defineComponent({
  name: 'ContractActionsTable',

  components: {EmptyTable},

  props: {
    actions: Object as PropType<Array<ContractAction> | undefined>,
  },

  setup() {
    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)

    const handleClick = (action: ContractAction) => {
      console.log("Should show details of action:" + action.index)
    }

    return {
      isTouchDevice,
      isMediumScreen,
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
</style>
