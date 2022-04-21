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
  <span v-if="tbarAmount !== 0 || !hideZero"
        v-bind:class="{'h-is-smaller': smallExtra}"
        class="h-is-extra-text is-numeric" >
    {{ dollarAmount }}
  </span>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, ref} from "vue";
import {AxiosResponse} from "axios";
import {CoinGeckoCollector} from "@/utils/CoinGeckoCollector";
import {CoinGeckoResponse} from "@/schemas/CoinGeckoMarketData";

export default defineComponent({
  name: "HbarExtra",

  props: {
    tbarAmount: {
      type: Number,
      default: 0
    },
    smallExtra: {
      type: Boolean,
      default: true
    },
    hideZero: {
      type: Boolean,
      default: false
    },
  },

  setup(props) {
    const response = ref<AxiosResponse<CoinGeckoResponse>|null>(null)

    const hbarAmount = computed(() => {
      return props.tbarAmount / 100000000
    })
    const dollarAmount = computed(() => {
      let result: string
      if (response.value !== null && response.value.status == 200) {
        const resolution = Math.pow(10, -fractionDigits)
        let usdAmount = response.value.data.market_data.current_price.usd * hbarAmount.value
        if (0 < usdAmount && usdAmount < +resolution) {
          usdAmount = resolution
        } else if (-resolution < usdAmount && usdAmount < 0) {
          usdAmount = -resolution
        }
        result = dollarFormatting.format(usdAmount)
      } else {
        result = ""
      }
      return result
    })

    CoinGeckoCollector.instance.fetch(null)
        .then((r: AxiosResponse<CoinGeckoResponse>) => {
          response.value = r
        }, (reason: unknown) => {
          console.warn("CoinGeckoCollector did fail to fetch with reason: " + reason)
          response.value = null
        })

    return { dollarAmount }
  }
});

const fractionDigits = 4

const dollarFormatting = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: fractionDigits,
  maximumFractionDigits: fractionDigits
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>

