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
      :data="props.tokens"
      :paginated="props.fullPage"
      pagination-order="left"
      :per-page="perPage"
      :range-before="0"
      :range-after="0"
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
    <o-table-column v-slot="{ row }" field="token_id" label="Token ID">
      {{ row.erc20.contractId }}
    </o-table-column>

    <o-table-column v-slot="{ row }" field="name" label="Name">
      {{ row.erc20.name }}
    </o-table-column>

    <o-table-column v-slot="{ row }" field="symbol" label="Symbol">
      {{ row.erc20.symbol }}
    </o-table-column>

<!--    <o-table-column v-slot="{ row }" field="raw-balance" label="Raw Balance">-->
<!--      {{ row.balance }}-->
<!--    </o-table-column>-->

    <o-table-column v-slot="{ row }" field="balance" label="Balance">
      {{ formatErcBalance(row.balance, row.erc20.decimals) }}
    </o-table-column>

    <o-table-column v-slot="{ row }" field="refresh" position="right">
      <span class="h-is-property-text icon is-small">
        <i class="fas fa-sync" @click.stop="refreshBalance(row)"></i>
      </span>
    </o-table-column>

  </o-table>

  <EmptyTable v-if="!props.tokens.length"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {PropType, ref} from 'vue';
import {ORUGA_MOBILE_BREAKPOINT} from "@/BreakPoints";
import EmptyTable from "@/components/EmptyTable.vue";
import {AccountERC20} from "@/utils/cache/AccountERC20Cache";
import {routeManager} from "@/router";
import {formatUnits} from "ethers";

const props = defineProps({
  tokens: {
    type: Object as PropType<AccountERC20[]>,
    required: true
  },
  fullPage: {
    type: Boolean,
    default: false
  },
})

const perPage = ref(props.fullPage ? 15 : 6)

const handleClick = (row: AccountERC20, c: unknown, i: number, ci: number, event: MouseEvent) => {
  if (row.erc20Info.contractId) {
    routeManager.routeToContract(row.erc20Info.contractId, event)
  }
}

const formatErcBalance = (rawAmount: string, decimalCount: number) => formatUnits(rawAmount, decimalCount)

const emit = defineEmits(["refresh"])

const refreshBalance = (row: AccountERC20) => {
  emit("refresh", row)
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
