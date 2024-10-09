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
      :data="tokens"
      :loading="loading"
      paginated
      backend-pagination
      pagination-order="left"
      :range-before="0"
      :range-after="0"
      :total="total"
      v-model:current-page="currentPage"
      :per-page="perPage"
      @cell-click="handleClick"

      :hoverable="true"
      :narrowed="narrowed"
      :striped="true"
      :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"

      aria-current-label="Current page"
      aria-next-label="Next page"
      aria-page-label="Page"
      aria-previous-label="Previous page"
      customRowKey="token_id"
  >
    <o-table-column v-slot="props" field="token_id" label="Token">
      <TokenIOL :token-id="props.row.token_id"/>
    </o-table-column>

    <o-table-column v-slot="props" field="name" label="Name">
      <div class="w400">
        {{ props.row.name }}
      </div>
    </o-table-column>

    <o-table-column v-slot="props" field="symbol" label="Symbol">
      <div class="w400">
        {{ props.row.symbol }}
      </div>
    </o-table-column>

    <template v-slot:bottom-left>
      <TablePageSize
          v-model:size="perPage"
          :storage-key="AppStorage.TOKEN_TABLE_PAGE_SIZE_KEY"
      />
    </template>
  </o-table>

  <EmptyTable v-if="!tokens.length"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted, PropType, ref} from 'vue';
import {Token} from '@/schemas/HederaSchemas';
import {routeManager} from "@/router";
import {ORUGA_MOBILE_BREAKPOINT} from '@/App.vue';
import EmptyTable from "@/components/EmptyTable.vue";
import TablePageSize from "@/components/transaction/TablePageSize.vue";
import TokenIOL from "@/components/values/link/TokenIOL.vue";
import {AppStorage} from "@/AppStorage";
import {TokensByNameTableLoader} from "@/components/token/TokensByNameTableLoader";

export default defineComponent({
  name: 'TokensByNameTable',
  computed: {
    AppStorage() {
      return AppStorage
    }
  },

  components: {TokenIOL, TablePageSize, EmptyTable},

  props: {
    narrowed: Boolean,
    nbItems: Number,
    name: {
      type: String as PropType<string|null>,
      default: null
    }
  },

  setup(props) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)

    const perPage = ref(isMediumScreen ? 15 : 10)
    const targetName = computed(() => props.name)
    const loader = new TokensByNameTableLoader(perPage, targetName)
    onMounted(() => {
      loader.mount()
    })
    onBeforeUnmount(() => {
      loader.unmount()
    })

    const handleClick = (t: Token, c: unknown, i: number, ci: number, event: MouseEvent) => {
      if (t.token_id !== null) {
        routeManager.routeToToken(t.token_id, event)
      }
    }

    return {
      isTouchDevice,
      isMediumScreen,
      tokens: loader.rows,
      loading: loader.loading,
      total: loader.totalRowCount,
      currentPage: loader.currentPage,
      perPage: loader.pageSize,
      handleClick,
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
