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

  <o-table
      v-model:current-page="currentPage"
      :data="results"
      :hoverable="true"
      :loading="loading"
      :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"
      :narrowed="true"
      :paginated="paginated"
      pagination-order="left"
      :range-before="0"
      :range-after="0"
      :per-page="perPage"
      :striped="true"

      :total="total"
      aria-current-label="Current page"
      aria-next-label="Next page"
      aria-page-label="Page"

      aria-previous-label="Previous page"
      backend-pagination
      customRowKey="consensus_timestamp"
      default-sort="consensus_timestamp"
      @cell-click="handleClick"
      @page-change="onPageChange">

    <o-table-column v-slot="props" field="timestamp" label="Time">
      <TimestampValue v-bind:timestamp="props.row.timestamp"/>
      <span v-if="props.row.error_message" class="icon has-text-danger">
        <i class="fas fa-exclamation-triangle"></i>
      </span>
    </o-table-column>

    <o-table-column v-slot="props" field="from" label="From">
      <EVMAddress :address="props.row.from" :compact="false" :enable-copy="false"/>
    </o-table-column>

    <o-table-column v-slot="props" field="message" label="Error Message" position="left">
      <StringValue :string-value="makeErrorMessage(props.row)"/>
    </o-table-column>

    <o-table-column v-slot="props" field="amount" label="Transfer Amount" position="right">
      <HbarAmount :amount="props.row.amount"/>
    </o-table-column>

    <template v-slot:bottom-left>
      <TablePageSize
          v-model:size="perPage"
          :storage-key="AppStorage.RECENT_CALL_TABLE_PAGE_SIZE_KEY"
      />
    </template>

  </o-table>

  <TablePageSize
      v-if="!paginated && showPageSizeSelector"
      v-model:size="perPage"
      :storage-key="AppStorage.RECENT_CALL_TABLE_PAGE_SIZE_KEY"
      style="width: 116px; margin-left: 4px"
  />

  <EmptyTable v-if="!results.length"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {ComputedRef, defineComponent, inject, PropType, Ref} from 'vue';
import {ContractResult} from "@/schemas/MirrorNodeSchemas";
import {ORUGA_MOBILE_BREAKPOINT} from "@/BreakPoints";
import {ContractResultTableController} from "@/components/contract/ContractResultTableController";
import TimestampValue from "@/components/values/TimestampValue.vue";
import EmptyTable from "@/components/EmptyTable.vue";
import {routeManager} from "@/router";
import StringValue from "@/components/values/StringValue.vue";
import EVMAddress from "@/components/values/EVMAddress.vue";
import {decodeSolidityErrorMessage} from "@/schemas/MirrorNodeUtils.ts";
import HbarAmount from "@/components/values/HbarAmount.vue";
import TablePageSize from "@/components/transaction/TablePageSize.vue";
import {AppStorage} from "@/AppStorage";

export default defineComponent({
  name: 'ContractResultTable',

  components: {TablePageSize, HbarAmount, EVMAddress, StringValue, EmptyTable, TimestampValue},

  props: {
    controller: {
      type: Object as PropType<ContractResultTableController>,
      required: true
    }
  },

  setup: function (props) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)

    const handleClick = (result: ContractResult, c: unknown, i: number, ci: number, event: MouseEvent) => {
      routeManager.routeToTransactionByTs(result.timestamp, event)
    }

    const makeErrorMessage = (result: ContractResult) => {
      return decodeSolidityErrorMessage(result.error_message ?? null)
    }

    return {
      isTouchDevice,
      isSmallScreen,
      isMediumScreen,
      results: props.controller.rows as ComputedRef<ContractResult[]>,
      loading: props.controller.loading as ComputedRef<boolean>,
      total: props.controller.totalRowCount as ComputedRef<number>,
      currentPage: props.controller.currentPage as Ref<number>,
      onPageChange: props.controller.onPageChange,
      perPage: props.controller.pageSize as Ref<number>,
      paginated: props.controller.paginated as ComputedRef<boolean>,
      showPageSizeSelector: props.controller.showPageSizeSelector as ComputedRef<boolean>,
      handleClick,
      makeErrorMessage,
      AppStorage,
      // From App
      ORUGA_MOBILE_BREAKPOINT,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
