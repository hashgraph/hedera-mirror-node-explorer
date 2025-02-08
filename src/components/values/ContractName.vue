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
  <template v-if="contractId != null">

    <template v-if="fullMatch || partialMatch">
      <div class="h-has-pill h-status-success" >
        <CheckCheck v-if="fullMatch" :size="12" style="margin-top: 2px"/>
        <Check v-else :size="12" style="margin-top: 2px"/>
        <span class="contract-name">{{ name }}</span>
      </div>
    </template>

    <template v-else>
      <div class="h-has-pill h-chip-default">
        NOT VERIFIED
      </div>
    </template>

  </template>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, onBeforeUnmount, onMounted} from "vue";
import {ContractAnalyzer, GlobalState} from "@/utils/analyzer/ContractAnalyzer";
import {Check, CheckCheck} from 'lucide-vue-next';

const props = defineProps({
  contractId: {
    type: String,
    required: true
  }
})

const contractAnalyzer = new ContractAnalyzer(computed(() => props.contractId ?? null))
onMounted(() => contractAnalyzer.mount())
onBeforeUnmount(() => contractAnalyzer.unmount())

const name = computed(() => contractAnalyzer.contractName.value)
const partialMatch = computed(() => contractAnalyzer.globalState.value === GlobalState.PartialMatch)
const fullMatch = computed(() => contractAnalyzer.globalState.value === GlobalState.FullMatch)

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

span.contract-name {
  vertical-align: top;
  margin-left: 4px;
}

</style>

