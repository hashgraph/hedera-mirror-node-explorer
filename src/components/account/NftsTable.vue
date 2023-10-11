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
    :data="nfts"
    :loading="loading"
    :hoverable="true"
    :paginated="!isTouchDevice"
    backend-pagination
    :total="totalRowCount"
    :current-page="currentPage"
    :per-page="pageSize"
    @page-change="onPageChange"
    :striped="true"
    :v-model:current-page="currentPage"
    :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"
    aria-current-label="Current page"
    aria-next-label="Next page"
    aria-page-label="Page"
    aria-previous-label="Previous page"
    @cell-click="handleClick"
  >
    <o-table-column v-slot="props" field="token_id" label="Token">
      <TokenLink
        v-bind:show-extra="true"
        v-bind:token-id="props.row.token_id"
        v-bind:no-anchor="true"
      />
    </o-table-column>

    <o-table-column v-slot="props" field="serial" label="Serial Number" position="right">
      {{props.row.serial_number}}
    </o-table-column>

  </o-table>

  <EmptyTable v-if="!nfts.length"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, PropType, ref, ComputedRef, Ref} from 'vue';
import { Nft, TokenBalance, TokenRelationship } from "@/schemas/HederaSchemas";
import TokenLink from "@/components/values/TokenLink.vue";
import TokenAmount from "@/components/values/TokenAmount.vue";
import {ORUGA_MOBILE_BREAKPOINT} from '@/App.vue';
import EmptyTable from "@/components/EmptyTable.vue";
import {routeManager} from "@/router";
import { NftsTableController } from "@/components/account/NftsTableController";

export default defineComponent({
  name: 'NftsTable',

  components: {
    EmptyTable,
    TokenLink,
  },

  props: {
    controller: {
      type: Object as PropType<NftsTableController>,
      required: true
    },
  },

  setup(props) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)

    const handleClick = (nft: Nft, c: unknown, i: number, ci: number, event: MouseEvent) => {
      if (nft.token_id && nft.serial_number) {
        routeManager.routeToSerial(nft.token_id, nft.serial_number, event.ctrlKey || event.metaKey)
      }
    }

    return {
      isTouchDevice,
      isMediumScreen,
      nfts: props.controller.rows as ComputedRef<Nft[]>,
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