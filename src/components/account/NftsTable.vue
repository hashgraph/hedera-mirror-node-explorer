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
      :data="collections"
      :paginated="paginated"
      pagination-order="left"
      :range-before="0"
      :range-after="0"
      :per-page="perPage"
      @cell-click="handleClick"

      :hoverable="true"
      :narrowed="true"
      :striped="true"
      :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"

      aria-current-label="Current page"
      aria-next-label="Next page"
      aria-page-label="Page"
      aria-previous-label="Previous page"
  >

    <o-table-column v-slot="props" field="collection" label="Collection">
      <TokenLink
          :show-extra="false"
          :token-id="props.row.tokenId"
          :no-anchor="true"
      />
    </o-table-column>

    <o-table-column v-slot="props" field="name" label="Name">
      <TokenCell :token-id="props.row.tokenId" :property="TokenCellItem.tokenName"/>
    </o-table-column>

    <o-table-column v-slot="props" field="symbol" label="Symbol">
      <TokenCell :token-id="props.row.tokenId" :property="TokenCellItem.tokenSymbol"/>
    </o-table-column>

    <o-table-column v-slot="props" field="serials" label="Serial Numbers" position="left">
      {{ formatSerials(props.row.serials) }}
    </o-table-column>

    <o-table-column v-slot="props" field="owned" label="Total" position="right">
      {{ props.row.serials.length }}
    </o-table-column>

    <template v-slot:bottom-left>
      <TablePageSize
          v-model:size="perPage"
          :storage-key="AppStorage.ACCOUNT_NFT_TABLE_PAGE_SIZE_KEY"
      />
    </template>

  </o-table>

  <TablePageSize
      v-if="!paginated && showPageSizeSelector"
      v-model:size="perPage"
      :storage-key="AppStorage.ACCOUNT_NFT_TABLE_PAGE_SIZE_KEY"
      style="width: 116px; margin-left: 4px"
  />

  <EmptyTable v-if="!collections.length"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, PropType, ref} from 'vue';
import TokenLink from "@/components/values/link/TokenLink.vue";
import {ORUGA_MOBILE_BREAKPOINT} from '@/App.vue';
import EmptyTable from "@/components/EmptyTable.vue";
import {routeManager} from "@/router";
import {useRoute} from "vue-router";
import {NftCollectionInfo} from "@/utils/cache/NftCollectionCache";
import TokenCell, {TokenCellItem} from "@/components/token/TokenCell.vue";
import TablePageSize from "@/components/transaction/TablePageSize.vue";
import {AppStorage} from "@/AppStorage";

export default defineComponent({
  name: 'NftsTable',

  components: {
    TablePageSize,
    TokenCell,
    EmptyTable,
    TokenLink,
  },

  props: {
    collections: {
      type: Object as PropType<NftCollectionInfo[]>,
      required: true
    },
  },

  setup(props) {
    const route = useRoute();

    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)

    const perPage = ref(isMediumScreen ? 15 : 5)

    const handleClick = (nft: NftCollectionInfo, c: unknown, i: number, ci: number, event: MouseEvent) => {
      if (nft.tokenId) {
        routeManager.routeToCollection(route.params.accountId as string, nft.tokenId, event)
      }
    }

    const MAX_DISPLAYED_SERIALS = 20
    const formatSerials = (serials: number[]): string => {
      let result = ''
      for (let i = 0; i < serials.length; i++) {
        if (i < MAX_DISPLAYED_SERIALS) {
          result += (i == 0 ? `#${serials[i]}` : `, #${serials[i]}`)
        } else {
          result += `… (${serials.length - MAX_DISPLAYED_SERIALS} more)`
          break
        }
      }
      return result
    }

    const paginated = computed(() => props.collections.length > perPage.value)
    const showPageSizeSelector = computed(() => props.collections.length > 5)

    return {
      isTouchDevice,
      isMediumScreen,
      perPage,
      paginated,
      showPageSizeSelector,
      handleClick,
      formatSerials,
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