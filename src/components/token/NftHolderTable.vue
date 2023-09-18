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

 <div id="nft-holder-table">
  <o-table
      :data="nfts"
      :loading="loading"
      paginated
      backend-pagination
      :total="total"
      v-model:current-page="currentPage"
      :per-page="perPage"
      @page-change="onPageChange"
      @cell-click="handleClick"

      :hoverable="true"
      :narrowed="true"
      :striped="true"
      :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"

      style="cursor: pointer"

      aria-current-label="Current page"
      aria-next-label="Next page"
      aria-page-label="Page"
      aria-previous-label="Previous page"
      customRowKey="serial_number"
  >
    <o-table-column v-slot="props" field="serial_number" label="Serial #">
      <div class="is-numeric">
        {{ props.row.serial_number }}
      </div>
    </o-table-column>

    <o-table-column v-slot="props" field="account_id" label="Account ID">
      <AccountLink v-bind:account-id="props.row.account_id"/>
    </o-table-column>

    <o-table-column v-slot="props" field="deleted" label="Deleted">
      {{ props.row.deleted }}
    </o-table-column>

    <o-table-column v-slot="props" field="modified_timestamp" label="Modification Time">
      <TimestampValue v-bind:timestamp="props.row.modified_timestamp"/>
    </o-table-column>

    <o-table-column v-slot="props" field="metadata" label="Metadata">
      <div class="should-wrap">
        <BlobValue v-bind:base64="true" v-bind:blob-value="props.row.metadata" v-bind:show-none="true"/>
      </div>
    </o-table-column>

  </o-table>
  <EmptyTable v-if="!nfts.length"/>
 </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {ComputedRef, defineComponent, inject, PropType, Ref} from 'vue';
import {Nft} from "@/schemas/HederaSchemas";
import TimestampValue from "@/components/values/TimestampValue.vue";
import AccountLink from "@/components/values/AccountLink.vue";
import BlobValue from "@/components/values/BlobValue.vue";
import {ORUGA_MOBILE_BREAKPOINT} from '@/App.vue';
import EmptyTable from "@/components/EmptyTable.vue";
import {NftHolderTableController} from "@/components/token/NftHolderTableController";
import {routeManager} from "@/router";

export default defineComponent({
  name: 'NftHolderTable',

  components: {EmptyTable, AccountLink, TimestampValue, BlobValue},

  props: {
    controller: {
      type: Object as PropType<NftHolderTableController>,
      required: true
    },
  },

  setup(props) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)

    const handleClick = (n: Nft, c: unknown, i: number, ci: number, event: MouseEvent) => {
      if (n.token_id && n.serial_number) {
        routeManager.routeToSerial(n.token_id, n.serial_number, event.ctrlKey || event.metaKey)
      }
    }

    return {
      isTouchDevice,
      isMediumScreen,
      nfts: props.controller.rows as ComputedRef<Nft[]>,
      loading: props.controller.loading as ComputedRef<boolean>,
      total: props.controller.totalRowCount as ComputedRef<number>,
      currentPage: props.controller.currentPage as Ref<number>,
      onPageChange: props.controller.onPageChange,
      perPage: props.controller.pageSize as Ref<number>,
      ORUGA_MOBILE_BREAKPOINT,
      handleClick
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->
