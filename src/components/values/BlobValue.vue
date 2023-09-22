<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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
  <div v-else-if="jsonValue"
       class="h-is-json is-inline-block has-text-left is-family-monospace h-is-text-size-3">{{ jsonValue }}</div>
  <template v-else-if="blobValue">
    <div v-if="limitingFactor && isMediumScreen" class="h-is-one-line is-inline-block"
         :style="{'max-width': windowWidth-limitingFactor + 'px'}">{{ decodedValue }}</div>
    <div v-else-if="limitingFactor" class="h-is-one-line is-inline-block"
         :style="{'max-width': windowWidth-limitingFactor+200 + 'px'}">{{ decodedValue }}</div>
    <div v-else-if="showEncodeButton" style="word-break: break-word;">
      <div>{{ decodedValue }}</div>
      <div v-if="isBlobValueBase64candidate" class="is-flex">
        <select 
          v-model="base64OptionSelected" class="h-is-text-size-4 has-text-white" 
          style="border-width: 0rem; padding: 0.25rem 0.25rem 0.25rem 0; background-color: transparent; cursor: pointer; outline: none; -webkit-appearance: none; -moz-appearance: none; appearance: none;"
          >
          <option v-for="f in base64Options" :key="f" :value="f">
            {{ makeBase64OptionLabels(f) }}
          </option>
        </select>
        <i class="fas fa-caret-down is-flex is-align-items-center"/>
      </div>
    </div>
    <div v-else style="word-break: break-word">{{ decodedValue }}</div>
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

export default defineComponent({
  name: "BlobValue",
  components: {},
  props: {
    blobValue: {
      type: String as PropType<string|null>,
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
    showEncodeButton: {
      type: Boolean,
      default: false
    },
    pretty: {
      type: Boolean,
      default: false
    },
    limitingFactor: Number,
    base64Toggler: Function
  },

  watch: {
    base64OptionSelected(option: string) {
      if (this.base64Toggler) {
        this.base64Toggler(option)
      }
    }
  },
 
  setup(props) {
    const windowWidth = inject('windowWidth', 1280)
    const isMediumScreen = inject('isMediumScreen', true)
    
    const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    
    type base64OptionsTypes = 'RAW' | 'BASE64_DECODED'
    const base64OptionSelected = ref<base64OptionsTypes>('RAW')
    const base64Options = ['RAW', "BASE64_DECODED"] as base64OptionsTypes[]

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
        } catch (e) {
          result = null
        }
      } else {
        result = null
      }
      return result
    })

    const isBlobValueBase64candidate = computed(() => {
      if (props.blobValue) {
        return base64regex.test(props.blobValue);
      } else {
        return false;
      }
    })

    const decodedValue = computed(() => {
      let result: string
      if (props.blobValue) {
        if (props.base64 && isBlobValueBase64candidate.value) {
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

    const makeBase64OptionLabels = (value: base64OptionsTypes) => {
      return value === "RAW" ? "Original data" : "Decoded data"
    }

    return {
      isMediumScreen,
      windowWidth,
      isURL,
      jsonValue,
      decodedValue,
      initialLoading,
      isBlobValueBase64candidate,
      base64Options,
      base64OptionSelected,
      makeBase64OptionLabels
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>