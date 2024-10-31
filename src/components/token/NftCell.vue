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

  <NftPreview
      v-if="property === NftCellItem.image"
      :url="url"
      :type="type"
      :size="size"
      :auto="false"
      :no-anchor="true"
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
import {NftBySerialCache} from "@/utils/cache/NftBySerialCache";
import {TokenMetadataAnalyzer} from "@/components/token/TokenMetadataAnalyzer";
import BlobValue from "@/components/values/BlobValue.vue";
import NftPreview from "@/components/token/NftPreview.vue";
import {CoreConfig} from "@/config/CoreConfig";

export enum NftCellItem {
  name = "name",
  creator = "creator",
  description = "description",
  image = "image",
}

export default defineComponent({
  name: "NftCell",
  components: {NftPreview, BlobValue},

  props: {
    tokenId: {
      type: String as PropType<string | null>,
      default: null
    },
    serialNumber: {
      type: Number as PropType<Number | null>,
      default: null
    },
    property: {
      type: String as PropType<NftCellItem>,
      default: NftCellItem.name
    },
    size: {
      type: Number,
      default: 50
    },
  },

  setup(props) {
    const id = computed(() => props.tokenId)
    const serial = computed(() => props.serialNumber?.toString() ?? null)

    const nftLookup = NftBySerialCache.instance.makeNftLookup(id, serial)
    onMounted(() => nftLookup.mount())
    onBeforeUnmount(() => nftLookup.unmount())

    const ipfsGatewayPrefix = CoreConfig.inject().ipfsGatewayUrlPrefix
    const metadata = computed(() => nftLookup.entity.value?.metadata ?? '')
    const metadataAnalyzer = new TokenMetadataAnalyzer(metadata, ipfsGatewayPrefix)
    onMounted(() => metadataAnalyzer.mount())
    onBeforeUnmount(() => metadataAnalyzer.unmount())

    const propertyValue = computed(() => {
      let result: string | null
      switch (props.property) {
        case NftCellItem.name:
        case NftCellItem.creator:
          result = truncate(metadataAnalyzer[props.property].value ?? '', 40)
          break
        case NftCellItem.description:
          result = truncate(metadataAnalyzer.description.value ?? '', 150)
          break
        default:
          result = null
      }
      return result
    })

    const truncate = (value: string, length: number): string => {
      return value.length > length ? value.slice(0, length) + '…' : value
    }

    return {
      url: metadataAnalyzer.imageUrl,
      type: metadataAnalyzer.type,
      NftCellItem,
      propertyValue,
      truncate
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
