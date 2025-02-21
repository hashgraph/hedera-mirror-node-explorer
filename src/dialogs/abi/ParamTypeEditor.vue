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
  <div>
    <template v-if="needsTextEditor">
      <ParamTextEditor :param-builder="props.paramBuilder"/>
    </template>
    <template v-else-if="needsBooleanEditor">
      <ParamBooleanEditor :param-builder="props.paramBuilder"/>
    </template>
    <template v-else>
      <ParamJsonEditor :param-builder="props.paramBuilder"/>
    </template>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, PropType} from "vue";
import ParamTextEditor from "@/dialogs/abi/ParamTextEditor.vue";
import ParamBooleanEditor from "@/dialogs/abi/ParamBooleanEditor.vue";
import ParamJsonEditor from "@/dialogs/abi/ParamJsonEditor.vue";
import {ContractParamBuilder} from "@/dialogs/abi/ContractCallBuilder.ts";

const props = defineProps({
  paramBuilder: {
    type: Object as PropType<ContractParamBuilder>,
    required: true
  },
})

const needsBooleanEditor = computed(
    () => props.paramBuilder.paramType.baseType == "bool")

const needsTextEditor = computed(() => {
  let result: boolean
  switch (clearSize(props.paramBuilder.paramType.baseType)) {
    case "int":
    case "uint":
    case "string":
    case "address":
    case "bytes":
      result = true
      break
    default:
      result = false
      break
  }
  return result
})

interface SizedType {
  coreType: string, // int, uint, string, bytes
  size: number
}

function clearSize(baseType: string): string {
  const sizedType = parseBaseType(baseType)
  return sizedType?.coreType ?? baseType
}

function parseBaseType(baseType: string): SizedType | null {
  let result: SizedType | null = null
  let sizableTypes = ["int", "uint", "string", "bytes"]
  for (const t of sizableTypes) {
    if (baseType.startsWith(t)) {
      const coreType = baseType.slice(0, t.length)
      const size = parseInt(baseType.slice(t.length))
      if (!isNaN(size) && size >= 1) {
        result = {coreType, size}
        break
      }
    }
  }
  return result
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
