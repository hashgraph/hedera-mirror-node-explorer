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

  <o-field>
    <o-select v-model="selectedType" class="ml-2 h-is-text-size-1">
      <option value="">TYPES: ALL</option>
      <option v-for="t in types" v-bind:key="t" v-bind:value="t">
        {{ makeTypeLabel(TransactionType[t]) }}
      </option>
    </o-select>
  </o-field>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, PropType, ref, watch} from "vue";
import {TransactionType} from "@/schemas/HederaSchemas";
import {makeTypeLabel} from "@/utils/TransactionTools";

export default defineComponent({
  name: "TransactionTypeSelect",

  props: {
    modelValue: String as PropType<TransactionOption>
  },

  setup(props, context) {

    const selectedOption = ref("all")
    watch(selectedOption, () => {
      console.log('update:modelValue', selectedOption.value)
    })

    // 1) types
    const types = Object.keys(TransactionType)

    // 2) selectedType
    const selectedType = ref<TransactionOption>(props.modelValue ?? "")
    watch(selectedType, () => {
      context.emit('update:modelValue', selectedType.value)
    })

    return {
      types,
      selectedType,
      selectedOption,

      makeTypeLabel,
      TransactionType
    }
  }
});

export type TransactionOption = TransactionType | ""

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>