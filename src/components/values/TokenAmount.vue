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
  <span v-if="decimalOverflow" :class="{'mr-2': showExtra && tokenId}">?</span>
  <span v-else class="is-numeric" :class="{'mr-2': showExtra && tokenId}">{{ formattedAmount }}</span>
  <span v-if="showExtra && tokenId != null">
    <TokenExtra v-bind:token-id="tokenId" v-bind:use-anchor="useAnchor"/>
  </span>
  <InfoTooltip v-if="decimalOverflow" class="ml-2"
               :label="`This token amount cannot be displayed because the number of decimals (${decimalCount}) of the token is too large`"/>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onMounted, PropType, ref, watch} from "vue";
import {TokenInfo} from "@/schemas/HederaSchemas";
import {TokenInfoCache} from "@/utils/cache/TokenInfoCache";
import TokenExtra from "@/components/values/TokenExtra.vue";
import {initialLoadingKey} from "@/AppKeys";
import InfoTooltip from "@/components/InfoTooltip.vue";

export const MAX_TOKEN_SUPPLY = 9223372036854775807n
export const MAX_DECIMALS = 20

export default defineComponent({
  name: "TokenAmount",

  components: {InfoTooltip, TokenExtra},
  props: {
    amount: {
      type: BigInt as unknown as PropType<bigint|null>,
      default: null
    },
    tokenId: {
      type: String as PropType<string|null>,
      default: null
    },
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
    const response = ref<TokenInfo|null>(null)

    const formattedAmount = computed(() => {
      let result: string
      if (response.value !== null) {
        if (props.amount !== null) {
          if (props.amount > MAX_TOKEN_SUPPLY) {
            result = formatTokenAmount(MAX_TOKEN_SUPPLY, decimalCount.value)
          } else {
            result = formatTokenAmount(props.amount ?? 0, decimalCount.value)
          }
        } else if (initialLoading.value) {
          result = ""
        } else {
          result = "0"
        }
      } else {
        result = ""
      }
      return result
    })

    const extra = computed(() => {
      let result: string
      if (response.value !== null) {
        result = makeExtra(response.value)
      } else {
        result = ""
      }
      return result
    })

    const decimalOverflow = computed(() => {
      return decimalCount.value ? decimalCount.value > MAX_DECIMALS : false
    })

    const decimalCount = computed(() => {
      let result: number
      if (response.value?.decimals) {
        const n = Number(response.value.decimals)
        result = isNaN(n) ? 0 : Math.floor(n)
      } else {
        result = 0
      }
      return result
    })

    const updateResponse = () => {
      if (props.tokenId) {
        TokenInfoCache.instance.lookup(props.tokenId).then((r: TokenInfo | null) => {
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

    return {
      formattedAmount,
      extra,
      decimalOverflow,
      decimalCount,
      initialLoading
    }
  }
});

function formatTokenAmount(rawAmount: bigint, decimalCount: number): string {
  let result: string

  const amountFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimalCount,
    maximumFractionDigits: decimalCount
  })

  if (decimalCount) {
    result = amountFormatter.format(Number(rawAmount) / Math.pow(10, decimalCount))
  } else {
    result = amountFormatter.format(rawAmount)
  }

  return result
}

function makeExtra(response: TokenInfo): string {
  const name = response.name
  const symbol = response.symbol
  const maxLength = 40

  let candidate1: string | null
  if (symbol) {
    const usable = symbol.search("://") == -1 && symbol.length < maxLength
    candidate1 = usable ? symbol : null
  } else {
    candidate1 = null;
  }

  const candidate2 = name && name.length < maxLength ? name : null

  return candidate1 ?? candidate2 ?? response.token_id ?? "?"
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>

