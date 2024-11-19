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

  <div id="contractActionsTable">
    <o-table
        :data="actions ?? []"
        :paginated="isPaginated"
        pagination-order="left"
        :range-before="0"
        :range-after="0"
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
        <div class="is-flex is-align-items-baseline">
          <span class="is-family-monospace h-is-text-size-3 has-text-grey">
            {{ props.row.depthPath }}
          </span>
          <span v-if="isSuccessful(props.row.action)" class="ml-2 h-has-pill h-is-text-size-1 has-background-success">
            {{ makeOperationType(props.row.action) }}
          </span>
          <span v-else class="ml-2 h-has-pill h-is-text-size-2 has-background-danger">
            {{ '! ' + makeOperationType(props.row.action) }}
          </span>
        </div>
      </o-table-column>

      <o-table-column v-slot="props" field="from" label="From">
        <EVMAddress :address="props.row.action.from"
                    :id="props.row.action.caller"
                    :entity-type="props.row.action.caller_type"
                    :compact="!isLargeScreen && isMediumScreen"/>
      </o-table-column>

      <o-table-column v-slot="props" field="amount" label="Amount">
        <div class="is-flex is-align-items-end is-align-content-end is-numeric">
          <span style="font-size: 13px; margin-right: 2px">&#8594;</span>
          <HbarAmount :amount="props.row.action.value" :timestamp="props.row.action.timestamp" :show-extra="true"/>
          <span style="font-size: 13px; margin-left: 2px;: 2px">&#8594;</span>
        </div>
      </o-table-column>

      <o-table-column v-slot="props" field="to" label="To">
        <EVMAddress :address="props.row.action.to"
                    :id="props.row.action.recipient??''"
                    :entity-type="props.row.action.recipient_type"
                    :compact="!isLargeScreen && isMediumScreen"/>
      </o-table-column>

      <o-table-column v-slot="props" field="gas_limit" label="Gas Limit">
        <div class="is-numeric">
          {{ props.row.action.gas }}
        </div>
      </o-table-column>

      <template v-slot:detail="props">
        <tr>
          <td/>
          <td colspan="4">
            <ContractActionDetails :action="props.row.action"/>
          </td>
        </tr>
      </template>

    </o-table>
  </div>

  <EmptyTable v-if="!actions?.length"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, PropType} from 'vue';
import {ContractAction} from "@/schemas/MirrorNodeSchemas";
import {ORUGA_MOBILE_BREAKPOINT} from "@/BreakPoints";
import EmptyTable from "@/components/EmptyTable.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";
import ContractActionDetails from "@/components/contract/ContractActionDetails.vue";
import EVMAddress from "@/components/values/EVMAddress.vue";
import {ContractActionWithPath} from "@/components/contract/ContractActionsLoader";
import {FunctionCallAnalyzer} from "@/utils/analyzer/FunctionCallAnalyzer";

//
// defineComponent
//

const NB_ACTIONS_PER_PAGE = 10

export default defineComponent({
  name: 'ContractActionsTable',

  components: {EVMAddress, HbarAmount, ContractActionDetails, EmptyTable},

  props: {
    actions: Array as PropType<Array<ContractActionWithPath> | undefined>,
    expandedActions: {
      type: Array as PropType<Array<ContractActionWithPath>>,
      default: () => []
    },
    analyzer: {
      type: Object as PropType<FunctionCallAnalyzer>,
      required: true
    }
  },

  setup(props, context) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    const isLargeScreen = inject('isLargeScreen', true)

    const isPaginated = computed(() => (props.actions?.length ?? 0) > NB_ACTIONS_PER_PAGE)

    const isSuccessful = (action: ContractAction) => action.result_data_type == "OUTPUT"

    const makeOperationType = (action: ContractAction) => action.call_operation_type ?? action.call_type

    const onOpenedDetailedChange = (newValue: ContractAction[]) => {
      context.emit("update:expandedActions", newValue)
    }

    return {
      isTouchDevice,
      isSmallScreen,
      isMediumScreen,
      isLargeScreen,
      NB_ACTIONS_PER_PAGE,
      isPaginated,
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
