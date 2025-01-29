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
  <input class="checkbox" type="checkbox" v-model="checked"/>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, onBeforeUnmount, onMounted, PropType, ref, watch, WatchStopHandle} from "vue";
import {ContractParamBuilder} from "@/dialogs/abi/ContractCallBuilder.ts";
import {AppStorage} from "@/AppStorage.ts";

const props = defineProps({
  paramBuilder: {
    type: Object as PropType<ContractParamBuilder>,
    required: true
  },
})

const checked = ref<boolean>(false)

const lastParamData = computed(() => {
  const functionHash = props.paramBuilder.callBuilder.fragment.selector
  const paramName = props.paramBuilder.paramType.name
  return AppStorage.getInputParam(functionHash, paramName)
})

let watchHandle: WatchStopHandle | null = null
onMounted(() => {
  checked.value = !!lastParamData.value
  watchHandle = watch(checked, () => {
    props.paramBuilder.paramData.value = checked.value
  }, {immediate: true})
})
onBeforeUnmount(() => {
  if (watchHandle !== null) {
    watchHandle()
    watchHandle = null
  }
  props.paramBuilder.paramData.value = null
  checked.value = false
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
