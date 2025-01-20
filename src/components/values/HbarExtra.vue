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
  <span v-if="tbarAmount !== 0 || !hideZero"
        class="h-is-extra-text is-numeric">
    {{ dollarAmount }}
  </span>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, onBeforeUnmount, onMounted} from "vue";
import {HbarPriceCache} from "@/utils/cache/HbarPriceCache";

export default defineComponent({
  name: "HbarExtra",

  props: {
    tbarAmount: {
      type: Number,
      default: 0
    },
    timestamp: {
      type: String,
      default: "0"
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
    const hbarAmount = computed(() => {
      return props.tbarAmount / 100000000
    })
    const dollarAmount = computed(() => {
      let result: string
      if (hbarPrice.value !== null) {
        const resolution = Math.pow(10, -fractionDigits)
        let usdAmount = hbarAmount.value * hbarPrice.value
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

    const hbarPriceLookup = HbarPriceCache.instance.makeLookup(computed(() => props.timestamp ?? null))
    onMounted(() => hbarPriceLookup.mount())
    onBeforeUnmount(() => hbarPriceLookup.unmount())

    const hbarPrice = computed(() => {
      const rate = hbarPriceLookup.entity.value?.current_rate
      return rate ? (rate.cent_equivalent / rate.hbar_equivalent / 100) : null
    })

    return {dollarAmount}
  }
});

const fractionDigits = 5

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

