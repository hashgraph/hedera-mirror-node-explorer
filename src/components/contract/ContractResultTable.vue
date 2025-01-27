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
      pagination-order="centered"
      :range-before="1"
      :range-after="1"
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

    <o-table-column v-slot="props" field="timestamp" label="TIME">
      <div style="display: flex; gap: 8px;">
        <TimestampValue class="h-is-bold" :timestamp="props.row.timestamp"/>
        <TriangleAlert v-if="props.row.error_message" :size="18" class="h-text-error"/>
      </div>
    </o-table-column>

    <o-table-column v-slot="props" field="from" label="FROM">
      <EVMAddress :address="props.row.from" :compact="!isLargeScreen" :enable-copy="false"/>
    </o-table-column>

    <o-table-column v-slot="props" field="message" label="MESSAGE" position="left">
      <StringValue :string-value="makeErrorMessage(props.row)"/>
    </o-table-column>

    <o-table-column v-slot="props" field="amount" label="TRANSFER AMOUNT" position="right">
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

<script setup lang="ts">

import {inject, PropType} from 'vue';
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
import {TriangleAlert} from 'lucide-vue-next';

const props = defineProps({
  controller: {
    type: Object as PropType<ContractResultTableController>,
    required: true
  }
})

const isLargeScreen = inject('isLargeScreen', true)

const handleClick = (result: ContractResult, c: unknown, i: number, ci: number, event: MouseEvent) => {
  routeManager.routeToTransactionByTs(result.timestamp, event)
}

const makeErrorMessage = (result: ContractResult) => {
  return decodeSolidityErrorMessage(result.error_message ?? null)
}

const results = props.controller.rows
const loading = props.controller.loading
const total = props.controller.totalRowCount
const currentPage = props.controller.currentPage
const onPageChange = props.controller.onPageChange
const perPage = props.controller.pageSize
const paginated = props.controller.paginated
const showPageSizeSelector = props.controller.showPageSizeSelector

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
