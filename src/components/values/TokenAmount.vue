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
  <span class="is-numeric">{{ formattedAmount }}</span>
  <template v-if="showExtra && tokenId != null">
    <span class="ml-2">
      <TokenExtra v-bind:token-id="tokenId" v-bind:use-anchor="useAnchor"/>
    </span>
  </template>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onMounted, ref, watch} from "vue";
import {AxiosResponse} from "axios";
import {TokenInfo} from "@/schemas/HederaSchemas";
import {TokenInfoCollector} from "@/utils/TokenInfoCollector";
import TokenExtra from "@/components/values/TokenExtra.vue";
import {initialLoadingKey} from "@/AppKeys";

export default defineComponent({
  name: "TokenAmount",

  components: {TokenExtra},
  props: {
    amount: Number,
    tokenId: String,
    showExtra: {
      type: Boolean,
      default: false
    },
    useAnchor: {
      type: Boolean,
      default: true
    }
  },

  setup(props) {
    const response = ref<AxiosResponse<TokenInfo>|null>(null)

    const formattedAmount = computed(() => {
      let result: string
      if (response.value !== null && response.value.status == 200) {
        if (props.amount) {
          result = formatTokenAmount(props.amount, response.value.data.decimals)
        } else if (initialLoading.value) {
          result = ""
        } else {
          result = formatTokenAmount(0, response.value.data.decimals)
        }
      } else {
        result = ""
      }
      return result
    })

    const extra = computed(() => {
      let result: string
      if (response.value !== null && response.value.status == 200) {
        result = makeExtra(response.value as AxiosResponse<TokenInfo>)
      } else {
        result = ""
      }
      return result
    })
    const errorFlag = computed(() => {
      return response.value !== null && response.value.status != 200
    })

    const updateResponse = () => {
      if (props.tokenId) {
        TokenInfoCollector.instance.fetch(props.tokenId).then((r: AxiosResponse<TokenInfo>) => {
          response.value = r
        }, (reason: unknown) => {
          console.warn("TokenInfoCollector did fail to fetch " + props.tokenId + " with reason: " + reason)
          response.value = null
        })
      }
    }
    watch(() => props.tokenId, () => {
      updateResponse()
    })

    const initialLoading = inject(initialLoadingKey, ref(false))

    onMounted(() => {
      updateResponse()
    })

    return { formattedAmount, extra, errorFlag, initialLoading }
  }
});

function formatTokenAmount(rawAmount: number, decimals: string|undefined): string {
  const decimalCount = computeDecimalCount(decimals) ?? 0
  const amount = rawAmount / Math.pow(10, decimalCount)
  const amountFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimalCount,
    maximumFractionDigits: decimalCount
  })
  return amountFormatter.format(amount)
}

function computeDecimalCount(decimals: string|undefined): number|null {
  let result: number|null
  if (decimals) {
    const n = Number(decimals)
    result = isNaN(n) ? null : Math.floor(n)
  } else {
    result = null
  }
  return result
}

function makeExtra(response: AxiosResponse<TokenInfo>): string {
  const name = response.data?.name
  const symbol = response.data?.symbol
  const maxLength = 40

  let candidate1: string | null
  if (symbol) {
    const usable = symbol.search("://") == -1 && symbol.length < maxLength
    candidate1 = usable ? symbol : null
  } else {
    candidate1 = null;
  }

  const candidate2 = name && name.length < maxLength ? name : null

  return candidate1 ?? candidate2 ?? response.data.token_id ?? "?"
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>

