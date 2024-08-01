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
      :data="transactions"
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
      @page-change="onPageChange"
      @cell-click="handleClick"
  >

    <o-table-column v-slot="props" field="contract_id" label="ID">
      <div class="is-numeric">
        {{ props.row.entity_id }}
      </div>
    </o-table-column>

    <o-table-column v-slot="props" field="contract_name" label="Contract Name">
      <ContractName :contract-id="props.row.entity_id"/>
    </o-table-column>

    <o-table-column v-slot="props" field="created" label="Created">
      <TimestampValue v-bind:timestamp="props.row.consensus_timestamp"/>
    </o-table-column>

  </o-table>

  <EmptyTable v-if="!transactions.length"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {ComputedRef, defineComponent, onBeforeUnmount, onMounted, PropType, Ref} from 'vue';
import {Transaction} from "@/schemas/HederaSchemas";
import TimestampValue from "@/components/values/TimestampValue.vue";
import {routeManager} from "@/router";
import {ORUGA_MOBILE_BREAKPOINT} from '@/App.vue';
import EmptyTable from "@/components/EmptyTable.vue";
import {TransactionTableController} from "@/components/transaction/TransactionTableController";
import ContractName from "@/components/values/ContractName.vue";

export default defineComponent({
  name: 'AccountCreatedContractsTable',

  components: {ContractName, EmptyTable, TimestampValue},

  props: {
    controller: {
      type: Object as PropType<TransactionTableController>,
      required: true
    }
  },

  setup(props) {

    onMounted(() => props.controller.mount())
    onBeforeUnmount(() => props.controller.unmount())

    const handleClick = (t: Transaction, c: unknown, i: number, ci: number, event: MouseEvent) => {
      routeManager.routeToContract(t.entity_id!, event.ctrlKey || event.metaKey || event.button === 1)
    }

    return {
      transactions: props.controller.rows as ComputedRef<Transaction[]>,
      loading: props.controller.loading as ComputedRef<boolean>,
      total: props.controller.totalRowCount as ComputedRef<number>,
      currentPage: props.controller.currentPage as Ref<number>,
      onPageChange: props.controller.onPageChange,
      perPage: props.controller.pageSize as Ref<number>,
      paginated: props.controller.paginated as ComputedRef<boolean>,
      handleClick,
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
