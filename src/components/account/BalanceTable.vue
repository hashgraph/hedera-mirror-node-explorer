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
      :data="balances"
      :hoverable="true"
      :paginated="!isTouchDevice"
      :per-page="isMediumScreen ? pageSize : 5"
      :striped="true"
      :v-model:current-page="currentPage"
      :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"
      aria-current-label="Current page"
      aria-next-label="Next page"
      aria-page-label="Page"
      aria-previous-label="Previous page"
      default-sort="token_id"
      @click="handleClick"
  >
    <o-table-column v-slot="props" field="token_id" label="Token">
      <TokenLink
          v-bind:show-extra="true"
          v-bind:token-id="props.row.token_id"
          v-bind:no-anchor="true"
      />
    </o-table-column>

    <o-table-column v-slot="props" field="balance" label="Balance" position="right">
      <TokenAmount v-bind:amount="BigInt(props.row.balance)"
                   v-bind:token-id="props.row.token_id"/>
    </o-table-column>

  </o-table>

  <EmptyTable v-if="!balances.length"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, PropType, ref} from 'vue';
import {TokenBalance} from "@/schemas/HederaSchemas";
import TokenLink from "@/components/values/TokenLink.vue";
import TokenAmount from "@/components/values/TokenAmount.vue";
import {ORUGA_MOBILE_BREAKPOINT} from '@/App.vue';
import EmptyTable from "@/components/EmptyTable.vue";
import {routeManager} from "@/router";

export default defineComponent({
  name: 'BalanceTable',

  components: {
    EmptyTable,
    TokenLink,
    TokenAmount
  },

  props: {
    balances: {
      type: Array as PropType<Array<TokenBalance>>,
      default: () => []
    },
    nbItems: Number,
  },

  setup(props) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)
    const DEFAULT_PAGE_SIZE = 15
    const pageSize = props.nbItems ?? DEFAULT_PAGE_SIZE

    // 3) handleClick
    const handleClick = (balance: TokenBalance) => {
      if (balance.token_id) {
        routeManager.routeToToken(balance.token_id)
      }
    }

    // 4) currentPage
    let currentPage = ref(1)

    return {
      isTouchDevice,
      isMediumScreen,
      pageSize,
      handleClick,
      currentPage,
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