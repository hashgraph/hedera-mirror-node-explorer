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

  <template v-if="isInfinite">
    <span class="h-is-low-contrast">Infinite</span>
  </template>
  <template v-else-if="formattedValue">
    <span>{{ formattedValue }}</span>
  </template>
  <template v-else-if="showNone && !initialLoading">
    <span class="h-is-low-contrast">None</span>
  </template>
  <template v-else>
    <span/>
  </template>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, ref} from "vue";
import {formatSeconds} from "@/utils/Duration";
import {initialLoadingKey} from "@/AppKeys";
import {infiniteDuration} from "@/schemas/MirrorNodeSchemas";

export default defineComponent({
  name: "DurationValue",

  props: {
    numberValue: Number,
    stringValue: String,
    showNone: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {

    const formattedValue = computed(() => {
      let result: string | null
      if (props.numberValue) {
        result = formatSeconds(props.numberValue)
      } else if (props.stringValue) {
        result = formatSeconds(props.stringValue)
      } else {
        result = null
      }
      return result
    })

    const isInfinite = computed(() => {
      const duration = props.numberValue ?? Number.parseInt(props.stringValue ?? "")
      return duration >= infiniteDuration
    })

    const initialLoading = inject(initialLoadingKey, ref(false))

    return {
      isInfinite, formattedValue, initialLoading,
    }
  }
});


</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
