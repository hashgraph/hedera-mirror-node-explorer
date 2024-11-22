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
      v-model:current-page="currentPage"
      :data="nfts"
      :hoverable="false"
      :loading="loading"
      :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"
      :narrowed="true"
      :paginated="paginated"
      pagination-order="left"
      :range-before="0"
      :range-after="0"
      :per-page="perPage"
      :striped="true"

      :total="total"
      aria-current-label="Current page"
      aria-next-label="Next page"
      aria-page-label="Page"

      aria-previous-label="Previous page"
      backend-pagination
      customRowKey="spender"
      default-sort="spender"
      @page-change="onPageChange">

    <o-table-column v-slot="props" field="token" label="Token ID">
      <TokenLink :token-id="props.row.token_id" :show-extra="true"/>
    </o-table-column>

    <o-table-column v-slot="props" field="serial" label="Serial #">
      <div class="is-numeric">
        {{ props.row.serial_number }}
      </div>
    </o-table-column>

    <o-table-column v-slot="props" field="spender" label="Spender">
      <AccountLink :account-id="props.row.spender" :show-extra="true"/>
    </o-table-column>

    <o-table-column v-slot="props" field="timestamp" label="Time">
      <TimestampValue v-bind:timestamp="props.row.modified_timestamp"/>
    </o-table-column>

    <o-table-column v-if="isWalletConnected" v-slot="props" field="action" position="right">
      <span class="h-is-property-text icon is-small">
        <i class="far fa-trash-alt" @click="$emit('deleteAllowance', props.row)"></i>
      </span>
    </o-table-column>

    <template v-slot:bottom-left>
      <TablePageSize
          v-model:size="perPage"
          :storage-key="AppStorage.ALLOWANCE_TABLE_PAGE_SIZE_KEY"
      />
    </template>

  </o-table>

  <TablePageSize
      v-if="!paginated && showPageSizeSelector"
      v-model:size="perPage"
      :storage-key="AppStorage.ALLOWANCE_TABLE_PAGE_SIZE_KEY"
      style="width: 116px; margin-left: 4px"
  />

  <EmptyTable v-if="!nfts.length"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, ComputedRef, defineComponent, inject, PropType, Ref} from 'vue';
import {Nft} from "@/schemas/MirrorNodeSchemas";
import {ORUGA_MOBILE_BREAKPOINT} from "@/BreakPoints";
import TimestampValue from "@/components/values/TimestampValue.vue";
import EmptyTable from "@/components/EmptyTable.vue";
import AccountLink from "@/components/values/link/AccountLink.vue";
import TokenLink from "@/components/values/link/TokenLink.vue";
import {walletManager} from "@/router";
import {NftAllowanceTableController} from "@/components/allowances/NftAllowanceTableController";
import TablePageSize from "@/components/transaction/TablePageSize.vue";
import {AppStorage} from "@/AppStorage";

export default defineComponent({
  name: 'NftAllowanceTable',

  components: {TablePageSize, TokenLink, AccountLink, EmptyTable, TimestampValue},

  emits: ["deleteAllowance"],

  props: {
    controller: {
      type: Object as PropType<NftAllowanceTableController>,
      required: true
    }
  },

  setup: function (props) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)

    const isWalletConnected = computed(
        () => walletManager.isHieroWallet.value
            && walletManager.accountId.value === props.controller.accountId.value
    )

    return {
      isTouchDevice,
      isSmallScreen,
      isMediumScreen,
      isWalletConnected,
      nfts: props.controller.rows as ComputedRef<Nft[]>,
      loading: props.controller.loading as ComputedRef<boolean>,
      total: props.controller.totalRowCount as ComputedRef<number>,
      currentPage: props.controller.currentPage as Ref<number>,
      onPageChange: props.controller.onPageChange,
      perPage: props.controller.pageSize as Ref<number>,
      paginated: props.controller.paginated as ComputedRef<boolean>,
      showPageSizeSelector: props.controller.showPageSizeSelector as ComputedRef<boolean>,
      AppStorage,
      // From App
      ORUGA_MOBILE_BREAKPOINT,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
