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
  <div v-if="sourceFiles.length > 0" id="source-code"
       class="mt-2 h-code-box h-has-page-background" style="max-height: 400px;">
    <template v-for="(file, index) in sourceFiles" :key="file.path">
      <p v-if="isFiltered(file)" class="pt-2 mx-3 h-is-extra-text">{{ file.name }}</p>
      <SolidityCode v-if="isFiltered(file)" style="background-color: #171920; font-size: 0.7rem">{{file.content}}</SolidityCode>
      <hr v-if="filter==='' && index < sourceFiles.length - 1" class="has-background-grey-dark m-0"
          style="height: 0.5px"/>
    </template>
  </div>

  <span v-else-if="initialLoading"/>

  <span v-else class="has-text-grey">None</span>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, PropType, ref} from 'vue';
import {initialLoadingKey} from "@/AppKeys";
import {SourcifyResponseItem} from "@/utils/cache/SourcifyCache";
import "prismjs/prism";
import "prismjs/themes/prism-tomorrow.css"
import "prismjs/prism.js";
import "prismjs/components/prism-clike.js";
import "prismjs/components/prism-solidity.js";
import SolidityCode from "@/components/SolidityCode.vue";

export default defineComponent({
  name: 'SourceCodeValue',
  components: {SolidityCode},

  props: {
    sourceFiles: {
      type: Object as PropType<SourcifyResponseItem[]>,
      default: [] as SourcifyResponseItem[] /* to please eslint */
    },
    filter: {
      type: String,
      default: ''
    }
  },

  setup(props) {
    const initialLoading = inject(initialLoadingKey, ref(false))
    const isFiltered = (file: SourcifyResponseItem) => props.filter == '' || props.filter == file.name
    return {
      initialLoading,
      isFiltered,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
