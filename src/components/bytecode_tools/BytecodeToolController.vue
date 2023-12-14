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
    <div class="is-flex is-justify-content-space-between is-align-items-center">
      <div id="tabChooser" class="mt-3 is-flex">
        <div id="disassemblerButton" class="tabSelector"  :class="{'has-text-grey unchosentab': !showDisassembler}">
          Disassembler
        </div>
      </div>

      <div v-if="!isCustom" class="mt-1">
        <button id="disassembler-button"
                class="button is-white is-small has-text-right"
                @click="closeAnalyzer">
                X
          </button>
      </div>
    </div>

    <textarea
        v-if="isCustom"
        id="inputBytecodeBox"
        v-model="inputBytecode"
        rows="7"
        placeholder="Enter contract hex bytecode (0x...)"
        class="py-1 px-2 mt-5"
        style="width:100%; font-family: novamonoregular,monospace; resize: vertical; border-radius: 6px;"
    />

    <!-- @notice: utilize `is-hidden` class to maintain analyzed bytecode data between tabs -->
    <BytecodeTools :byte-code="isCustom ? inputBytecode : (propByteCode || '')" :is-custom="isCustom" :tool-type="1" class="mt-5" :class="{'is-hidden': !showDisassembler}"/>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">
import { defineComponent, inject, ref, watch } from 'vue';
import BytecodeTools from '@/components/bytecode_tools/BytecodeTools.vue';


export default defineComponent({
    name: 'BytecodeToolController',
    props: {
      isCustom: {
        type: Boolean,
        default: true
      },
      byteCode: {
        type: String,
        required: false,
      },
    },
    components: {
      BytecodeTools,
    },

    emits: ["turnOffAnalyzer"],

    setup(props, context) {
      const isSmallScreen = inject('isSmallScreen', true)
      const isTouchDevice = inject('isTouchDevice', false)

      const inputBytecode = ref("")
      const showDisassembler = ref(true)
      const showDecompiler = ref(false)

      const propByteCode = ref(props.byteCode)
      watch(() => props.byteCode, () => {
        propByteCode.value = props.byteCode
      })

      const closeAnalyzer = () => {
        context.emit('turnOffAnalyzer', true)
      }
  
      return {
        isSmallScreen,
        isTouchDevice,
        inputBytecode,
        showDisassembler,
        showDecompiler,
        propByteCode,
        closeAnalyzer
      }
    }
})
    
</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>
.tabSelector {
    font-size: 1.1rem;
    width: 140px; 
    border-bottom: 0.5px solid white; 
    cursor: pointer;
    font-weight: 500;
    display: flex;
    justify-content:center;
    padding-bottom: 0.3rem;
  }

  .unchosentab {
    border-bottom: 0.5px solid grey; 
  }
</style>
