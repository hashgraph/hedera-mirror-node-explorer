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

  <div class="dashboard-root">
    <MarketMarketDashboardItem
        :title="hbarPriceLabel"
        :value="hbarPrice"
        :variation="hbarPriceVariation"
    >
      <img id="crypto-logo" alt="Crypto Logo" :src="cryptoLogoURL ?? ''">
    </MarketMarketDashboardItem>

    <div class="line"/>

    <MarketMarketDashboardItem
        :title="hbarMarketCapLabel"
        :value="hbarMarketCap"
        :variation="hbarMarketCapVariation"
    >
      <Globe :size="32"/>
    </MarketMarketDashboardItem>

    <div v-if="isLargeScreen || !isSmallScreen" class="line"/>

    <MarketMarketDashboardItem
        :title="hbarReleasedLabel"
        :value="hbarReleased"
    >
      <ArrowBigUpDash :size="32"/>
    </MarketMarketDashboardItem>

    <div class="line"/>

    <MarketMarketDashboardItem
        :title="hbarTotalLabel"
        :value="hbarTotal"
    >
      <Coins :size="32"/>
    </MarketMarketDashboardItem>
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, inject, onBeforeUnmount, onMounted, ref} from 'vue';
import MarketMarketDashboardItem from "@/components/dashboard/MarketDashboardItem.vue";
import {NetworkMetricsLoader} from "@/components/dashboard/metrics/NetworkMetricsLoader";
import {CoreConfig} from "@/config/CoreConfig.ts";
import {ThemeController} from "@/components/ThemeController.ts";
import {ArrowBigUpDash, Coins, Globe} from 'lucide-vue-next';

const isSmallScreen = inject('isSmallScreen', ref(true))
const isLargeScreen = inject('isLargeScreen', ref(true))
const darkSelected = ThemeController.inject().darkSelected
const cryptoName = CoreConfig.inject().cryptoName

const hbarPriceLabel = `${cryptoName} PRICE`
const hbarMarketCapLabel = `${cryptoName} MARKET CAP`
const hbarReleasedLabel = `${cryptoName} RELEASED`
const hbarTotalLabel = `${cryptoName} TOTAL`

const cryptoLogoURL = computed(() =>
    darkSelected.value ? CoreConfig.inject().cryptoLogoDarkURL : CoreConfig.inject().cryptoLogoLightURL
)

// Hedera Metrics
const networkMetricsLoader = new NetworkMetricsLoader()
onMounted(() => networkMetricsLoader.mount())
onBeforeUnmount(() => networkMetricsLoader.unmount())

const hbarReleased = networkMetricsLoader.hbarReleasedText
const hbarTotal = networkMetricsLoader.hbarTotalText
const hbarPrice = networkMetricsLoader.hbarPriceText
const hbarPriceVariation = networkMetricsLoader.hbarPriceVariationText
const hbarMarketCap = networkMetricsLoader.hbarMarketCapText
const hbarMarketCapVariation = networkMetricsLoader.hbarMarketCapVariationText

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.dashboard-root {
  align-items: flex-start;
  background-color: var(--background-primary-transparent);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-secondary);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  height: fit-content;
  max-width: 358px;
  padding: 26px 32px 26px 32px;
  width: 100%;
}

@media (min-width: 768px) {
  div.dashboard-root {
    align-items: center;
    display: grid;
    gap: 16px;
    grid-template-columns: 1fr auto 1fr;
    justify-items: center;
    max-width: 730px;
  }
}

@media (min-width: 1280px) {
  div.dashboard-root {
    grid-template-columns:  repeat(7, auto);
    max-width: 100%;
  }
}

div.line {
  border: 1px solid var(--border-secondary);
  rotate: 0deg;
  max-width: 294px;
  width: 100%;
}

@media (min-width: 768px) {
  div.line {
    border: 1px solid var(--border-secondary);
    rotate: -90deg;
    width: 32px;
  }
}

</style>
