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
        :paginated="isPaginated"
        :per-page="NB_ACTIONS_PER_PAGE"

        detailed
        custom-detail-row
        :openedDetailed="expandedActions"
        @update:openedDetailed="onOpenedDetailedChange"

        :hoverable="false"
        :narrowed="true"
        :striped="false"
        :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"

        aria-current-label="Current page"
        aria-next-label="Next page"
        aria-page-label="Page"
        aria-previous-label="Previous page"
    >

      <o-table-column v-slot="props" field="call_type" label="Call Type">
          <span class="is-numeric has-text-grey">
            {{ makeActionDepth(props.row.call_depth) }}
          </span>
        <span v-if="isSuccessful(props.row)" class="ml-2 h-has-pill h-is-text-size-2 has-background-success">
            {{ makeOperationType(props.row) }}
          </span>
        <span v-else class="ml-2 h-has-pill h-is-text-size-2 has-background-danger">
            {{ '! ' + makeOperationType(props.row) }}
          </span>
      </o-table-column>

      <o-table-column v-slot="props" field="from" label="From">
        <EVMAddress :address="props.row.from" :id="props.row.caller" :bytes-kept="6"/>
      </o-table-column>

      <o-table-column v-slot="props" field="amount" label="Amount">
        <div class="is-flex is-align-items-end is-align-content-end is-numeric">
         <span style="font-size: 13px; margin-right: 2px">&#8594;</span>
          <HbarAmount :amount="props.row.value" :show-extra="true"/>
          <span style="font-size: 13px; margin-left: 2px;: 2px">&#8594;</span>
        </div>
      </o-table-column>

      <o-table-column v-slot="props" field="to" label="To">
        <EVMAddress :address="props.row.to" :id="props.row.recipient" :bytes-kept="6"/>
      </o-table-column>

      <o-table-column v-slot="props" field="gas_limit" label="Gas Limit">
        <div class="is-numeric">
          {{ props.row.gas }}
        </div>
      </o-table-column>

      <template v-slot:detail="props">
        <tr>
          <td/>
          <td colspan="5">
            <ContractActionDetails :action="props.row"/>
          </td>
        </tr>
      </template>

    </o-table>
  </div>

  <EmptyTable v-if="!actions.length"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, PropType} from 'vue';
import {ContractAction} from "@/schemas/HederaSchemas";
import {ORUGA_MOBILE_BREAKPOINT} from '@/App.vue';
import EmptyTable from "@/components/EmptyTable.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";
import ContractActionDetails from "@/components/contract/ContractActionDetails.vue";
import EVMAddress from "@/components/values/EVMAddress.vue";

//
// defineComponent
//

const NB_ACTIONS_PER_PAGE = 8

export default defineComponent({
  name: 'ContractActionsTable',

  components: {EVMAddress, HbarAmount, ContractActionDetails, EmptyTable},

  props: {
    actions: Array as PropType<Array<ContractAction> | undefined>,
    expandedActions:  {
      type: Array as PropType<Array<ContractAction>>,
      default: () => []
    }
  },

  setup(props, context) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)

    const isPaginated = computed(() => (props.actions?.length??0) > NB_ACTIONS_PER_PAGE)

    const makeActionDepth = (depth: number): string => {
      let result = ""
      for (let i = 0; i <= depth; i++) {
        result += "_" + i
      }
      return result
    }

    const isSuccessful = (action: ContractAction) => action.result_data_type == "OUTPUT"

    const makeOperationType = (action: ContractAction) => action.call_operation_type ?? action.call_type

    const onOpenedDetailedChange = (newValue: ContractAction[]) => {
      context.emit("update:expandedActions", newValue)
    }

    return {
      isTouchDevice,
      isMediumScreen,
      NB_ACTIONS_PER_PAGE,
      isPaginated,
      makeActionDepth,
      isSuccessful,
      makeOperationType,
      onOpenedDetailedChange,
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
