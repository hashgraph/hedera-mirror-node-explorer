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
        :hoverable="true"
        :paginated="props.controller.paginated.value"
        backend-pagination
        pagination-order="left"
        :range-before="0"
        :range-after="0"
        :total="props.controller.totalRowCount.value"
        :per-page="props.controller.pageSize.value"
        @page-change="props.controller.onPageChange"
        :striped="true"
        :v-model:current-page="props.controller.currentPage.value"
        :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"
        aria-current-label="Current page"
        aria-next-label="Next page"
        aria-page-label="Page"
        aria-previous-label="Previous page"
        @cell-click="handleClick"
    >

      <o-table-column v-slot="props" field="image" label="Preview">
        <NftCell :token-id="props.row.token_id" :serial-number="props.row.serial_number" :property="NftCellItem.image"/>
      </o-table-column>

      <o-table-column v-slot="props" field="collection" label="Collection">
        {{ props.row.token_id }}
      </o-table-column>

      <o-table-column v-slot="props" field="serial" label="#">
        {{ props.row.serial_number }}
      </o-table-column>

      <o-table-column v-slot="props" field="name" label="Name">
        <NftCell :token-id="props.row.token_id" :serial-number="props.row.serial_number" :property="NftCellItem.name"/>
      </o-table-column>

      <o-table-column v-slot="props" field="creator" label="Creator">
        <NftCell :token-id="props.row.token_id" :serial-number="props.row.serial_number" :property="NftCellItem.creator"/>
      </o-table-column>

      <o-table-column v-slot="props" field="description" label="Description">
        <NftCell :token-id="props.row.token_id" :serial-number="props.row.serial_number"
                 :property="NftCellItem.description"/>
      </o-table-column>

    </o-table>

    <EmptyTable v-if="!props.controller.totalRowCount"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {PropType} from 'vue';
import {Nft} from "@/schemas/HederaSchemas";
import {ORUGA_MOBILE_BREAKPOINT} from '@/App.vue';
import EmptyTable from "@/components/EmptyTable.vue";
import {routeManager} from "@/router";
import NftCell, {NftCellItem} from "@/components/token/NftCell.vue";
import {NftsTableController} from "@/components/account/NftsTableController";

const props = defineProps({
  controller: {
    type: Object as PropType<NftsTableController>,
    required: true
  },
})

const handleClick = (n: Nft, c: unknown, i: number, ci: number, event: MouseEvent,) => {
  if (n.token_id && n.serial_number) {
    routeManager.routeToSerial(n.token_id, n.serial_number, event);
  }
};

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
