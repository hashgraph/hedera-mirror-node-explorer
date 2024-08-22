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

  <div class="is-flex is-justify-content-space-between">
    <div v-if="accountId" class="h-is-tertiary-text">
      <HbarAmount timestamp="0" v-bind:amount="hbarBalance" v-bind:show-extra="true"/>
    </div>
    <div v-if="isSmallScreen && elapsed" class="has-text-right has-text-grey mt-1">
      {{ elapsed }}
    </div>
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, PropType, ref} from 'vue';
import HbarAmount from "@/components/values/HbarAmount.vue";
import TokenAmount from "@/components/values/TokenAmount.vue";
import {BalanceAnalyzer} from "@/utils/analyzer/BalanceAnalyzer";

export default defineComponent({

  name: 'InlineBalancesValue',

  components: {
    TokenAmount,
    HbarAmount,
  },

  props: {
    balanceAnalyzer: {
      type: Object as PropType<BalanceAnalyzer>,
      required: true
    }
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    const accountId = props.balanceAnalyzer.accountId ?? ref(null)

    const elapsed = computed(() => {
      let result: string | null
      const duration = props.balanceAnalyzer.balanceAge.value
      if (duration !== null) {
        if (duration.years > 0) {
          result = "> " + (duration.years > 1 ? duration.years + " years" : "1 year") + " ago"
        } else if (duration.days > 0) {
          result = "> " + (duration.days > 1 ? duration.days + " days" : "1 day") + " ago"
        } else if (duration.hours > 0) {
          result = "> " + (duration.hours > 1 ? duration.hours + " hours" : "1 hour") + " ago"
        } else if (duration.minutes > 0) {
          result = duration.minutes + " min ago"
        } else {
          result = null
        }
      } else {
        result = null
      }
      return result
    })

    return {
      isSmallScreen,
      isMediumScreen,
      isTouchDevice,
      accountId,
      balanceTimeStamp: props.balanceAnalyzer.balanceTimeStamp,
      hbarBalance: props.balanceAnalyzer.hbarBalance,
      elapsed,
    }
  }
});

</script>

<style/>