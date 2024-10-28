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
      :data="allowances"
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

    <o-table-column v-slot="props" field="spender" label="Spender">
      <AccountLink :account-id="props.row.spender" :show-extra="true"/>
    </o-table-column>

    <o-table-column v-slot="props" field="token" label="Token ID">
      <TokenLink :token-id="props.row.token_id" :show-extra="true"/>
    </o-table-column>

    <o-table-column v-slot="props" field="timestamp" label="Time">
      <TimestampValue v-bind:timestamp="props.row.timestamp.from"/>
    </o-table-column>

    <o-table-column v-if="isWalletConnected" v-slot="props" field="action" position="right">
      <span v-if="props.row.isEditable" class="h-is-property-text icon is-small">
        <i class="far fa-trash-alt" @click="$emit('deleteAllowance', props.row)"></i>
      </span>
      <InfoTooltip v-else
                   label="The allowance cannot be modified because the NFT collection is no longer associated with this account."/>
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

  <EmptyTable v-if="!allowances.length"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, ComputedRef, defineComponent, inject, PropType, ref, Ref, watch} from 'vue';
import {NftAllowance} from "@/schemas/HederaSchemas";
import {ORUGA_MOBILE_BREAKPOINT} from "@/BreakPoints";
import TimestampValue from "@/components/values/TimestampValue.vue";
import EmptyTable from "@/components/EmptyTable.vue";
import AccountLink from "@/components/values/link/AccountLink.vue";
import TokenLink from "@/components/values/link/TokenLink.vue";
import {walletManager} from "@/router";
import InfoTooltip from "@/components/InfoTooltip.vue";
import {NftAllSerialsAllowanceTableController} from "@/components/allowances/NftAllSerialsAllowanceTableController";
import {isValidAssociation} from "@/schemas/HederaUtils";
import TablePageSize from "@/components/transaction/TablePageSize.vue";
import {AppStorage} from "@/AppStorage";

interface DisplayedNftAllowance extends NftAllowance {
  isEditable: boolean
}

export default defineComponent({
  name: 'NftAllSerialsAllowanceTable',

  components: {TablePageSize, InfoTooltip, TokenLink, AccountLink, EmptyTable, TimestampValue},

  emits: ["deleteAllowance"],

  props: {
    controller: {
      type: Object as PropType<NftAllSerialsAllowanceTableController>,
      required: true
    }
  },

  setup: function (props) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)

    const isWalletConnected = computed(
        () => walletManager.isHederaWallet.value
            && walletManager.connected.value
            && walletManager.accountId.value === props.controller.accountId.value
    )

    const allowances = ref<DisplayedNftAllowance[]>([])
    watch(props.controller.rows, async () => {
      const result = []
      for (const a of props.controller.rows.value) {
        let allowance: DisplayedNftAllowance = a as DisplayedNftAllowance
        // isValidAssociation(a.owner, a.token_id).then((r) => allowance.isEditable = r)
        allowance.isEditable = await isValidAssociation(a.owner, a.token_id)
        result.push(allowance)
      }
      allowances.value = result
    })

    return {
      isTouchDevice,
      isSmallScreen,
      isMediumScreen,
      isWalletConnected,
      allowances,
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
