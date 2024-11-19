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
      :data="collection"
      :loading="loading"
      :hoverable="true"
      :paginated="!isTouchDevice"
      backend-pagination
      pagination-order="left"
      :range-before="0"
      :range-after="0"
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

    <o-table-column v-slot="props" field="image" label="Preview">
      <NftCell :token-id="tokenId" :serial-number="props.row.serial_number" :property="NftCellItem.image"/>
    </o-table-column>

    <o-table-column v-slot="props" field="serial" label="#">
      {{ props.row.serial_number }}
    </o-table-column>

    <o-table-column v-slot="props" field="name" label="Name">
      <NftCell :token-id="tokenId" :serial-number="props.row.serial_number" :property="NftCellItem.name"/>
    </o-table-column>

    <o-table-column v-slot="props" field="creator" label="Creator">
      <NftCell :token-id="tokenId" :serial-number="props.row.serial_number" :property="NftCellItem.creator"/>
    </o-table-column>

    <o-table-column v-slot="props" field="description" label="Description">
      <NftCell :token-id="tokenId" :serial-number="props.row.serial_number" :property="NftCellItem.description"/>
    </o-table-column>

  </o-table>

  <EmptyTable v-if="!collection.length"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {ComputedRef, defineComponent, inject, PropType, Ref} from 'vue';
import {Nft} from "@/schemas/MirrorNodeSchemas";
import {ORUGA_MOBILE_BREAKPOINT} from "@/BreakPoints";
import EmptyTable from "@/components/EmptyTable.vue";
import {routeManager} from "@/router";
import {CollectionTableController} from "@/components/account/CollectionTableController";
import NftCell, {NftCellItem} from "@/components/token/NftCell.vue";

export default defineComponent({
  name: 'CollectionTable',

  components: {
    NftCell,
    EmptyTable,
  },

  props: {
    controller: {
      type: Object as PropType<CollectionTableController>,
      required: true
    },
    tokenId: {
      type: String,
      required: true
    }
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
      collection: props.controller.rows as ComputedRef<Nft[]>,
      loading: props.controller.loading as ComputedRef<boolean>,
      totalRowCount: props.controller.totalRowCount as ComputedRef<number>,
      currentPage: props.controller.currentPage as Ref<number>,
      onPageChange: props.controller.onPageChange,
      pageSize: props.controller.pageSize as Ref<Number>,
      handleClick,
      NftCellItem,
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
