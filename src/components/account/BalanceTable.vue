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
      :paginated="!isTouchDevice"
      backend-pagination
      :total="totalRowCount"
      :current-page="currentPage"
      :per-page="pageSize"
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
          v-bind:show-extra="true"
          v-bind:token-id="props.row.token_id"
          v-bind:no-anchor="true"
      />
    </o-table-column>

    <o-table-column v-slot="props" field="balance" label="Balance/Nb of NFTs" position="right">
      <TokenAmount v-bind:amount="BigInt(props.row.balance)"
                   v-bind:token-id="props.row.token_id"/>
    </o-table-column>

  </o-table>

  <EmptyTable v-if="!relationships.length"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {ComputedRef, defineComponent, inject, PropType, Ref} from 'vue';
import {TokenBalance, TokenRelationship} from "@/schemas/HederaSchemas";
import TokenLink from "@/components/values/TokenLink.vue";
import TokenAmount from "@/components/values/TokenAmount.vue";
import {ORUGA_MOBILE_BREAKPOINT} from '@/App.vue';
import EmptyTable from "@/components/EmptyTable.vue";
import {routeManager} from "@/router";
import {TokenRelationshipsTableController} from "@/components/account/TokenRelationshipsTableController";

export default defineComponent({
  name: 'BalanceTable',

  components: {
    EmptyTable,
    TokenLink,
    TokenAmount
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
        routeManager.routeToToken(balance.token_id, event.ctrlKey || event.metaKey)
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
      pageSize: props.controller.pageSize as Ref<Number>,
      handleClick,
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