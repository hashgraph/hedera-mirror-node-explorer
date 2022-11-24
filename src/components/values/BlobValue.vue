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
  <a v-if="isURL" v-bind:href="blobValue">{{ blobValue }}</a>
  <span v-else-if="jsonValue" class="h-is-json is-family-monospace h-is-text-size-3">{{ jsonValue }}</span>
  <span v-else-if="blobValue">{{ decodedValue }}</span>
  <span v-else-if="showNone && !initialLoading" class="has-text-grey">None</span>
  <span v-else/>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, ref} from "vue";
import {initialLoadingKey} from "@/AppKeys";

export default defineComponent({
  name: "BlobValue",
  components: {},
  props: {
    blobValue: String,
    showNone: {
      type: Boolean,
      default: false
    },
    base64: {
      type: Boolean,
      default: false
    },
    pretty: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)

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

    const jsonValue = computed(() => {
      let result
      if (decodedValue.value && props.pretty) {
        try {
          result = JSON.parse(decodedValue.value)
          const sValue = Buffer.from(result.s, 'base64').toString()
          console.log("s: " + result.s)
          console.log("sValue: " + sValue)
        } catch (e) {
          result = null
        }
      } else {
        result = null
      }
      return result
    })

    const decodedValue = computed(() => {

      const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

      let result: string
      if (props.blobValue) {
        if (props.base64 && base64regex.test(props.blobValue)) {
          try {
            result = Buffer.from(props.blobValue, 'base64').toString()
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

    const initialLoading = inject(initialLoadingKey, ref(false))

    return {
      isSmallScreen,
      isURL,
      jsonValue,
      decodedValue,
      initialLoading
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>
.h-is-json {
  white-space: pre-wrap;
}
@media (max-width: 767px) {
  .h-is-json {
    white-space: normal;
  }
}
</style>