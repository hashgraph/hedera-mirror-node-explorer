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
      :paginated="!isTouchDevice"
      :per-page="isMediumScreen ? pageSize : 5"
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

  <EmptyTable v-if="!tokens.length"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, PropType, ref} from 'vue';
import router from "@/router";
import {Token} from "@/schemas/HederaSchemas";
import {ORUGA_MOBILE_BREAKPOINT} from '@/App.vue';
import EmptyTable from "@/components/EmptyTable.vue";

export default defineComponent({
  name: 'TokenTable',

  components: {EmptyTable},

  props: {
    nbItems: Number,
    tokens: {
      type: Array as PropType<Array<Token>>,
      default: () => []
    }
  },

  setup(props) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)
    const DEFAULT_PAGE_SIZE = 15
    const pageSize = props.nbItems ?? DEFAULT_PAGE_SIZE

    // 3) handleClick
    const handleClick = (t: Token) => {
      router.push({name: 'TokenDetails', params: {tokenId: t.token_id}})
    }

    // 4) currentPage
    let currentPage = ref(1)

    return {
      isTouchDevice,
      isMediumScreen,
      pageSize,
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