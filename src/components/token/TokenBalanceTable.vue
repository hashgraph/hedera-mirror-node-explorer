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
      :data="tokenBalances"
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
      :narrowed="true"
      :striped="true"
      :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"

      aria-current-label="Current page"
      aria-next-label="Next page"
      aria-page-label="Page"
      aria-previous-label="Previous page"
      customRowKey="account"
  >
    <o-table-column v-slot="props" field="account" label="Account ID">
      <AccountIOL :account-id="props.row.account"/>
    </o-table-column>

    <o-table-column v-slot="props" field="balance" label="Balance" position="right">
      <TokenAmount v-bind:amount="BigInt(props.row.balance)" v-bind:token-id="tokenId"/>
    </o-table-column>

    <template v-slot:bottom-left>
      <TablePageSize
          v-model:size="perPage"
          :storage-key="AppStorage.TOKEN_BALANCE_TABLE_PAGE_SIZE_KEY"
      />
    </template>

  </o-table>

  <TablePageSize
      v-if="!paginated && showPageSizeSelector"
      v-model:size="perPage"
      :storage-key="AppStorage.TOKEN_BALANCE_TABLE_PAGE_SIZE_KEY"
      style="width: 116px; margin-left: 4px"
  />

  <EmptyTable v-if="!tokenBalances.length"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {ComputedRef, defineComponent, inject, PropType, Ref} from 'vue';
import {TokenDistribution} from "@/schemas/MirrorNodeSchemas";
import {routeManager} from "@/router";
import TokenAmount from "@/components/values/TokenAmount.vue";
import {ORUGA_MOBILE_BREAKPOINT} from "@/BreakPoints";
import EmptyTable from "@/components/EmptyTable.vue";
import {TokenBalanceTableController} from "@/components/token/TokenBalanceTableController";
import AccountIOL from "@/components/values/link/AccountIOL.vue";
import TablePageSize from "@/components/transaction/TablePageSize.vue";
import {AppStorage} from "@/AppStorage";

export default defineComponent({
  name: 'TokenBalanceTable',

  components: {TablePageSize, AccountIOL, EmptyTable, TokenAmount},

  props: {
    controller: {
      type: Object as PropType<TokenBalanceTableController>,
      required: true
    },
  },

  setup(props) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)

    const handleClick = (t: TokenDistribution, c: unknown, i: number, ci: number, event: MouseEvent) => {
      if (t.account) {
        routeManager.routeToAccount(t.account, event)
      }
    }

    return {
      isTouchDevice,
      isMediumScreen,
      tokenId: props.controller.tokenId.value,
      tokenBalances: props.controller.rows as ComputedRef<TokenDistribution[]>,
      loading: props.controller.loading as ComputedRef<boolean>,
      total: props.controller.totalRowCount as ComputedRef<number>,
      currentPage: props.controller.currentPage as Ref<number>,
      onPageChange: props.controller.onPageChange,
      perPage: props.controller.pageSize as Ref<number>,
      paginated: props.controller.paginated as ComputedRef<boolean>,
      showPageSizeSelector: props.controller.showPageSizeSelector as ComputedRef<boolean>,
      handleClick,
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
