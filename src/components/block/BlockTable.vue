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

<!--

  USAGE NOTES

  <template>
    ...
    <BlockTable v-bind:blocks="blocks"/>
    ...
  </template>

  <script>
    ...
    const blockCache = new BlockCache()
    ...

    return {
      blocks: blockCache.blocks
    }
  </script>

  -->

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                     TEMPLATE                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>

  <o-table
      :data="blocks"
      :loading="loading"
      paginated
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
      customRowKey="number"
  >
    <o-table-column v-slot="props" field="number" label="Number">
      {{ props.row.number }}
    </o-table-column>

    <o-table-column v-slot="props" field="timestamp" label="Start Time">
      <TimestampValue v-bind:timestamp="props.row.timestamp.from"/>
    </o-table-column>

    <o-table-column v-slot="props" field="count" label="No. Transactions" position="right">
      <PlainAmount v-bind:amount="props.row.count"/>
    </o-table-column>

    <o-table-column v-slot="props" field="gas_used" label="Gas Used" position="right">
      <PlainAmount v-bind:amount="props.row.gas_used"/>
    </o-table-column>

    <template v-slot:bottom-left>
      <TablePageSize
          v-model:size="perPage"
          :storage-key="AppStorage.BLOCK_TABLE_PAGE_SIZE_KEY"
      />
    </template>
  </o-table>

  <EmptyTable v-if="!blocks.length"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {ComputedRef, defineComponent, inject, PropType, Ref} from 'vue';
import {Block} from '@/schemas/HederaSchemas';
import {routeManager} from "@/router";
import TimestampValue from "@/components/values/TimestampValue.vue";
import {ORUGA_MOBILE_BREAKPOINT} from "@/BreakPoints";
import EmptyTable from "@/components/EmptyTable.vue";
import PlainAmount from "@/components/values/PlainAmount.vue";
import {BlockTableController} from "@/components/block/BlockTableController";
import TablePageSize from "@/components/transaction/TablePageSize.vue";
import {AppStorage} from "@/AppStorage";

export default defineComponent({
  name: 'BlockTable',

  components: {TablePageSize, PlainAmount, TimestampValue, EmptyTable},

  props: {
    narrowed: Boolean,
    controller: {
      type: Object as PropType<BlockTableController>,
      required: true
    },
  },

  setup(props) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)

    const handleClick = (block: Block, c: unknown, i: number, ci: number, event: MouseEvent) => {
      if (block.number) {
        routeManager.routeToBlock(block.number, event)
      }
    }

    return {
      isTouchDevice,
      isMediumScreen,
      blocks: props.controller.rows as ComputedRef<Block[]>,
      loading: props.controller.loading as ComputedRef<boolean>,
      total: props.controller.totalRowCount as ComputedRef<number>,
      currentPage: props.controller.currentPage as Ref<number>,
      onPageChange: props.controller.onPageChange,
      perPage: props.controller.pageSize as Ref<number>,
      handleClick,
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
