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
      :data="ercs"
      :loading="loading"
      paginated
      backend-pagination
      pagination-order="centered"
      :range-before="1"
      :range-after="1"
      :total="total"
      v-model:current-page="currentPage"
      :per-page="pageSize"
      @cell-click="handleClick"

      :hoverable="true"
      :narrowed="props.narrowed"
      :striped="true"
      :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"

      aria-current-label="Current page"
      aria-next-label="Next page"
      aria-page-label="Page"
      aria-previous-label="Previous page"
      customRowKey="token_id"
  >
    <o-table-column v-slot="props" field="contract_id" label="CONTRACT ID">
      <ContractIOL class="h-is-bold" :contract-id="props.row.contractId"/>
    </o-table-column>

    <o-table-column v-slot="props" field="name" label="NAME">
      <div class="w400">
        {{ props.row.name }}
      </div>
    </o-table-column>

    <o-table-column v-slot="props" field="symbol" label="SYMBOL">
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

  <EmptyTable v-if="!ercs.length"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, inject, onBeforeUnmount, onMounted, PropType, ref} from 'vue';
import {routeManager} from "@/router";
import {ORUGA_MOBILE_BREAKPOINT} from "@/BreakPoints";
import EmptyTable from "@/components/EmptyTable.vue";
import TablePageSize from "@/components/transaction/TablePageSize.vue";
import {AppStorage} from "@/AppStorage";
import {ERC20ByNameTableLoader} from "@/components/contract/ERC20ByNameTableLoader.ts";
import {ERC20Info} from "@/utils/cache/ERC20InfoCache.ts";
import ContractIOL from "@/components/values/link/ContractIOL.vue";

const props = defineProps({
  narrowed: Boolean,
  nbItems: Number,
  name: {
    type: String as PropType<string | null>,
    default: null
  }
})
const isMediumScreen = inject('isMediumScreen', true)

const perPage = ref(isMediumScreen ? 15 : 10)
const targetName = computed(() => props.name)
const loader = new ERC20ByNameTableLoader(perPage, targetName)
onMounted(() => loader.mount())
onBeforeUnmount(() => loader.unmount())

const handleClick = (t: ERC20Info, c: unknown, i: number, ci: number, event: MouseEvent) => {
  if (t.contractId !== null) {
    routeManager.routeToContract(t.contractId, event)
  }
}

const ercs = loader.rows
const loading = loader.loading
const total = loader.totalRowCount
const currentPage = loader.currentPage
const pageSize = loader.pageSize

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
