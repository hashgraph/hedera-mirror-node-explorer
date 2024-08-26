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
      :data="controller.rows.value"
      :loading="controller.loading.value"
      :paginated="controller.paginated.value"
      backend-pagination
      pagination-order="left"
      :range-before="0"
      :range-after="0"
      :total="controller.totalRowCount.value"
      :current-page="controller.currentPage.value"
      :per-page="controller.pageSize.value"
      @page-change="controller.onPageChange"
      @cellClick="handleClick"

      :hoverable="true"
      :narrowed="true"
      :striped="true"
      :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"

      aria-current-label="Current page"
      aria-next-label="Next page"
      aria-page-label="Page"
      aria-previous-label="Previous page"
      customRowKey="token_id"
  >
    <o-table-column v-slot="props" field="token_id" label="Token">
      <TokenLink
          :show-extra="false"
          :token-id="props.row.token_id"
          :no-anchor="true"
      />
    </o-table-column>

    <o-table-column v-slot="props" field="name" label="Name">
      {{ props.row.name }}
    </o-table-column>

    <o-table-column v-slot="props" field="symbol" label="Symbol">
      {{ props.row.symbol }}
    </o-table-column>

    <o-table-column v-slot="props" field="balance" label="Balance" position="right">
      <TokenCell
          :account-id="controller.accountId.value"
          :token-id="props.row.token_id"
          :property="TokenCellItem.tokenBalance"
      />
    </o-table-column>

    <template v-slot:bottom-left>
      <TablePageSize
          v-model:size="controller.pageSize.value"
          :storage-key="AppStorage.ACCOUNT_TOKENS_TABLE_PAGE_SIZE_KEY"
      />
    </template>

  </o-table>

  <TablePageSize
      v-if="!controller.paginated.value && controller.showPageSizeSelector.value"
      v-model:size="controller.pageSize.value"
      :storage-key="AppStorage.ACCOUNT_TOKENS_TABLE_PAGE_SIZE_KEY"
      style="width: 102px; margin-left: 4px"
  />

  <EmptyTable v-if="!controller.totalRowCount.value"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {PropType} from 'vue';
import {TokenBalance} from "@/schemas/HederaSchemas";
import TokenLink from "@/components/values/link/TokenLink.vue";
import {ORUGA_MOBILE_BREAKPOINT} from '@/App.vue';
import EmptyTable from "@/components/EmptyTable.vue";
import {routeManager} from "@/router";
import TokenCell, {TokenCellItem} from "@/components/token/TokenCell.vue";
import TablePageSize from "@/components/transaction/TablePageSize.vue";
import {AppStorage} from "@/AppStorage";
import {FungibleTableController} from "@/components/account/FungibleTableController";

defineProps({
  controller: {
    type: Object as PropType<FungibleTableController>,
    required: true
  },
})

const handleClick = (balance: TokenBalance, c: unknown, i: number, ci: number, event: MouseEvent) => {
  if (balance.token_id) {
    routeManager.routeToToken(balance.token_id, event)
  }
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>