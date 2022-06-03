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

  <div v-if="isLargeScreen">
    <div class="is-flex is-flex-wrap-wrap is-justify-content-space-evenly h-top-banner py-2">
      <DashboardItem :name="hbarPriceLabel" :value="'$' + hbarPrice" :variation="hbarPriceVariation"/>
      <DashboardItem :name="hbarMarketCapLabel" :value="'$' + hbarMarketCap" :variation="hbarMarketCapVariation"/>
      <DashboardItem :name="hbarReleasedLabel" :value="hbarReleased"/>
      <DashboardItem :name="hbarTotalLabel" :value="hbarTotal"/>
    </div>
  </div>

  <div v-else-if="isSmallScreen">
    <div class="is-flex is-flex-wrap-wrap is-justify-content-space-evenly h-top-banner py-2">
      <div class="is-flex is-flex-direction-column is-align-items-start">
        <DashboardItem :name="hbarPriceLabel" :value="'$' + hbarPrice" :variation="hbarPriceVariation"/>
        <DashboardItem :name="hbarMarketCapLabel" :value="'$' + hbarMarketCap" :variation="hbarMarketCapVariation"/>
      </div>
      <div class="is-flex is-flex-direction-column is-align-items-start">
        <DashboardItem :name="hbarReleasedLabel" :value="hbarReleased"/>
        <DashboardItem :name="hbarTotalLabel" :value="hbarTotal"/>
      </div>
    </div>
  </div>

  <div v-else>
    <div class="is-flex is-flex-wrap-wrap is-justify-content-space-evenly h-top-banner py-2">
      <div class="is-flex is-flex-direction-column is-align-items-start">
        <DashboardItem :name="hbarPriceLabel" :value="'$' + hbarPrice" :variation="hbarPriceVariation"/>
        <DashboardItem :name="hbarMarketCapLabel" :value="'$' + hbarMarketCap" :variation="hbarMarketCapVariation"/>
        <DashboardItem :name="hbarReleasedLabel" :value="hbarReleased"/>
        <DashboardItem :name="hbarTotalLabel" :value="hbarTotal"/>
      </div>
    </div>
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted, ref} from 'vue';
import axios from "axios";
import {CoinGeckoMarketData} from "@/schemas/CoinGeckoMarketData";
import {CoinGeckoCache} from "@/components/dashboard/CoinGeckoCache";
import {NetworkSupplyResponse} from "@/schemas/HederaSchemas";
import DashboardItem from "@/components/dashboard/DashboardItem.vue";

export default defineComponent({

  name: 'HbarMarketDashboard',

  components: {DashboardItem},

  props: {
    // period: Number,
  },

  setup() {
    const isSmallScreen = inject('isSmallScreen', true)
    const isLargeScreen = inject('isLargeScreen', true)

    const hbarPriceLabel =     'HBAR PRICE'
    const hbarMarketCapLabel = 'HBAR MARKET CAP'
    const hbarReleasedLabel = 'HBAR RELEASED'
    const hbarTotalLabel = 'HBAR TOTAL'

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

    // 5)
    const hbarMarketCapVariation = computed(() => {
      const mccp24 = coinGeckoMarketData.value?.market_cap_change_percentage_24h
      return mccp24 ? (Math.round(mccp24 * 100)/100).toFixed(2) : ""
    })

    // 6)
    let hbarReleased = ref("")
    let hbarTotal = ref("")

    const cache = new CoinGeckoCache();
    cache.responseDidChangeCB = () => {
      coinGeckoMarketData.value = cache.getEntity()?.market_data ?? null;
    }
    onMounted(() => {
      fetchNetworkSupply()
      cache.start()
    })
    onBeforeUnmount(() => {
      cache.stop()
    })

    const fetchNetworkSupply = () => {
      axios
          .get<NetworkSupplyResponse>("api/v1/network/supply/")
          .then(result => {
            if (result.data.released_supply) {
              hbarReleased.value = (Number(result.data.released_supply)/100000000).toLocaleString('en-US')
            }
            if (result.data.total_supply) {
              hbarTotal.value = (Number(result.data.total_supply)/100000000).toLocaleString('en-US')
            }
          })
    }

    return {
      isSmallScreen,
      isLargeScreen,
      hbarPriceLabel,
      hbarMarketCapLabel,
      hbarReleasedLabel,
      hbarTotalLabel,
      coinGeckoMarketData,
      hbarPrice,
      hbarPriceVariation,
      hbarMarketCap,
      hbarMarketCapVariation,
      hbarReleased,
      hbarTotal
    }
  },
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
