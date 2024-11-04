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

  <template v-if="isNone">
    <span v-if="initialLoading"/>
    <span v-else class="has-text-grey">None</span>
  </template>
  <template v-else-if="amount !== 0 || !hideZero">
    <span class="is-numeric" :class="{ 'has-text-grey': isGrey, 'h-is-debit': isRed, 'h-is-credit': isGreen }">
      {{ formattedAmount }}
    </span>
    <span v-if="cryptoSymbol" v-html="cryptoSymbol"/>
    <span v-else style="color: darkgrey">ℏ</span>
    <span v-if="showExtra" class="ml-2">
      <HbarExtra :hide-zero="hideZero" :small-extra="smallExtra" :tbar-amount="amount ?? 0" :timestamp="timestamp"/>
    </span>
  </template>
  <span v-else/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, PropType, ref} from "vue";
import HbarExtra from "@/components/values/HbarExtra.vue";
import {initialLoadingKey} from "@/AppKeys";
import {CoreConfig} from "@/config/CoreConfig";

export default defineComponent({
  name: "HbarAmount",
  components: {HbarExtra},
  props: {
    amount: {
      type: Number as PropType<number | null>,
      default: null
    },
    timestamp: {
      type: String,
      default: "0"
    },
    decimals: {
      type: Number,
      default: 8
    },
    showExtra: {
      type: Boolean,
      default: false
    },
    smallExtra: {
      type: Boolean,
      default: true
    },
    hideZero: {
      type: Boolean,
      default: false
    },
    colored: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    const initialLoading = inject(initialLoadingKey, ref(false))

    const coreConfig = CoreConfig.inject()
    const cryptoSymbol = coreConfig.cryptoSymbol

    const hbarAmount = computed(() => {
      return (props.amount ?? 0) / 100000000
    })

    const isNone = computed(() => props.amount == null)

    const formattedAmount = computed(() => {
      const amountFormatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: props.decimals ?? 0,
        maximumFractionDigits: props.decimals ?? 8
      })
      return amountFormatter.format(hbarAmount.value)
    })

    const isGrey = computed(() => {
      return props.amount === 0
    })

    const isRed = computed(() => {
      return hbarAmount.value < 0 && props.colored
    })

    const isGreen = computed(() => {
      return hbarAmount.value > 0 && props.colored
    })

    return {initialLoading, isNone, formattedAmount, isGrey, isRed, isGreen, cryptoSymbol}
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>

