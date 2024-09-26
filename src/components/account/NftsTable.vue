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
      :data="props.controller.rows.value"
      :loading="props.controller.loading.value"
      :paginated="props.controller.paginated.value"
      backend-pagination
      pagination-order="left"
      :range-before="0"
      :range-after="0"
      :total="props.controller.totalRowCount.value"
      v-model:current-page="props.controller.currentPage.value"
      :per-page="props.controller.pageSize.value"
      @page-change="props.controller.onPageChange"
      @cell-click="handleClick"
      :checkable="props.checkEnabled"
      v-model:checked-rows="checkedRows"

      :hoverable="true"
      :narrowed="true"
      :striped="true"
      :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"

      aria-current-label="Current page"
      aria-next-label="Next page"
      aria-page-label="Page"
      aria-previous-label="Previous page"
  >

    <o-table-column v-slot="{ row }" field="image" label="Image">
      <NftCell
          :token-id="row.token_id"
          :serial-number="row.serial_number"
          :property="NftCellItem.image"
      />
    </o-table-column>

    <o-table-column v-slot="{ row }" field="token-id" label="Token ID">
      {{ row.token_id }}
    </o-table-column>

    <o-table-column v-slot="{ row }" field="serial" label="#">
      {{ row.serial_number }}
    </o-table-column>

    <o-table-column v-slot="{ row }" field="token-name" label="Collection">
      <TokenCell class="is-inline-block" :token-id="row.token_id" :property="TokenCellItem.tokenName"/>
      (
      <TokenCell class="is-inline-block" :token-id="row.token_id" :property="TokenCellItem.tokenSymbol"/>
      )
    </o-table-column>

    <o-table-column v-slot="{ row }" field="name" label="Name">
      <NftCell :token-id="row.token_id" :serial-number="row.serial_number" :property="NftCellItem.name"/>
    </o-table-column>

    <o-table-column v-slot="{ row }" field="creator" label="Creator">
      <NftCell :token-id="row.token_id" :serial-number="row.serial_number" :property="NftCellItem.creator"/>
    </o-table-column>

    <o-table-column v-slot="{ row }" field="description" label="Description">
      <NftCell :token-id="row.token_id" :serial-number="row.serial_number"
               :property="NftCellItem.description"/>
    </o-table-column>

    <template v-slot:bottom-left>
      <TablePageSize
          v-model:size="props.controller.pageSize.value"
          :storage-key="AppStorage.ACCOUNT_TOKENS_TABLE_PAGE_SIZE_KEY"
      />
    </template>

  </o-table>

  <TablePageSize
      v-if="!props.controller.paginated.value
      && props.controller.showPageSizeSelector.value
      && !props.checkEnabled"
      v-model:size="props.controller.pageSize.value"
      :storage-key="AppStorage.ACCOUNT_TOKENS_TABLE_PAGE_SIZE_KEY"
      style="width: 102px; margin-left: 4px"
  />

  <EmptyTable v-if="!props.controller.totalRowCount.value"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {PropType, watch} from 'vue';
import {Nft, Token} from "@/schemas/HederaSchemas";
import {ORUGA_MOBILE_BREAKPOINT} from '@/App.vue';
import EmptyTable from "@/components/EmptyTable.vue";
import {routeManager} from "@/router";
import NftCell, {NftCellItem} from "@/components/token/NftCell.vue";
import {NftsTableController} from "@/components/account/NftsTableController";
import TokenCell, {TokenCellItem} from "@/components/token/TokenCell.vue";
import {AppStorage} from "@/AppStorage";
import TablePageSize from "@/components/transaction/TablePageSize.vue";

const props = defineProps({
  controller: {
    type: Object as PropType<NftsTableController>,
    required: true
  },
  checkEnabled: {
    type: Boolean,
    required: true
  }
})

const checkedRows = defineModel("checkedNfts", {
  type: Object as PropType<(Token | Nft)[]>,
  default: [] as (Token | Nft)[]
})

watch([props.controller.rows, () => props.checkEnabled], () => checkedRows.value.splice(0))

const handleClick = (nft: Nft, c: unknown, i: number, ci: number, event: MouseEvent,) => {
  if (nft.token_id && nft.serial_number) {
    routeManager.routeToSerial(nft.token_id, nft.serial_number, event);
  }
};

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
