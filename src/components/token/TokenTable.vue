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
      :data="tokens"
      :hoverable="true"
      :paginated="true"
      :per-page="nbItems ?? 15"
      :striped="true"
      :v-model:current-page="currentPage"
      :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"
      aria-current-label="Current page"
      aria-next-label="Next page"
      aria-page-label="Page"
      aria-previous-label="Previous page"
      customRowKey="token_id"
      default-sort="token_id"
      @click="handleClick"
  >
    <o-table-column v-slot="props" field="token" label="Token">
      <div class="is-numeric">
        {{ props.row.token_id }}
      </div>
    </o-table-column>

    <o-table-column v-slot="props" field="symbol" label="Symbol">
      <div class="w400">{{ props.row.symbol }}</div>
    </o-table-column>

  </o-table>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, onBeforeUnmount, onMounted, ref} from 'vue';
import router from "@/router";
import {Token} from "@/schemas/HederaSchemas";
import {TokenCache} from "@/components/token/TokenCache";
import { ORUGA_MOBILE_BREAKPOINT } from '@/App.vue';

export default defineComponent({
  name: 'TokenTable',

  components: {},

  props: {
    nbItems: Number,
    tokenType: String
  },

  setup(props) {

    // 1) tokens
    let tokens = ref<Array<Token>>([])

    // 2) cache
    const cache = new TokenCache()
    cache.responseDidChangeCB = () => {
      tokens.value = cache.getEntity()?.tokens ?? []
    }
    if (props.tokenType) {
      cache.setTokenType(props.tokenType)
    }

    onMounted(() => {
      cache.start()
    })

    onBeforeUnmount(() => {
      cache.stop()
    })

    // 3) handleClick
    const handleClick = (t: Token) => {
      router.push({name: 'TokenDetails', params: {tokenId: t.token_id}})
    }

    // 4) currentPage
    let currentPage = ref(1)

    return {
      tokens,
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