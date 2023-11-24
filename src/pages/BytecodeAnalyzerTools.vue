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

    <section :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}" class="section">
      <DashboardCard>
        <template v-slot:title>
          <span class="h-is-primary-title">Bytecode Analyzer</span>
        </template>
        <template v-slot:content>
          <div class="mt-3 is-flex">
            <div @click="() => tabSelector(1)" class="tabSelector" :class="{'has-text-grey unchosentab': !showDisassembler}">
              Disassembler
            </div>

            <div @click="() => tabSelector(2)" class="tabSelector" :class="{'has-text-grey unchosentab': !showDecompiler}">
              Decompiler
            </div>
          </div>

          <textarea
            v-model="inputBytecode"
            rows="7"
            placeholder="Enter contract hex bytecode (0x...)"
            class="py-1 px-2 mt-5"
            style="width:100%; font-family: novamonoregular,monospace; resize: vertical; border-radius: 6px;"
          />

          <!-- @notice: utilize `is-hidden` class to maintain analyzed bytecode data between tabs -->
          <BytecodeTools :byte-code="inputBytecode" :tool-type="1" :is-custom="true" class="mt-5" :class="{'is-hidden': !showDisassembler}"/>
          <BytecodeTools :byte-code="inputBytecode" :tool-type="2" :is-custom="true" class="mt-5" :class="{'is-hidden': !showDecompiler}"/>
        </template>
      </DashboardCard>
  
    </section>
  
    <Footer/>
  
  </template>
  
  <!-- --------------------------------------------------------------------------------------------------------------- -->
  <!--                                                      SCRIPT                                                     -->
  <!-- --------------------------------------------------------------------------------------------------------------- -->
  
  <script lang="ts">
  
  import {defineComponent, inject, ref} from 'vue';
  import Footer from "@/components/Footer.vue";
  import DashboardCard from "@/components/DashboardCard.vue";
  import ByteCodeValue from '@/components/values/ByteCodeValue.vue';
  import BytecodeTools from '@/components/bytecode_tools/BytecodeTools.vue';
  
  export default defineComponent({
    name: 'BytecodeAnalyzerTools',
  
    props: {
      network: String
    },
  
    components: {
    Footer,
    DashboardCard,
    ByteCodeValue,
    BytecodeTools
},
  
    setup() {
      const isSmallScreen = inject('isSmallScreen', true)
      const isTouchDevice = inject('isTouchDevice', false)

      const inputBytecode = ref("")
      const finalBytecode = ref("")
      const showDisassembler = ref(true)
      const showDecompiler = ref(false)

      const tabSelector = (mode: 1 | 2) => {
        showDisassembler.value = mode === 1
        showDecompiler.value = mode === 2
      }
  
      return {
        isSmallScreen,
        isTouchDevice,
        inputBytecode,
        showDisassembler,
        showDecompiler,
        finalBytecode,
        tabSelector,
      }
    }
  });
  
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