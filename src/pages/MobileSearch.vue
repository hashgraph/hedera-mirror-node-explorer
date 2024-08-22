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

  <section class="section has-text-left" style="min-height: 450px">

    <div class="is-flex is-align-items-center mb-6">
      <img alt="Search bar" src="@/assets/large-search-icon.png" style="width: 42px;">
      <span class="ml-4">Search by ID / Address / Domain Name / Public Key / Hash / Alias / Timestamp</span>
    </div>

    <SearchBarV2/>

  </section>

  <Footer :keep-background="true"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import {useRoute} from "vue-router";
import router from "@/router";
import {MEDIUM_BREAKPOINT} from "@/App.vue";
import SearchBarV2 from "@/components/search/SearchBarV2.vue";
import Footer from "@/components/Footer.vue";

export default defineComponent({
  name: 'MobileSearch',
  components: {Footer, SearchBarV2},
  props: {
    "searchedId": String,
    "network": String
  },
  setup() {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)
    const route = useRoute()
    const network = computed(() => {
      return route.params.network
    })
    const name = computed(() => {
      return route.query.from
    })

    const selectedNetwork = ref(network.value)
    watch(selectedNetwork, (selection) => {
      router.replace({
        params: {network: selection}
      })
    })

    const isDashboardRoute = computed(() => {
      return name.value === 'MainDashboard'
    })
    const isTransactionRoute = computed(() => {
      return name.value === 'Transactions' || name.value === 'TransactionsById' || name.value === 'TransactionDetails'
    })
    const isTokenRoute = computed(() => {
      return name.value === 'Tokens' || name.value === 'TokenDetails'
    })
    const isTopicRoute = computed(() => {
      return name.value === 'Topics' || name.value === 'TopicDetails'
    })
    const isContractRoute = computed(() => {
      return name.value === 'Contracts' || name.value === 'ContractDetails'
    })
    const isAccountRoute = computed(() => {
      return name.value === 'Accounts' || name.value === 'AccountDetails'
    })

    const onResizeHandler = () => {
      if (window.innerWidth >= MEDIUM_BREAKPOINT) {
        router.back()
      }
    }
    onMounted(() => {
      window.addEventListener('resize', onResizeHandler);
    })
    onBeforeUnmount(() => {
      window.removeEventListener('resize', onResizeHandler);
    })

    return {
      isSmallScreen,
      isTouchDevice,
      selectedNetwork,
      isDashboardRoute,
      isTransactionRoute,
      isTokenRoute,
      isTopicRoute,
      isContractRoute,
      isAccountRoute
    }
  }
})

</script>


<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
