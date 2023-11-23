<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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

  <div v-if="isMainNetwork" class="h-has-background-color">

    <div v-if="isLargeScreen" >
      <div class="is-flex is-flex-wrap-wrap is-justify-content-space-evenly pt-1 pb-2">
        <DashboardItem :name="hbarPriceLabel" :value="'$' + hbarPrice" :variation="hbarPriceVariation"/>
        <DashboardItem :name="hbarMarketCapLabel" :value="'$' + hbarMarketCap" :variation="hbarMarketCapVariation"/>
        <DashboardItem :name="hbarReleasedLabel" :value="hbarReleased"/>
        <DashboardItem :name="hbarTotalLabel" :value="hbarTotal"/>
      </div>
    </div>

    <div v-else-if="isSmallScreen">
      <div class="is-flex is-flex-wrap-wrap is-justify-content-space-evenly pt-1 pb-2">
        <div class="is-flex is-flex-direction-column is-align-items-start">
          <DashboardItem :is-numeric="true" :name="hbarPriceLabel" :value="'$' + hbarPrice" :variation="hbarPriceVariation"/>
          <DashboardItem :is-numeric="true" :name="hbarMarketCapLabel" :value="'$' + hbarMarketCap" :variation="hbarMarketCapVariation"/>
        </div>
        <div class="is-flex is-flex-direction-column is-align-items-start">
          <DashboardItem :is-numeric="true" :name="hbarReleasedLabel" :value="hbarReleased"/>
          <DashboardItem :is-numeric="true" :name="hbarTotalLabel" :value="hbarTotal"/>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="is-flex is-flex-wrap-wrap is-justify-content-space-evenly pt-1 pb-2">
        <div class="is-flex is-flex-direction-column is-align-items-start">
          <DashboardItem :is-numeric="true" :name="hbarPriceLabel" :value="'$' + hbarPrice" :variation="hbarPriceVariation"/>
          <DashboardItem :is-numeric="true" :name="hbarMarketCapLabel" :value="'$' + hbarMarketCap" :variation="hbarMarketCapVariation"/>
          <DashboardItem :is-numeric="true" :name="hbarReleasedLabel" :value="hbarReleased"/>
          <DashboardItem :is-numeric="true" :name="hbarTotalLabel" :value="hbarTotal"/>
        </div>
      </div>
    </div>

  </div>
  <div v-else class="h-has-background-color">

    <div class="is-flex is-justify-content-center h-mainnet-top-banner pt-1 pb-2">
        <DashboardItem :value="currentNetworkDisplayName"/>
    </div>

  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted} from 'vue';
import DashboardItem from "@/components/dashboard/DashboardItem.vue";
import {NetworkRegistry, networkRegistry} from "@/schemas/NetworkRegistry";
import router from "@/router";
import {MarketDataCache} from "@/components/dashboard/MarketDataCache";

export default defineComponent({

  name: 'HbarMarketDashboard',

  components: {DashboardItem},

  setup() {
    const isSmallScreen = inject('isSmallScreen', true)
    const isLargeScreen = inject('isLargeScreen', true)

    const isMainNetwork = computed(() => router.currentRoute.value.params.network == NetworkRegistry.MAIN_NETWORK)

    const currentNetworkDisplayName = computed(() => {
      let displayName
      if (Array.isArray(router.currentRoute.value.params.network)) {
        displayName = networkRegistry.lookup(router.currentRoute.value.params.network[0])?.displayName
      } else {
        displayName = networkRegistry.lookup(router.currentRoute.value.params.network)?.displayName
      }
      return displayName
    })

    const hbarPriceLabel = 'HBAR PRICE'
    const hbarMarketCapLabel = 'HBAR MARKET CAP'
    const hbarReleasedLabel = 'HBAR RELEASED'
    const hbarTotalLabel = 'HBAR TOTAL'

    // marketDataCache
    onMounted(() => MarketDataCache.instance.mount())
    onBeforeUnmount(() => MarketDataCache.instance.unmount())

    return {
      isMainNetwork,
      currentNetworkDisplayName,
      isSmallScreen,
      isLargeScreen,
      hbarPriceLabel,
      hbarMarketCapLabel,
      hbarReleasedLabel,
      hbarTotalLabel,
      marketDataCache: MarketDataCache.instance, // For testing purpose
      hbarReleased: MarketDataCache.instance.hbarReleased,
      hbarTotal: MarketDataCache.instance.hbarTotal,
      hbarPrice: MarketDataCache.instance.hbarPrice,
      hbarPriceVariation: MarketDataCache.instance.hbarPriceVariation,
      hbarMarketCap: MarketDataCache.instance.hbarMarketCap,
      hbarMarketCapVariation: MarketDataCache.instance.hbarMarketCapVariation,
    }
  },
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
