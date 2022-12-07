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
      v-model:current-page="currentPage"
      :data="transactions"
      :hoverable="true"
      :narrowed="narrowed"
      :paginated="!isTouchDevice && paginationNeeded"
      :per-page="isMediumScreen ? pageSize : 5"
      :striped="true"
      :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"
      aria-current-label="Current page"
      aria-next-label="Next page"
      aria-page-label="Page"
      aria-previous-label="Previous page"
      customRowKey="consensus_timestamp"
      @click="handleClick"
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

    <o-table-column v-slot="props" field="consensus_timestamp" label="Time & Date">
      <TimestampValue v-bind:timestamp="props.row.consensus_timestamp"/>
    </o-table-column>

  </o-table>

  <EmptyTable v-if="!transactions.length"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, PropType, ref} from 'vue';
import {Transaction} from '@/schemas/HederaSchemas';
import {makeTypeLabel} from "@/utils/TransactionTools";
import {routeManager} from "@/router";
import TimestampValue from "@/components/values/TimestampValue.vue";
import TransactionLabel from "@/components/values/TransactionLabel.vue";
import {ORUGA_MOBILE_BREAKPOINT} from '@/App.vue';
import EmptyTable from "@/components/EmptyTable.vue";
import TransactionSummary from "@/components/transaction/TransactionSummary.vue";

export default defineComponent({
  name: 'BlockTransactionTable',

  components: {TransactionSummary, EmptyTable, TimestampValue, TransactionLabel },

  props: {
    narrowed: Boolean,
    nbItems: Number,
    transactions: {
      type: Array as PropType<Array<Transaction>>,
      default: () => []
    },
    accountId: String
  },

  setup(props) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)

    const DEFAULT_PAGE_SIZE = 15
    const pageSize = props.nbItems ?? DEFAULT_PAGE_SIZE
    const paginationNeeded = computed(() => {
          return props.transactions.length > 5
        }
    )

    const handleClick = (t: Transaction) => {
      routeManager.routeToTransaction(t)
    }

    let currentPage = ref(1)

    return {
      isTouchDevice,
      isMediumScreen,
      pageSize,
      paginationNeeded,
      handleClick,
      currentPage,

      // From App
      ORUGA_MOBILE_BREAKPOINT,

      // From TransactionTools
      makeTypeLabel,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>