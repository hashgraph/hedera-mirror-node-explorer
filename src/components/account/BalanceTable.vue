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
      :data="relationships"
      :loading="loading"
      :paginated="paginated"
      backend-pagination
      pagination-order="left"
      :range-before="0"
      :range-after="0"
      :total="totalRowCount"
      :current-page="currentPage"
      :per-page="perPage"
      @page-change="onPageChange"
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
      <TokenCell
          :token-id="props.row.token_id"
          :property="TokenCellItem.tokenName"
      />
    </o-table-column>

    <o-table-column v-slot="props" field="symbol" label="Symbol">
      <TokenCell
          :token-id="props.row.token_id"
          :property="TokenCellItem.tokenSymbol"
      />
    </o-table-column>

    <o-table-column v-slot="props" field="type" label="Type">
      <TokenCell
          :token-id="props.row.token_id"
          :property="TokenCellItem.tokenType"
      />
    </o-table-column>

    <o-table-column v-slot="props" field="balance" label="Balance" position="right">
      <TokenCell
          :token-id="props.row.token_id"
          :property="TokenCellItem.tokenBalance"
          :balance-or-nb-serials="props.row.balance"
      />
    </o-table-column>

    <o-table-column v-slot="props" field="nb-nfts" label="Nb. of NFTs" position="right">
      <TokenCell
          :token-id="props.row.token_id"
          :property="TokenCellItem.tokenNbSerials"
          :balance-or-nb-serials="props.row.balance"
      />
    </o-table-column>

    <template v-slot:bottom-left>
      <TablePageSize
          v-model:size="perPage"
          :storage-key="AppStorage.ACCOUNT_TOKENS_TABLE_PAGE_SIZE_KEY"
      />
    </template>

  </o-table>

  <TablePageSize
      v-if="!paginated && showPageSizeSelector"
      v-model:size="perPage"
      :storage-key="AppStorage.ACCOUNT_TOKENS_TABLE_PAGE_SIZE_KEY"
      style="width: 116px; margin-left: 4px"
  />

  <EmptyTable v-if="!relationships.length"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {ComputedRef, defineComponent, inject, PropType, Ref} from 'vue';
import {TokenBalance, TokenRelationship} from "@/schemas/HederaSchemas";
import TokenLink from "@/components/values/link/TokenLink.vue";
import {ORUGA_MOBILE_BREAKPOINT} from '@/App.vue';
import EmptyTable from "@/components/EmptyTable.vue";
import {routeManager} from "@/router";
import {TokenRelationshipsTableController} from "@/components/account/TokenRelationshipsTableController";
import TokenCell, {TokenCellItem} from "@/components/token/TokenCell.vue";
import TablePageSize from "@/components/transaction/TablePageSize.vue";
import {AppStorage} from "@/AppStorage";

export default defineComponent({
  name: 'BalanceTable',

  components: {
    TablePageSize,
    TokenCell,
    EmptyTable,
    TokenLink,
  },

  props: {
    controller: {
      type: Object as PropType<TokenRelationshipsTableController>,
      required: true
    },
  },

  setup(props) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)

    const handleClick = (balance: TokenBalance, c: unknown, i: number, ci: number, event: MouseEvent) => {
      if (balance.token_id) {
        routeManager.routeToToken(balance.token_id, event)
      }
    }

    return {
      isTouchDevice,
      isMediumScreen,
      relationships: props.controller.rows as ComputedRef<TokenRelationship[]>,
      loading: props.controller.loading as ComputedRef<boolean>,
      totalRowCount: props.controller.totalRowCount as ComputedRef<number>,
      currentPage: props.controller.currentPage as Ref<number>,
      onPageChange: props.controller.onPageChange,
      perPage: props.controller.pageSize as Ref<number>,
      paginated: props.controller.paginated as ComputedRef<boolean>,
      showPageSizeSelector: props.controller.showPageSizeSelector as ComputedRef<boolean>,
      handleClick,
      TokenCellItem,
      AppStorage,
      ORUGA_MOBILE_BREAKPOINT
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>