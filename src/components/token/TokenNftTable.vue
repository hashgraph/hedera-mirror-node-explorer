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

 <div id="token-nft-table">
  <o-table
      :data="nfts"
      :narrowed="true"
      :hoverable="false"
      :paginated="paginationNeeded"
      :per-page="pageSize"
      :striped="true"
      :v-model:current-page="currentPage"
      :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"
      aria-current-label="Current page"
      aria-next-label="Next page"
      aria-page-label="Page"
      aria-previous-label="Previous page"
      customRowKey="serial_number"
      default-sort="serial_number"
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
 </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import {Nft} from "@/schemas/HederaSchemas";
import {TokenNftCache} from "@/components/token/TokenNftCache";
import TimestampValue from "@/components/values/TimestampValue.vue";
import AccountLink from "@/components/values/AccountLink.vue";
import BlobValue from "@/components/values/BlobValue.vue";
import { ORUGA_MOBILE_BREAKPOINT } from '@/App.vue';

export default defineComponent({
  name: 'TokenNftTable',

  components: {AccountLink, TimestampValue, BlobValue},

  props: {
    tokenId: {
      type: String,
      required: true
    },
    nbItems: Number,
  },

  setup(props) {

    const DEFAULT_PAGE_SIZE = 15

    const pageSize = props.nbItems ?? DEFAULT_PAGE_SIZE
    const paginationNeeded = computed(() => {
          return nfts.value.length > pageSize
        }
    )

    // 1) nfts
    let nfts = ref<Array<Nft>>([])

    // 2) cache
    const cache = new TokenNftCache(props.tokenId)

    cache.responseDidChangeCB = () => {
      nfts.value = cache.getEntity()?.nfts ?? []
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

    // 3) currentPage
    let currentPage = ref(1)

    return {
      pageSize,
      paginationNeeded,
      nfts,
      cache,
      currentPage,
      ORUGA_MOBILE_BREAKPOINT
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>
#token-nft-table table.o-table > tbody > tr {
  cursor:default;
}
</style>