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
      :data="contracts"
      :paginated="!isTouchDevice && isMediumScreen"
      :per-page="nbItems ?? 15"
      :striped="true"
      :hoverable="true"
      :v-model:current-page="currentPage"
      :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"
      default-sort="contract_id"
      aria-next-label="Next page"
      aria-previous-label="Previous page"
      aria-page-label="Page"
      aria-current-label="Current page"
      @click="handleClick"
  >
    <o-table-column field="contract_id" label="Contract" v-slot="props">
      <div class="is-numeric">
        {{ props.row.contract_id }}
      </div>
    </o-table-column>

    <o-table-column v-slot="props" field="created" label="Created">
      <TimestampValue v-bind:timestamp="props.row.created_timestamp"/>
    </o-table-column>

    <o-table-column field="memo" label="Memo" v-slot="props">
      <div class="should-wrap">
        <BlobValue v-bind:blob-value="props.row.memo" v-bind:base64="true" v-bind:show-none="true"/>
      </div>
    </o-table-column>

  </o-table>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, onBeforeUnmount, onMounted, ref} from 'vue';
import {ContractCache} from "@/components/contract/ContractCache";
import {Contract} from "@/schemas/HederaSchemas";
import router from "@/router";
import BlobValue from "@/components/values/BlobValue.vue";
import TimestampValue from "@/components/values/TimestampValue.vue";
import { ORUGA_MOBILE_BREAKPOINT } from '@/App.vue';


//
// defineComponent
//

export default defineComponent({
  name: 'ContractTable',

  components: {BlobValue, TimestampValue},

  props: {
    nbItems: Number,
  },

  setup() {
    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)

    // 1) contracts
    let contracts = ref<Array<Contract>>([])

    // 2) cache
    const cache = new ContractCache()
    cache.responseDidChangeCB = () => {
      contracts.value = cache.getEntity()?.contracts ?? []
    }
    onMounted(() => {
      cache.start()
    })
    onBeforeUnmount(() => {
      cache.stop()
    })

    // 3) handleClick
    const handleClick = (c: Contract) => {
      router.push({name: 'ContractDetails', params: { contractId: c.contract_id}})
    }

    // 4) currentPage
    let currentPage = ref(1)

    return {
      isTouchDevice,
      isMediumScreen,
      contracts,
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

<style/>
