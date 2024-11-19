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

  <div id="nft-holder-table">
    <o-table
        :data="nfts"
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
        customRowKey="serial_number"
    >
      <o-table-column v-slot="props" field="image" label="Preview">
        <NftCell
            class="w400"
            :token-id="props.row.token_id"
            :serial-number="props.row.serial_number"
            :property="NftCellItem.image"/>
      </o-table-column>

      <o-table-column v-slot="props" field="serial" label="#">
        {{ props.row.serial_number }}
      </o-table-column>

      <o-table-column v-slot="props" field="name" label="Name">
        <NftCell
            :token-id="props.row.token_id"
            :serial-number="props.row.serial_number"
            :property="NftCellItem.name"/>
      </o-table-column>

      <o-table-column v-slot="props" field="creator" label="Creator">
        <NftCell
            :token-id="props.row.token_id"
            :serial-number="props.row.serial_number"
            :property="NftCellItem.creator"/>
      </o-table-column>

      <o-table-column v-slot="props" field="account_id" label="Owner">
        <AccountIOL :account-id="props.row.account_id"/>
      </o-table-column>

      <o-table-column v-slot="props" field="description" label="Description">
        <NftCell
            :token-id="props.row.token_id"
            :serial-number="props.row.serial_number"
            :property="NftCellItem.description"/>
      </o-table-column>

      <template v-slot:bottom-left>
        <TablePageSize
            v-model:size="perPage"
            :storage-key="AppStorage.NFT_HOLDER_TABLE_PAGE_SIZE_KEY"
        />
      </template>

    </o-table>

    <TablePageSize
        v-if="!paginated && showPageSizeSelector"
        v-model:size="perPage"
        :storage-key="AppStorage.NFT_HOLDER_TABLE_PAGE_SIZE_KEY"
        style="width: 116px; margin-left: 4px"
    />

    <EmptyTable v-if="!nfts.length"/>
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {ComputedRef, defineComponent, inject, PropType, Ref} from 'vue';
import {Nft} from "@/schemas/MirrorNodeSchemas";
import {ORUGA_MOBILE_BREAKPOINT} from "@/BreakPoints";
import EmptyTable from "@/components/EmptyTable.vue";
import {NftHolderTableController} from "@/components/token/NftHolderTableController";
import {routeManager} from "@/router";
import AccountIOL from "@/components/values/link/AccountIOL.vue";
import NftCell, {NftCellItem} from "@/components/token/NftCell.vue";
import TablePageSize from "@/components/transaction/TablePageSize.vue";
import {AppStorage} from "@/AppStorage";

export default defineComponent({
  name: 'NftHolderTable',

  components: {TablePageSize, NftCell, AccountIOL, EmptyTable},

  props: {
    controller: {
      type: Object as PropType<NftHolderTableController>,
      required: true
    },
  },

  setup(props) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)

    const handleClick = (
        n: Nft,
        c: unknown,
        i: number,
        ci: number,
        event: MouseEvent,
    ) => {
      if (n.token_id && n.serial_number) {
        routeManager.routeToSerial(n.token_id, n.serial_number, event);
      }
    };

    return {
      isTouchDevice,
      isMediumScreen,
      nfts: props.controller.rows as ComputedRef<Nft[]>,
      loading: props.controller.loading as ComputedRef<boolean>,
      total: props.controller.totalRowCount as ComputedRef<number>,
      currentPage: props.controller.currentPage as Ref<number>,
      onPageChange: props.controller.onPageChange,
      perPage: props.controller.pageSize as Ref<number>,
      paginated: props.controller.paginated as ComputedRef<boolean>,
      showPageSizeSelector: props.controller.showPageSizeSelector as ComputedRef<boolean>,
      ORUGA_MOBILE_BREAKPOINT,
      NftCellItem,
      handleClick,
      AppStorage,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
