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

  <template v-if="signature">

    <Property :custom-nb-col-class="customNbColClass" id="function">
      <template #name>Signature</template>
      <template #value>
        <SignatureValue :analyzer="analyzer"/>
      </template>
    </Property>

    <template v-if="inputs && inputs.length >= 1">

      <div class="h-sub-section">Input</div>

      <template v-for="arg in inputs" :key="arg.name">
        <Property :custom-nb-col-class="customNbColClass">
          <template #name>
            <span style="padding-left: 16px;">{{ arg.name }}</span>
          </template>
          <template #value>
            <FunctionValue :ntv="arg"/>
          </template>
        </Property>
      </template>

    </template>
    <template v-else>

      <Property :custom-nb-col-class="customNbColClass" id="functionInput">
        <template #name>Input Args</template>
        <template #value>
          <ByteCodeValue :byte-code="inputArgsOnly ?? undefined" :height-in-pixel="140"/>
          <div v-if="inputDecodingStatus" class="h-is-extra-text">
            <span class="icon fas fa-exclamation-circle has-text-grey is-small mt-1 mr-1"/>
            <span>{{ inputDecodingStatus }}</span>
          </div>
        </template>
      </Property>

    </template>

  </template>

  <template v-else>
    <Property :custom-nb-col-class="customNbColClass" id="functionInput">
      <template #name>Input - Function & Args</template>
      <template #value>
        <ByteCodeValue :byte-code="input ?? undefined" :heightInPixel="140"/>
        <div v-if="functionDecodingStatus" class="h-is-extra-text">
          <span class="icon fas fa-exclamation-circle has-text-grey is-small mt-1 mr-1"/>
          <span>{{ functionDecodingStatus }}</span>
        </div>
      </template>
    </Property>
  </template>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {PropType} from 'vue';
import {FunctionCallAnalyzer} from "@/utils/analyzer/FunctionCallAnalyzer";
import Property from "@/components/Property.vue";
import FunctionValue from "@/components/values/FunctionValue.vue";
import SignatureValue from "@/components/values/SignatureValue.vue";
import ByteCodeValue from "@/components/values/ByteCodeValue.vue";

const props = defineProps({
  analyzer: {
    type: Object as PropType<FunctionCallAnalyzer>,
    required: true
  },
  customNbColClass: String
})

const input = props.analyzer.normalizedInput
const signature = props.analyzer.signature
const inputs = props.analyzer.inputs
const functionDecodingStatus = props.analyzer.functionDecodingStatus
const inputDecodingStatus = props.analyzer.inputDecodingStatus
const inputArgsOnly = props.analyzer.inputArgsOnly

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>