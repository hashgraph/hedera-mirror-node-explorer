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

<!--suppress HtmlWrongAttributeValue -->
<template>
  <div :class="{'split-bytecode-container':isMediumScreen,'bytecode-container':!isMediumScreen}">

    <div id="bytecode" class="code-pane" :class="{'split-padding': isMediumScreen}">
      <div class="property-name">Runtime Bytecode</div>
      <ByteCodeValue
          class="code-value"
          :byte-code="props.byteCode ?? undefined"
      />
    </div>

    <div id="assembly-code" class="code-pane" :class="{'split-separator': isMediumScreen}">
      <div class="assembly-header">
        <div class="property-name">Assembly Bytecode</div>
        <div class="show-hexa-opcode-checkbox">
          <input type="checkbox" v-model="showHexaOpcode" id="show-hexa-opcode" name="show-hexa-opcode"/>
          <label for="show-hexa-opcode">Show hexa opcode</label>
        </div>
      </div>

      <DisassembledCodeValue
          class="code-value"
          :byte-code="props.byteCode ?? undefined"
          :show-hexa-opcode="showHexaOpcode"
      />
    </div>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {inject, PropType} from 'vue';
import "prismjs/prism";
import "prismjs/themes/prism-tomorrow.css"
import "prismjs/prism.js";
import "prismjs/components/prism-clike.js";
import "prismjs/components/prism-solidity.js";
import ByteCodeValue from "@/components/values/ByteCodeValue.vue";
import DisassembledCodeValue from "@/components/values/DisassembledCodeValue.vue";

const props = defineProps({
  byteCode: {
    type: String as PropType<string | null>,
    default: null
  }
})

const showHexaOpcode = defineModel("showHexaOpcode", {
  type: Boolean,
  default: false
})

const isMediumScreen = inject('isMediumScreen', true)

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>


div.split-bytecode-container {
  display: flex;
  align-items: flex-start;
}

div.bytecode-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
}

div.code-pane {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

div.assembly-header {
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: 16px;
  justify-content: space-between;
  height: 16px
}

div.property-name {
  color: var(--text-secondary);
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
  height: 16px;
  text-transform: uppercase;
}

.code-value {
  background-color: var(--background-secondary);
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 400;
  max-height: 400px;
  min-height: 20px;
  overflow-y: auto;
  padding: 16px;
}

div.split-separator {
  border-left: 1px solid var(--border-secondary);
  padding-left: 32px;
}

div.split-padding {
  padding-right: 31px;
}

div.show-hexa-opcode-checkbox {
  align-items: center;
  display: flex;
  gap: 8px;
  justify-content: flex-end;

  label {
    color: var(--text-primary);
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 400;
  }
}

</style>
