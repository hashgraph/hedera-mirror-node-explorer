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
      pagination-order="left"
      :range-before="0"
      :range-after="0"

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
      <div class="is-numeric">
        {{ props.row.contract_id }}
      </div>
    </o-table-column>

    <o-table-column v-slot="props" field="contract_name" label="Contract Name">
      <ContractName :contract-id="props.row.contract_id"/>
    </o-table-column>

    <o-table-column v-slot="props" field="created" label="Created">
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

<script lang="ts">

import {computed, ComputedRef, defineComponent, onBeforeUnmount, onMounted, PropType} from 'vue';
import {Contract} from "@/schemas/HederaSchemas";
import TimestampValue from "@/components/values/TimestampValue.vue";
import {routeManager} from "@/router";
import {ORUGA_MOBILE_BREAKPOINT} from "@/BreakPoints";
import EmptyTable from "@/components/EmptyTable.vue";
import ContractName from "@/components/values/ContractName.vue";
import {VerifiedContractsController} from "@/components/contract/VerifiedContractsController";
import TablePageSize from "@/components/transaction/TablePageSize.vue";

export default defineComponent({
  name: 'VerifiedContractsTable',

  components: {TablePageSize, ContractName, EmptyTable, TimestampValue},

  props: {
    controller: {
      type: Object as PropType<VerifiedContractsController>,
      required: true
    },
    loaded: Boolean,
    overflow: Boolean
  },

  setup(props) {
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

    return {
      noDataMessage,
      handleClick,
      ORUGA_MOBILE_BREAKPOINT,
      contracts: props.controller.contracts,
      perPage: props.controller.pageSize,
      storageKey: props.controller.storageKey,
      paginated: props.controller.paginated as ComputedRef<boolean>,
      showPageSizeSelector: props.controller.showPageSizeSelector as ComputedRef<boolean>,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
