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

  <template v-if="isNone">
    <span class="has-text-grey">None</span>
  </template>
  <template v-else>
    <template v-if="amount !== 0 || !hideZero">
    <span class="has-hbar is-numeric"
          :class="{ 'has-text-grey': isGrey, 'h-is-debit': isRed, 'h-is-credit': isGreen }">
      {{ formattedAmount }}
    </span>
    </template>

    <template v-if="showExtra">
    <span class="ml-2">
      <HbarExtra v-bind:tbar-amount="amount" v-bind:small-extra="smallExtra" v-bind:hide-zero="hideZero"/>
    </span>
    </template>
  </template>


</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent} from "vue";
import HbarExtra from "@/components/values/HbarExtra.vue";

export default defineComponent({
  name: "HbarAmount",
  components: {HbarExtra},
  props: {
    amount: {
      type: Number,
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
    const hbarAmount = computed(() => {
      return (props.amount??0) / 100000000
    })

    const isNone = computed(() => props.amount == null)

    const formattedAmount = computed(() => {
      const amountFormatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: props.decimals,
        maximumFractionDigits: 8
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

    return { isNone, formattedAmount, isGrey, isRed, isGreen }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>

