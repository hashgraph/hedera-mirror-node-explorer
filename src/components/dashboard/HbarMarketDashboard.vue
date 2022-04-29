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

  <div>
    <div class="is-flex is-flex-wrap-wrap is-justify-content-space-evenly h-top-banner py-2">

      <DashboardItem :name="hbarPriceLabel" :value="hbarPrice" :variation="hbarPriceVariation">
        <template v-slot:symbol>
          <img alt="Hbar Symbol" class="image" src="@/assets/hbar.png" style="width: 28px; height: 37px;">
        </template>
      </DashboardItem>

      <DashboardItem :name="hbarMarketCapLabel" :value="hbarMarketCap" :variation="hbarMarketCapVariation">
        <template v-slot:symbol>
          <img alt="World Market Symbol" class="image" src="@/assets/market-logo.png" style="width: 43px; height: 43px;">
        </template>
      </DashboardItem>

    </div>
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, onBeforeUnmount, onMounted, ref} from 'vue';
import {CoinGeckoMarketData} from "@/schemas/CoinGeckoMarketData";
import {CoinGeckoCache} from "@/components/dashboard/CoinGeckoCache";
import DashboardItem from "@/components/dashboard/DashboardItem.vue";

export default defineComponent({

  name: 'HbarMarketDashboard',

  components: {DashboardItem},

  props: {
    // period: Number,
  },

  setup() {
    const hbarPriceLabel = 'HBAR PRICE'
    const hbarMarketCapLabel = 'HBAR MARKET CAP'

    // 1)
    const coinGeckoMarketData = ref<CoinGeckoMarketData|null>(null)

    // 2)
    const hbarPrice = computed(() => {
      const currentPrice = coinGeckoMarketData.value?.current_price
      return currentPrice ? (Math.round(currentPrice.usd * 10000) / 10000).toFixed(4) : ""
    })

    // 3)
    const hbarPriceVariation = computed(() => {
      const pcp24 = coinGeckoMarketData.value?.price_change_percentage_24h
      return pcp24 ? (Math.round(pcp24 * 100)/100).toFixed(2) : ""
    })

    // 4)
    const hbarMarketCap = computed(() => {
      const mc = coinGeckoMarketData.value?.market_cap
      return mc ? Math.round(mc.usd).toLocaleString('en-US') : ""
    })

    // 4)
    const hbarMarketCapVariation = computed(() => {
      const mccp24 = coinGeckoMarketData.value?.market_cap_change_percentage_24h
      return mccp24 ? (Math.round(mccp24 * 100)/100).toFixed(2) : ""
    })

    const cache = new CoinGeckoCache();
    cache.responseDidChangeCB = () => {
      coinGeckoMarketData.value = cache.getEntity()?.market_data ?? null;
    }
    onMounted(() => {
      cache.start()
    })
    onBeforeUnmount(() => {
      cache.stop()
    })

    return {
      hbarPriceLabel,
      hbarMarketCapLabel,
      coinGeckoMarketData,
      hbarPrice,
      hbarPriceVariation,
      hbarMarketCap,
      hbarMarketCapVariation
    }
  },
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
