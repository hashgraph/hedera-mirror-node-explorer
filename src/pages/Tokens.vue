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

  <hr class="h-top-banner" style="margin: 0; height: 4px"/>

  <section class="section" :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}">

    <div class="columns is-multiline">

      <div class="column has-text-left" :class="{'is-full': !displaySideBySide}">

        <DashboardCard>
          <template v-slot:title>
            <span class="h-is-primary-title">Recent Non Fungible Tokens</span>
          </template>
          <template v-slot:table>
            <TokenTable v-bind:tokens="nftTokens"/>
          </template>
        </DashboardCard>

      </div>

      <div class="column has-text-left">

        <DashboardCard>
          <template v-slot:title>
            <span class="h-is-primary-title">Recent Fungible Tokens</span>
          </template>
          <template v-slot:table>
            <TokenTable v-bind:tokens="funTokens"/>
          </template>
        </DashboardCard>

      </div>

    </div>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, onBeforeUnmount, onMounted} from 'vue';
import TokenTable from "@/components/token/TokenTable.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import Footer from "@/components/Footer.vue";
import {TokenCache} from "@/components/token/TokenCache";
import {EntityCacheStateV2} from "@/utils/EntityCacheV2";

export default defineComponent({
  name: 'Tokens',

  props: {
    accountId: String,
    network: String
  },

  components: {
    Footer,
    DashboardCard,
    TokenTable
  },

  setup() {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)
    const displaySideBySide = inject('isLargeScreen', true)

    const FUNGIBLE = "FUNGIBLE_COMMON"
    const NONFUNGIBLE = "NON_FUNGIBLE_UNIQUE"

    //
    // nfTokenCache
    //
    const nfTokenCache = new TokenCache(isTouchDevice ? 15 : 100)
    onMounted(() => {
      nfTokenCache.tokenType.value = NONFUNGIBLE
      nfTokenCache.state.value = EntityCacheStateV2.Started
    })
    onBeforeUnmount(() => {
      nfTokenCache.state.value = EntityCacheStateV2.Stopped
    })

    //
    // funTokenCache
    //
    const funTokenCache = new TokenCache(isTouchDevice ? 15 : 100)
    onMounted(() => {
      funTokenCache.tokenType.value = FUNGIBLE
      funTokenCache.state.value = EntityCacheStateV2.Started
    })
    onBeforeUnmount(() => {
      funTokenCache.state.value = EntityCacheStateV2.Stopped
    })

    return {
      isSmallScreen,
      isTouchDevice,
      displaySideBySide,
      nftTokens: nfTokenCache.tokens,
      funTokens: funTokenCache.tokens,
      nfTokenCache, // For testing purpose
      funTokenCache, // For testing purpose
    }

  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>