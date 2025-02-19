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

  <div v-if="enableMarket" class="h-has-background-color">

    <div v-if="isLargeScreen">
      <div class="is-flex is-flex-wrap-wrap is-justify-content-space-evenly pt-1 pb-2">
        <DashboardItem :name="hbarPriceLabel" :value="hbarPrice" :variation="hbarPriceVariation"/>
        <DashboardItem :name="hbarMarketCapLabel" :value="hbarMarketCap" :variation="hbarMarketCapVariation"/>
        <DashboardItem :name="hbarReleasedLabel" :value="hbarReleased"/>
        <DashboardItem :name="hbarTotalLabel" :value="hbarTotal"/>
      </div>
    </div>

    <div v-else-if="isSmallScreen">
      <div class="is-flex is-flex-wrap-wrap is-justify-content-space-evenly pt-1 pb-2">
        <div class="is-flex is-flex-direction-column is-align-items-start">
          <DashboardItem :is-numeric="true" :name="hbarPriceLabel" :value="hbarPrice"
                         :variation="hbarPriceVariation"/>
          <DashboardItem :is-numeric="true" :name="hbarMarketCapLabel" :value="hbarMarketCap"
                         :variation="hbarMarketCapVariation"/>
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
          <DashboardItem :is-numeric="true" :name="hbarPriceLabel" :value="hbarPrice"
                         :variation="hbarPriceVariation"/>
          <DashboardItem :is-numeric="true" :name="hbarMarketCapLabel" :value="hbarMarketCap"
                         :variation="hbarMarketCapVariation"/>
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
import {NetworkConfig} from "@/config/NetworkConfig";
import {routeManager} from "@/router";
import {NetworkMetricsLoader} from "@/components/dashboard/metrics/NetworkMetricsLoader";
import {CoreConfig} from "@/config/CoreConfig.ts";

export default defineComponent({

  name: 'HbarMarketDashboard',

  components: {DashboardItem},

  setup() {
    const isSmallScreen = inject('isSmallScreen', true)
    const isLargeScreen = inject('isLargeScreen', true)
    const cryptoName = CoreConfig.inject().cryptoName

    const isMainNetwork = computed(() => routeManager.currentNetwork.value == NetworkConfig.MAIN_NETWORK)

    const currentNetworkDisplayName = computed(() => routeManager.currentNetworkEntry.value.displayName)

    const hbarPriceLabel = `${cryptoName} PRICE`
    const hbarMarketCapLabel = `${cryptoName} MARKET CAP`
    const hbarReleasedLabel = `${cryptoName} RELEASED`
    const hbarTotalLabel = `${cryptoName} TOTAL`

    // Hedera Metrics
    const networkMetricsLoader = new NetworkMetricsLoader()
    onMounted(() => networkMetricsLoader.mount())
    onBeforeUnmount(() => networkMetricsLoader.unmount())

    return {
      isMainNetwork,
      currentNetworkDisplayName,
      isSmallScreen,
      isLargeScreen,
      enableMarket: routeManager.enableMarket,
      hbarPriceLabel,
      hbarMarketCapLabel,
      hbarReleasedLabel,
      hbarTotalLabel,
      hbarReleased: networkMetricsLoader.hbarReleasedText,
      hbarTotal: networkMetricsLoader.hbarTotalText,
      hbarPrice: networkMetricsLoader.hbarPriceText,
      hbarPriceVariation: networkMetricsLoader.hbarPriceVariationText,
      hbarMarketCap: networkMetricsLoader.hbarMarketCapText,
      hbarMarketCapVariation: networkMetricsLoader.hbarMarketCapVariationText,
    }
  },
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
