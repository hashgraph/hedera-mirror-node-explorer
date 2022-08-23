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
      v-model:current-page="currentPage"
      :data="blocks"
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
      customRowKey="number"
      @click="handleClick"
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
  </o-table>

  <EmptyTable v-if="!blocks.length"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, PropType, ref} from 'vue';
import {Block} from '@/schemas/HederaSchemas';
import router from "@/router";
import TimestampValue from "@/components/values/TimestampValue.vue";
import {ORUGA_MOBILE_BREAKPOINT} from '@/App.vue';
import EmptyTable from "@/components/EmptyTable.vue";
import PlainAmount from "@/components/values/PlainAmount.vue";

export default defineComponent({
  name: 'BlockTable',

  components: {PlainAmount, TimestampValue, EmptyTable },

  props: {
    narrowed: Boolean,
    nbItems: Number,
    blocks: {
      type: Array as PropType<Array<Block>>,
      default: () => []
    }
  },

  setup(props) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)

    const DEFAULT_PAGE_SIZE = 15
    const pageSize = props.nbItems ?? DEFAULT_PAGE_SIZE
    const paginationNeeded = computed(() => {
          return props.blocks.length > 5
        }
    )

    // 3) handleClick
    const handleClick = (t: Block) => {
      router.push({name: 'BlockDetails', params: {blockHon: t.number}})
    }

    // 4) currentPage
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
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>