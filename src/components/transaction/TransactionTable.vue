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
      :data="transactions"
      :loading="loading"
      paginated
      backend-pagination
      :total="total"
      v-model:current-page="currentPage"
      :per-page="perPage"
      @page-change="onPageChange"
      @click="handleClick"

      :hoverable="true"
      :narrowed="narrowed"
      :striped="true"
      :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"

      aria-current-label="Current page"
      aria-next-label="Next page"
      aria-page-label="Page"
      aria-previous-label="Previous page"
      customRowKey="consensus_timestamp"
  >
    <o-table-column v-slot="props" field="transaction_id" label="ID">
      <TransactionLabel v-bind:transaction-id="props.row.transaction_id" v-bind:result="props.row.result"/>
    </o-table-column>

    <o-table-column v-slot="props" field="name" label="Type">
      <div class="h-has-pill" style="display: inline-block">
        <div class="h-is-text-size-2">{{ makeTypeLabel(props.row.name) }}</div>
      </div>
    </o-table-column>

    <o-table-column v-slot="props" label="Content">
      <TransactionSummary v-bind:transaction="props.row"/>
    </o-table-column>

    <o-table-column v-slot="props" field="consensus_timestamp" label="Time">
      <TimestampValue v-bind:timestamp="props.row.consensus_timestamp"/>
    </o-table-column>
  </o-table>

  <EmptyTable v-if="transactions.length === 0"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {ComputedRef, defineComponent, inject, PropType, Ref} from "vue";
import {Transaction} from "@/schemas/HederaSchemas";
import TransactionSummary from "@/components/transaction/TransactionSummary.vue";
import TimestampValue from "@/components/values/TimestampValue.vue";
import TransactionLabel from "@/components/values/TransactionLabel.vue";
import {makeTypeLabel} from "@/utils/TransactionTools";
import router from "@/router";
import {ORUGA_MOBILE_BREAKPOINT} from "@/App.vue";
import {TransactionTableController} from "@/components/transaction/TransactionTableController";
import EmptyTable from "@/components/EmptyTable.vue";

export default defineComponent({
  name: "TransactionTable",

  components: {TransactionSummary, TimestampValue, TransactionLabel, EmptyTable },

  props: {
    narrowed: Boolean,
    tableController: {
      type: Object as PropType<TransactionTableController>,
      required: true
    }
  },

  setup(props) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)

    const handleClick = (t: Transaction) => {
      router.push({name: 'TransactionDetails', params: {transactionId: t.transaction_id}, query: {t: t.consensus_timestamp}})
    }

    return {
      isTouchDevice,
      isMediumScreen,
      transactions: props.tableController.rows as ComputedRef<Transaction[]>,
      loading: props.tableController.loading as ComputedRef<boolean>,
      total: props.tableController.totalRowCount as ComputedRef<number>,
      currentPage: props.tableController.currentPage as Ref<number>,
      onPageChange: props.tableController.onPageChange,
      perPage: props.tableController.pageSize as number,
      handleClick,
      makeTypeLabel,
      ORUGA_MOBILE_BREAKPOINT,
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped/>
