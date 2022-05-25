<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2022 Hedera Hashgraph, LLC
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
      :narrowed="true"
      :hoverable="true"
      :paginated="!isTouchDevice && paginationNeeded"
      :per-page="isMediumScreen ? pageSize : 5"
      :striped="true"
      :v-model:current-page="currentPage"
      :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"
      aria-current-label="Current page"
      aria-next-label="Next page"
      aria-page-label="Page"
      aria-previous-label="Previous page"
      customRowKey="account"
      default-sort="account"
      @click="handleClick"
  >
    <o-table-column v-slot="props" field="account" label="Account ID">
      <div class="is-numeric">
        {{ props.row.account }}
      </div>
    </o-table-column>

    <o-table-column v-slot="props" field="balance" label="Balance" position="right">
      <TokenAmount v-bind:amount="props.row.balance" v-bind:token-id="tokenId"/>
    </o-table-column>

  </o-table>

  <EmptyTable v-if="!balances.length"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import {TokenDistribution} from "@/schemas/HederaSchemas";
import {TokenBalanceCache} from "@/components/token/TokenBalanceCache";
import router from "@/router";
import TokenAmount from "@/components/values/TokenAmount.vue";
import { ORUGA_MOBILE_BREAKPOINT } from '@/App.vue';
import EmptyTable from "@/components/EmptyTable.vue";

export default defineComponent({
  name: 'TokenBalanceTable',

  components: {EmptyTable, TokenAmount},

  props: {
    tokenId: {
      type: String,
      required: true
    },
    nbItems: Number,
  },

  setup(props) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)

    const DEFAULT_PAGE_SIZE = 15
    const pageSize = props.nbItems ?? DEFAULT_PAGE_SIZE
    const paginationNeeded = computed(() => {
          return balances.value.length > 5
        }
    )

    // 1) balances
    let balances = ref<Array<TokenDistribution>>([])

    // 2) cache
    const cache = new TokenBalanceCache(props.tokenId, isTouchDevice ? 15 : 100)

    cache.responseDidChangeCB = () => {
      balances.value = cache.getEntity()?.balances ?? []
    }

    onMounted(() => {
      cache.start()
    })

    onBeforeUnmount(() => {
      cache.stop()
    })

    watch(() => props.tokenId, () => {
          cache.setTokenId(props.tokenId)
          cache.start()
        }
    )

    // 3) handleClick
    const handleClick = (t: TokenDistribution) => {
      router.push({name: 'AccountDetails', params: { accountId: t.account }})
    }

    // 4) currentPage
    let currentPage = ref(1)

    return {
      isTouchDevice,
      isMediumScreen,
      pageSize,
      paginationNeeded,
      balances,
      cache,
      currentPage,
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