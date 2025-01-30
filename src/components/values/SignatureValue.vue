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
  <div v-if="functionHash">
    <HexaDumpValue :byte-string="functionHash" show-none/>
    <div class="signature">
      <div class="h-is-extra-text should-wrap">{{ signature }}</div>
      <Tooltip v-if="is4byteSignature"
               text="Decoding of the signature provided by the 4byte.directory Signature Database">
        <span class="h-has-pill" style="background-color: var(--status-success-color)">4byte</span>
      </Tooltip>
    </div>
  </div>
  <div v-else-if="initialLoading"/>
  <div v-else class="has-text-grey">None</div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {inject, PropType, ref} from "vue";
import {initialLoadingKey} from "@/AppKeys";
import HexaDumpValue from "@/components/values/HexaDumpValue.vue";
import {FunctionCallAnalyzer} from "@/utils/analyzer/FunctionCallAnalyzer";
import Tooltip from "@/components/Tooltip.vue";

const props = defineProps({
  analyzer: {
    type: Object as PropType<FunctionCallAnalyzer>,
    required: true
  }
})

const initialLoading = inject(initialLoadingKey, ref(false))

const functionHash = props.analyzer.functionHash
const signature = props.analyzer.signature
const is4byteSignature = props.analyzer.is4byteSignature

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.signature {
  align-items: center;
  display: flex;
  gap: 4px
}

</style>
