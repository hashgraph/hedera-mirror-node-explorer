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
          <BytecodeToolController :is-custom="true"/>
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
  import BytecodeToolController from '@/components/bytecode_tools/BytecodeToolController.vue'
  
  export default defineComponent({
    name: 'BytecodeAnalyzerTools',
  
    props: {},
  
    components: {
      Footer,
      DashboardCard,
      ByteCodeValue,
      BytecodeTools,
      BytecodeToolController
    },
  
    setup() {
      const isSmallScreen = inject('isSmallScreen', true)
      const isTouchDevice = inject('isTouchDevice', false)
  
      return {
        isSmallScreen,
        isTouchDevice,
      }
    }
  });
  
  </script>
  
  <!-- --------------------------------------------------------------------------------------------------------------- -->
  <!--                                                       STYLE                                                     -->
  <!-- --------------------------------------------------------------------------------------------------------------- -->
  
  <style></style>
  