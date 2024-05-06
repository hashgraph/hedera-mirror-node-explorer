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
  <a v-if="isURL && blobValue" v-bind:href="blobValue">{{ blobValue }}</a>
  <a v-else-if="decodedURL" :href="decodedURL.toString()">{{ decodedURL }}</a>
  <a v-else-if="ipfsAddress" :href="ipfsAddress">{{ decodedValue }}</a>
  <div v-else-if="jsonValue"
       class="h-is-json is-inline-block has-text-left is-family-monospace h-is-text-size-3 should-wrap">{{ jsonValue }}
  </div>
  <template v-else-if="blobValue">
    <div v-if="limitingFactor && isMediumScreen" class="h-is-one-line is-inline-block"
         :style="{'max-width': windowWidth-limitingFactor + 'px'}">{{ decodedValue }}
    </div>
    <div v-else-if="limitingFactor" class="h-is-one-line is-inline-block"
         :style="{'max-width': windowWidth-limitingFactor+200 + 'px'}">{{ decodedValue }}
    </div>
    <div v-else style="word-break: break-word">
      <span id="blob-main">
        {{ (b64EncodingFound && showBase64AsExtra) ? blobValue : decodedValue }}
      </span>
      <div v-if="b64EncodingFound && showBase64AsExtra" class="h-is-extra-text h-is-text-size-3 mt-1">
        <span class="has-text-grey">
          Base64:
        </span>
        <span id="blob-extra">
          {{ decodedValue }}
        </span>
      </div>
    </div>
  </template>
  <span v-else-if="showNone && !initialLoading" class="has-text-grey">None</span>
  <span v-else/>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, PropType, ref} from "vue";
import {initialLoadingKey} from "@/AppKeys";

export const IPFS_GATEWAY_PREFIX = 'https://cloudflare-ipfs.com/ipfs/'

export default defineComponent({
  name: "BlobValue",
  components: {},
  props: {
    blobValue: {
      type: String as PropType<string | null>,
      default: null
    },
    showNone: {
      type: Boolean,
      default: false
    },
    base64: {
      type: Boolean,
      default: false
    },
    showBase64AsExtra: {
      type: Boolean,
      default: false
    },
    pretty: {
      type: Boolean,
      default: false
    },
    limitingFactor: Number
  },

  setup(props) {
    const isMediumScreen = inject('isMediumScreen', true)
    const windowWidth = inject('windowWidth', 1280)
    const isURL = computed(() => {
      let result: boolean
      if (props.blobValue) {
        try {
          const url = new URL(props.blobValue)
          result = url.protocol == "http:" || url.protocol == "https:"
        } catch {
          result = false
        }
      } else {
        result = false
      }
      return result
    })

    const decodedURL = computed(() => {
      if (decodedValue.value.startsWith("http://") || decodedValue.value.startsWith("https://")) {
        try {
          return new URL(decodedValue.value)
        } catch {
          return null
        }
      }
      return null
    })

    const jsonValue = computed(() => {
      let result
      if (decodedValue.value && props.pretty) {
        try {
          result = JSON.parse(decodedValue.value)
        } catch (e) {
          result = null
        }
      } else {
        result = null
      }
      return result
    })

    const b64EncodingFound = ref(false)

    const decodedValue = computed(() => {

      const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
      let result: string
      b64EncodingFound.value = false

      if (props.blobValue) {
        if (props.base64 && base64regex.test(props.blobValue)) {
          try {
            result = Buffer.from(props.blobValue, 'base64').toString()
            b64EncodingFound.value = true
          } catch {
            result = props.blobValue
          }
        } else {
          result = props.blobValue
        }
      } else {
        result = ""
      }
      return result
    })

    const ipfsAddress = computed(() => {
      if (decodedValue.value.startsWith("ipfs://") && decodedValue.value.length > 7) {
        return `${IPFS_GATEWAY_PREFIX}${decodedValue.value.substring(7)}`
      }
      return null
    })

    const initialLoading = inject(initialLoadingKey, ref(false))

    return {
      isMediumScreen,
      windowWidth,
      isURL,
      jsonValue,
      b64EncodingFound,
      decodedValue,
      initialLoading,
      ipfsAddress,
      decodedURL
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>