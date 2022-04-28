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
      :data="accounts"
      :hoverable="true"
      :paginated="!isTouchDevice && isMediumScreen"
      :per-page="nbItems ?? 15"
      :striped="true"
      :v-model:current-page="currentPage"
      :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"
      aria-current-label="Current page"
      aria-next-label="Next page"
      aria-page-label="Page"
      aria-previous-label="Previous page"
      customRowKey="account_id"
      default-sort="account_id"
      @click="handleClick"
  >
    <o-table-column v-slot="props" field="account" label="Account">
      <div class="is-numeric">
        {{ props.row.account }}
      </div>
    </o-table-column>

    <o-table-column field="expiry" label="Expiry" v-slot="props">
      <TimestampValue v-bind:timestamp="props.row?.expiration_timestamp" v-bind:show-none="true"/>
    </o-table-column>

    <o-table-column field="nb_tokens" label="Tokens" v-slot="props">
      <div v-if="props.row.balance?.tokens?.length > 1">
        {{ props.row.balance?.tokens?.length }} Types of Token
      </div>
      <div v-else-if="props.row.balance?.tokens?.length === 1">
        <TokenAmount
            v-bind:amount="props.row.balance?.tokens[0].balance"
            v-bind:token-id="props.row.balance?.tokens[0].token_id"/>
      </div>
      <div v-else class="has-text-grey">
        None
      </div>

    </o-table-column>

    <o-table-column v-slot="props" field="memo" label="Memo">
      <div class="w250">
        <BlobValue v-bind:blob-value="props.row.memo_base64" v-bind:base64="true" v-bind:show-none="true"/>
      </div>
    </o-table-column>

    <o-table-column v-slot="props" field="balance" label="Balance" position="right">
      <HbarAmount  v-bind:amount="props.row.balance.balance ?? 0"/>
    </o-table-column>

  </o-table>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, onBeforeUnmount, onMounted, ref} from 'vue';
import {AccountInfo} from "@/schemas/HederaSchemas";
import router from "@/router";
import {AccountCache} from "@/components/account/AccountCache";
import HbarAmount from "@/components/values/HbarAmount.vue";
import BlobValue from "@/components/values/BlobValue.vue";
import TimestampValue from "@/components/values/TimestampValue.vue";
import TokenAmount from "@/components/values/TokenAmount.vue";
import {ORUGA_MOBILE_BREAKPOINT} from '@/App.vue';

export default defineComponent({
  name: 'AccountTable',

  components: {BlobValue, HbarAmount, TimestampValue, TokenAmount},

  props: {
    nbItems: Number,
  },

  setup() {
    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)

    // 1) accounts
    let accounts = ref<Array<AccountInfo>>([])

    // 2) cache
    const cache = new AccountCache()
    cache.responseDidChangeCB = () => {
      accounts.value = cache.getEntity()?.accounts ?? []
    }

    onMounted(() => {
      cache.start()
    })

    onBeforeUnmount(() => {
      cache.stop()
    })

    // 3) handleClick
    const handleClick = (a: AccountInfo) => {
      router.push({name: 'AccountDetails', params: {accountId: a.account}})
    }

    // 4) currentPage
    let currentPage = ref(1)

    return {
      isTouchDevice,
      isMediumScreen,
      accounts,
      cache,
      handleClick,
      currentPage,
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