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

  <MediaContent
      :url="props.url"
      :type="props.type"
      :size="props.size"
      :auto="props.auto"
      :no-anchor="props.noAnchor"
      @on-load-error="onLoadError"
  >
    <template #placeHolder>
      <img
          v-if="size >= 100"
          src="../../assets/nft-image-placeholder.svg" alt=""
          style="height: 40px"
      />
      <span>
        {{ size > 200 ? 'Non Fungible Token' : 'NFT' }}
      </span>
      <InfoTooltip
          v-if="size >= 100 && (warningTooltip || infoTooltip)"
          :warning-label="warningTooltip"
          :label="infoTooltip"
      />
    </template>
  </MediaContent>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, PropType, ref} from "vue";
import InfoTooltip from "@/components/InfoTooltip.vue";
import MediaContent from "@/components/MediaContent.vue";

const props = defineProps({
  url: {
    type: String as PropType<string | null>,
    default: null
  },
  type: {
    type: String as PropType<string | null>,
    default: null
  },
  size: {
    type: Number,
    default: 40
  },
  auto: {
    type: Boolean,
    default: false
  },
  noAnchor: {
    type: Boolean,
    default: false
  },
})

const isOnIpfs = computed(() => props.url?.includes('ipfs'))

const mediaError = ref(false)
const onLoadError = () => mediaError.value = true

const infoTooltip = computed(() => !props.url ? 'The NFT metadata does not provide any image' : null)

const warningTooltip = computed(() => {
  let result
  if (mediaError.value) {
    result = 'NFT image could not be loaded. '
    if (isOnIpfs.value) {
      result += 'This might be transient due to the nature of the IPFS network. '
          + 'Try to reload the page in a few moments.'
    }
  } else {
    result = null
  }
  return result
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
