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

  <TokenAmount
      v-if="property === TokenCellItem.tokenBalance && propertyValue"
      :amount="BigInt(propertyValue)"
      :token-id="tokenId"
  />

  <BlobValue
      v-else
      :blob-value="propertyValue"
  />

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, onBeforeUnmount, onMounted, PropType} from "vue";
import BlobValue from "@/components/values/BlobValue.vue";
import {TokenInfoCache} from "@/utils/cache/TokenInfoCache";
import {makeTokenName, makeTokenSymbol} from "@/schemas/HederaUtils";
import TokenAmount from "@/components/values/TokenAmount.vue";

export enum TokenCellItem {
  tokenName = "tokenName",
  tokenSymbol = "tokenSymbol",
  tokenType = "tokenType",
  tokenBalance = "tokenBalance",
  tokenNbSerials = "tokenNbSerials"
}

export default defineComponent({
  name: "TokenCell",
  components: {TokenAmount, BlobValue},

  props: {
    tokenId: {
      type: String as PropType<string | null>,
      default: null
    },
    property: {
      type: String as PropType<TokenCellItem>,
      default: TokenCellItem.tokenName
    },
    balanceOrNbSerials: {
      type: Number as PropType<number | null>,
      default: null
    }
  },

  setup(props) {
    const FUNGIBLE = "FUNGIBLE_COMMON"
    const NONFUNGIBLE = "NON_FUNGIBLE_UNIQUE"

    const id = computed(() => props.tokenId)

    const infoLookup = TokenInfoCache.instance.makeLookup(id)
    onMounted(() => infoLookup.mount())
    onBeforeUnmount(() => infoLookup.unmount())

    const propertyValue = computed(() => {
      let result: string | null
      switch (props.property) {
        case TokenCellItem.tokenName:
          result = makeTokenName(infoLookup.entity.value)
          break
        case TokenCellItem.tokenSymbol:
          result = makeTokenSymbol(infoLookup.entity.value)
          break
        case TokenCellItem.tokenType:
          result = infoLookup.entity.value?.type === FUNGIBLE ? 'Fungible' : 'NFT'
          break
        case TokenCellItem.tokenBalance:
          result = infoLookup.entity.value?.type === FUNGIBLE
              ? (props.balanceOrNbSerials?.toString() ?? '')
              : null
          break
        case TokenCellItem.tokenNbSerials:
          result = infoLookup.entity.value?.type === NONFUNGIBLE
              ? (props.balanceOrNbSerials?.toString() ?? '')
              : null
          break
        default:
          result = null
      }
      return result
    })

    return {
      propertyValue,
      TokenCellItem,
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
