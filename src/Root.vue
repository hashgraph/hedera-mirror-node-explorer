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

  <template v-if="props.coreConfig instanceof CoreConfig && props.networkConfig instanceof NetworkConfig">
    <App :core-config="props.coreConfig" :network-config="props.networkConfig"/>
  </template>
  <template v-else>
    <div v-if="coreConfigErrorMessage">
      <div>Failed to load core-config.json:</div>
      <code>{{ coreConfigErrorMessage }}</code>
    </div>
    <div v-if="networkConfigErrorMessage">
      <div>Failed to load networks-config.json:</div>
      <code>{{ networkConfigErrorMessage }}</code>
    </div>
  </template>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

//
// Config loading
//

import {computed, PropType} from "vue";
import {CoreConfig} from "@/config/CoreConfig";
import {NetworkConfig} from "@/config/NetworkConfig";
import App from "@/App.vue";

const props = defineProps({
  coreConfig: {
    type: Object as PropType<CoreConfig|Error>,
    required: true
  },
  networkConfig: {
    type: Object as PropType<NetworkConfig|Error>,
    required: true
  }
})

const coreConfigErrorMessage = computed(() => {
  let result: string|null
  if (props.coreConfig instanceof CoreConfig) {
    result = null
  } else {
    result = props.coreConfig.message
  }
  return result
})

const networkConfigErrorMessage = computed(() => {
  let result: string|null
  if (props.networkConfig instanceof NetworkConfig) {
    result = null
  } else {
    result = props.networkConfig.message
  }
  return result
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped/>
