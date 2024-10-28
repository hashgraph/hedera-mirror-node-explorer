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
      :data="rewards"
      :loading="loading"
      :paginated="paginated"
      backend-pagination
      pagination-order="left"
      :range-before="0"
      :range-after="0"
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
    <o-table-column v-slot="props" field="timestamp" label="Time">
      <TimestampValue v-bind:timestamp="props.row.timestamp"/>
    </o-table-column>

    <o-table-column v-slot="props" field="amount" label="Amount Rewarded" position="right">
      <HbarAmount v-bind:amount="props.row.amount"/>
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

  <EmptyTable v-if="!rewards.length"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {ComputedRef, defineComponent, inject, onBeforeUnmount, onMounted, PropType, Ref} from 'vue';
import {StakingReward} from '@/schemas/HederaSchemas';
import {makeTypeLabel} from "@/utils/TransactionTools";
import {routeManager} from "@/router";
import TimestampValue from "@/components/values/TimestampValue.vue";
import {ORUGA_MOBILE_BREAKPOINT} from "@/BreakPoints";
import EmptyTable from "@/components/EmptyTable.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";
import {StakingRewardsTableController} from "@/components/staking/StakingRewardsTableController";
import TablePageSize from "@/components/transaction/TablePageSize.vue";
import {AppStorage} from "@/AppStorage";

export default defineComponent({
  name: 'StakingRewardsTable',
  computed: {
    AppStorage() {
      return AppStorage
    }
  },

  components: {TablePageSize, HbarAmount, EmptyTable, TimestampValue},

  props: {
    narrowed: Boolean,
    controller: {
      type: Object as PropType<StakingRewardsTableController>,
      required: true
    },
  },

  setup(props) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)

    onMounted(() => props.controller.mount())
    onBeforeUnmount(() => props.controller.unmount())

    const handleClick = (t: StakingReward, c: unknown, i: number, ci: number, event: MouseEvent) => {
      if (t.timestamp) {
        routeManager.routeToTransactionByTs(t.timestamp, event)
      }
    }

    return {
      isTouchDevice,
      isMediumScreen,
      rewards: props.controller.rows as ComputedRef<StakingReward[]>,
      loading: props.controller.loading as ComputedRef<boolean>,
      total: props.controller.totalRowCount as ComputedRef<number>,
      currentPage: props.controller.currentPage as Ref<number>,
      onPageChange: props.controller.onPageChange,
      perPage: props.controller.pageSize as Ref<number>,
      storageKey: props.controller.storageKey,
      paginated: props.controller.paginated as ComputedRef<boolean>,
      showPageSizeSelector: props.controller.showPageSizeSelector as ComputedRef<boolean>,
      accountId: props.controller.accountId as Ref<string>,
      handleClick,

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
