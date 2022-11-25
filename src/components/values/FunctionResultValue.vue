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

  <div v-if="output">
    <HexaValue :byte-string="output"/>
    <table class="has-text-grey h-is-text-size-3">
      <tbody>
      <template v-for="(v,i) in outputValues" :key="v">
        <tr>
          <td>{{ outputNames[i] }}</td>
          <td style="padding-left: 10px">{{ outputTypes[i] }}</td>
          <td style="padding-left: 10px">{{ v }}</td>
        </tr>
      </template>
      </tbody>
    </table>
  </div>
  <div v-else-if="initialLoading"/>
  <div v-else>
    <div class="has-text-grey">None</div>
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, PropType, ref} from 'vue';
import {initialLoadingKey} from "@/AppKeys";
import HexaValue from "@/components/values/HexaValue.vue";
import {FunctionCallAnalyzer} from "@/utils/FunctionCallAnalyzer";

export default defineComponent({
  name: 'FunctionResultValue',
  components: {HexaValue},
  props: {
    analyzer: {
      type: Object as PropType<FunctionCallAnalyzer>,
      required: true
    }
  },

  setup(props) {

    const initialLoading = inject(initialLoadingKey, ref(false))
    return {
      output: props.analyzer.output,
      outputValues: props.analyzer.outputValues,
      outputNames: props.analyzer.outputNames,
      outputTypes: props.analyzer.outputTypes,
      initialLoading
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>