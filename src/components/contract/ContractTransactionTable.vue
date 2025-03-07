// SPDX-License-Identifier: Apache-2.0

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                     TEMPLATE                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>
  <o-table
    v-model:current-page="currentPage"
    :data="transactions"
    :loading="loading"
    :paginated="paginated"
    backend-pagination
    pagination-order="left"
    :range-before="0"
    :range-after="0"
    :total="total"
    :per-page="perPage"
    :hoverable="true"
    :narrowed="true"

    :striped="true"
    :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"
    aria-current-label="Current page"
    aria-next-label="Next page"

    aria-page-label="Page"
    aria-previous-label="Previous page"
    @page-change="onPageChange"
    custom-row-key="consensus_timestamp"
    @cell-click="handleClick"
    default-sort="consensus_timestamp"
  >
    <o-table-column
      v-slot="props"
      field="transaction_id"
      label="ID"
    >
      <TransactionLabel
        :transaction-id="props.row.transaction_id"
        :result="props.row.result"
      />
    </o-table-column>

    <o-table-column
      v-slot="props"
      field="name"
      label="Type"
    >
      <div
        class="h-has-pill"
        style="display: inline-block"
      >
        <div>{{ makeTypeLabel(props.row.name) }}</div>
      </div>
    </o-table-column>

    <o-table-column
      v-slot="props"
      field="transfers"
      label="Net Amount"
    >
      <span v-if="showPositiveNetAmount(props.row)">
        <HbarAmount :amount="computeNetAmount(props.row.transfers, props.row.charged_tx_fee)" />
      </span>
    </o-table-column>

    <o-table-column
      v-slot="props"
      field="fees"
      label="Fees"
    >
      <HbarAmount :amount="props.row.charged_tx_fee" />
    </o-table-column>

    <o-table-column
      v-slot="props"
      field="consensus_timestamp"
      label="Time"
    >
      <TimestampValue :timestamp="props.row.consensus_timestamp" />
    </o-table-column>
  </o-table>

  <EmptyTable v-if="!transactions.length" />
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {ComputedRef, defineComponent, inject, PropType, Ref} from 'vue';
import {Transaction} from "@/schemas/MirrorNodeSchemas";
import {computeNetAmount, makeTypeLabel, showPositiveNetAmount} from "@/utils/TransactionTools";
import {routeManager} from "@/router";
import TimestampValue from "@/components/values/TimestampValue.vue";
import TransactionLabel from "@/components/values/TransactionLabel.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";
import {ORUGA_MOBILE_BREAKPOINT} from "@/BreakPoints";
import EmptyTable from "@/components/EmptyTable.vue";
import {TransactionTableControllerXL} from "@/components/transaction/TransactionTableControllerXL";

export default defineComponent({
  name: 'ContractTransactionTable',

  components: {EmptyTable, HbarAmount, TimestampValue, TransactionLabel},

  props: {
    controller: {
      type: Object as PropType<TransactionTableControllerXL>,
      required: true
    }
  },

  setup: function (props) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)

    const handleClick = (t: Transaction, c: unknown, i: number, ci: number, event: MouseEvent) => {
      routeManager.routeToTransaction(t, event)
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
      paginated: props.controller.paginated as Ref<boolean>,
      handleClick,

      // From App
      ORUGA_MOBILE_BREAKPOINT,

      // From TransactionTools
      makeTypeLabel,
      computeNetAmount,
      showPositiveNetAmount,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
