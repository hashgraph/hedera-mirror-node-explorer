<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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
      @cell-click="handleClick"

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
    <o-table-column v-slot="props" field="timestamp" label="ID">
      <TransactionLabel v-bind:transaction-id="props.row.transaction_id" v-bind:result="props.row.result"/>
    </o-table-column>

    <o-table-column v-slot="props" field="name" label="Type">
      <div class="h-has-pill" style="display: inline-block">
        <div class="h-is-text-size-2">{{ makeTypeLabel(props.row.name) }}</div>
      </div>
    </o-table-column>

    <o-table-column v-if="showingEthereumTransactions" v-slot="props" field="sender" label="Sender">
      <InnerSenderEVMAddress :transaction-id="props.row.transaction_id"/>
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

import {computed, ComputedRef, defineComponent, inject, PropType, Ref} from "vue";
import {Transaction, TransactionType} from "@/schemas/HederaSchemas";
import TransactionSummary from "@/components/transaction/TransactionSummary.vue";
import TimestampValue from "@/components/values/TimestampValue.vue";
import TransactionLabel from "@/components/values/TransactionLabel.vue";
import {makeTypeLabel} from "@/utils/TransactionTools";
import {routeManager} from "@/router";
import {ORUGA_MOBILE_BREAKPOINT} from "@/App.vue";
import {TransactionTableControllerXL} from "@/components/transaction/TransactionTableControllerXL";
import EmptyTable from "@/components/EmptyTable.vue";
import InnerSenderEVMAddress from "@/components/values/InnerSenderEVMAddress.vue";

export default defineComponent({
  name: "TransactionTable",

  components: {InnerSenderEVMAddress, TransactionSummary, TimestampValue, TransactionLabel, EmptyTable},

  props: {
    narrowed: Boolean,
    controller: {
      type: Object as PropType<TransactionTableControllerXL>,
      required: true
    }
  },

  setup(props) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)

    const showingEthereumTransactions = computed(() => {
      return props.controller.transactionType.value === TransactionType.ETHEREUMTRANSACTION
    })

    const handleClick = (t: Transaction, c: unknown, i: number, ci: number, event: MouseEvent) => {
      routeManager.routeToTransaction(t, event.ctrlKey || event.metaKey)
    }

    return {
      isTouchDevice,
      isMediumScreen,
      transactions: props.controller.rows as ComputedRef<Transaction[]>,
      loading: props.controller.loading as ComputedRef<boolean>,
      total: props.controller.totalRowCount as ComputedRef<number>,
      currentPage: props.controller.currentPage as Ref<number>,
      onPageChange: props.controller.onPageChange,
      perPage: props.controller.pageSize as Ref<number>,
      showingEthereumTransactions,
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
