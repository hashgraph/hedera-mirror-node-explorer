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
      :data="contracts"
      :hoverable="true"
      :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"
      :narrowed="true"
      :paginated="contracts.length > perPage"
      pagination-order="center"
      :range-before="1"
      :range-after="1"

      :per-page="perPage"
      :striped="true"
      aria-current-label="Current page"

      aria-next-label="Next page"
      aria-page-label="Page"
      aria-previous-label="Previous page"
      customRowKey="contract_id"
      @cell-click="handleClick"
  >

    <o-table-column v-slot="props" field="contract_id" label="ID">
      <ContractIOL class="contract_id" :contract-id="props.row.contract_id"/>
    </o-table-column>

    <o-table-column v-slot="props" field="contract_name" label="CONTRACT NAME">
      <ContractName :contract-id="props.row.contract_id"/>
    </o-table-column>

    <o-table-column v-slot="props" field="created" label="CREATED">
      <TimestampValue v-bind:timestamp="props.row.created_timestamp"/>
    </o-table-column>

    <template v-slot:bottom-left>
      <TablePageSize
          v-model:size="perPage"
          :storage-key="storageKey"
      />
    </template>
  </o-table>

  <TablePageSize
      v-if="!paginated && showPageSizeSelector"
      v-model:size="perPage"
      :storage-key="storageKey"
      style="width: 116px; margin-left: 4px"
  />

  <EmptyTable v-if="!contracts.length" :loading="!loaded" :no-data-message="noDataMessage"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, onBeforeUnmount, onMounted, PropType} from 'vue';
import {Contract} from "@/schemas/MirrorNodeSchemas";
import TimestampValue from "@/components/values/TimestampValue.vue";
import {routeManager} from "@/router";
import {ORUGA_MOBILE_BREAKPOINT} from "@/BreakPoints";
import EmptyTable from "@/components/EmptyTable.vue";
import ContractName from "@/components/values/ContractName.vue";
import {VerifiedContractsController} from "@/components/contract/VerifiedContractsController";
import TablePageSize from "@/components/transaction/TablePageSize.vue";
import ContractIOL from "@/components/values/link/ContractIOL.vue";

const props = defineProps({
  controller: {
    type: Object as PropType<VerifiedContractsController>,
    required: true
  },
  loaded: Boolean,
  overflow: Boolean
})

const noDataMessage = computed(() =>
    props.overflow
        ? 'No verified contract found in the last ' + props.controller.capacity + ' created contracts'
        : 'No data'
)

onMounted(() => props.controller.mount())
onBeforeUnmount(() => props.controller.unmount())

const handleClick = (contract: Contract, c: unknown, i: number, ci: number, event: MouseEvent) => {
  routeManager.routeToContract(contract.contract_id!, event)
}

const contracts = props.controller.contracts
const perPage = props.controller.pageSize
const storageKey = props.controller.storageKey
const paginated = props.controller.paginated
const showPageSizeSelector = props.controller.showPageSizeSelector

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

.contract_id {
  font-weight: 600;
}

</style>
