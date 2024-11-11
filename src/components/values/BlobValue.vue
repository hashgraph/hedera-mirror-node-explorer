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
  <div class="should-wrap">

    <template v-if="blobValue">

      <template v-if="isURL">
        <span v-if="noAnchor">{{ blobValue }}</span>
        <a v-else :href="blobValue">{{ blobValue }}</a>
      </template>

      <template v-else-if="decodedURL">
        <span v-if="noAnchor">{{ decodedURL }}</span>
        <a v-else :href="decodedURL.toString()">{{ decodedURL }}</a>
      </template>

      <template v-else-if="ipfsAddress">
        <span v-if="noAnchor">{{ decodedValue }}</span>
        <a v-else :href="ipfsAddress">{{ decodedValue }}</a>
      </template>

      <template v-else-if="jsonValue && isNaN(jsonValue)">
        <div style="max-height: 200px; padding: 10px"
             class="h-is-json mt-1 h-code-box h-has-page-background is-inline-block has-text-left h-is-text-size-3 should-wrap"
        >
          {{ jsonValue }}
        </div>
      </template>

      <template v-else>
        <div v-if="decodedValue.length > 1024" style="max-height: 200px; padding: 10px"
             class="h-is-json mt-1 h-code-box h-has-page-background is-inline-block has-text-left h-is-text-size-3 should-wrap">
          <span id="blob-main">
            {{ (b64EncodingFound && showBase64AsExtra) ? blobValue : decodedValue }}
          </span>
        </div>
        <div v-else style="word-break: break-word">
          <span id="blob-main">
            {{ (b64EncodingFound && showBase64AsExtra) ? blobValue : decodedValue }}
          </span>
          <div v-if="b64EncodingFound && showBase64AsExtra" class="h-is-extra-text h-is-text-size-3 mt-1">
            <span class="has-text-grey">Base64:</span>
            <span id="blob-extra">{{ decodedValue }}</span>
          </div>
        </div>
      </template>

    </template>

    <span v-else-if="showNone && !initialLoading" class="has-text-grey">None</span>

    <span v-else/>

  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, PropType, ref} from "vue";
import {initialLoadingKey} from "@/AppKeys";
import {CoreConfig} from "@/config/CoreConfig";

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
    noAnchor: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    const isMediumScreen = inject('isMediumScreen', true)
    const windowWidth = inject('windowWidth', 1280)
    const initialLoading = inject(initialLoadingKey, ref(false))

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
      if (decodedValue.value && decodedValue.value != '{}' && props.pretty) {
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

    const b64EncodingFound = computed(() => b64DecodedValue.value !== null)

    const b64DecodedValue = computed(() => {
      let result: string|null
      const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
      if (props.blobValue && props.base64 && base64regex.test(props.blobValue)) {
        try {
          result = Buffer.from(props.blobValue, 'base64').toString()
        } catch {
          result = null
        }
      } else {
        result = null
      }
      return result
    })

    const decodedValue = computed(() => {

      let result: string

      if (props.blobValue) {
        if (props.base64) {
          result = b64DecodedValue.value ?? props.blobValue
        } else {
          result = props.blobValue
        }
      } else {
        result = ""
      }
      return result
    })

    const ipfsGatewayPrefix = CoreConfig.inject().ipfsGatewayUrlPrefix

    const ipfsAddress = computed(() => {
      if (decodedValue.value.startsWith("ipfs://") && decodedValue.value.length > 7) {
        return `${ipfsGatewayPrefix}${decodedValue.value.substring(7)}`
      }
      return null
    })

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
