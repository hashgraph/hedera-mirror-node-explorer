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

  <template v-if="signature">

    <template v-if="output">

      <div v-if="outputs.length >= 1" class="h-is-tertiary-text my-2">Output</div>

      <template v-for="result in outputs" :key="result.name">
        <Property :custom-nb-col-class="customNbColClass">
          <template v-slot:name>{{ result.name }}</template>
          <template v-slot:value>
            <FunctionValue :ntv="result"/>
          </template>
        </Property>
      </template>

    </template><template v-else-if="showNone">

        <Property :custom-nb-col-class="customNbColClass" id="functionInput">
            <template v-slot:name>Output Result</template>
            <template v-slot:value>
                <HexaValue :show-none="true"/>
            </template>
        </Property>

    </template>

  </template><template v-else>

    <Property :custom-nb-col-class="customNbColClass" id="functionOutput">
        <template v-slot:name>Output Result</template>
        <template v-slot:value>
          <HexaValue :byte-string="output" :show-none="true"/>
          <div v-if="outputDecodingStatus" class="h-is-extra-text h-is-text-size-3">
            <span class="icon fas fa-exclamation-circle has-text-grey is-small mt-1 mr-1"/>
            <span>{{ outputDecodingStatus }}</span>
          </div>
        </template>
    </Property>

  </template>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, PropType, ref} from 'vue';
import {initialLoadingKey} from "@/AppKeys";
import HexaValue from "@/components/values/HexaValue.vue";
import {FunctionCallAnalyzer} from "@/utils/analyzer/FunctionCallAnalyzer";
import Property from "@/components/Property.vue";
import FunctionValue from "@/components/values/FunctionValue.vue";

export default defineComponent({
  name: 'FunctionResult',
  components: {FunctionValue, Property, HexaValue},
  props: {
    analyzer: {
      type: Object as PropType<FunctionCallAnalyzer>,
      required: true
    },
    customNbColClass: String,
    showNone: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {

    const initialLoading = inject(initialLoadingKey, ref(false))
    return {
      output: props.analyzer.normalizedOutput,
      signature: props.analyzer.signature,
      outputs: props.analyzer.outputs,
      outputDecodingStatus: props.analyzer.outputDecodingStatus,
      initialLoading
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>