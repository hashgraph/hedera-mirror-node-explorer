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
  <div
      v-if="props.sourceFiles.length > 0"
      id="h-code-source"
      class="h-code-box"
  >
    <template v-for="(file, index) in props.sourceFiles" :key="file.path">
      <template v-if="isFiltered(file)">
        <div class="source-filename">
          {{ file.name }}
        </div>
        <SolidityCode class="h-code-source">
          {{ file.content }}
        </SolidityCode>
      </template>
      <hr v-if="props.filter === '' && index < props.sourceFiles.length - 1"
          class="horizontal-line"
      />
    </template>
  </div>

  <span v-else-if="initialLoading"/>

  <span v-else class="h-is-low-contrast">None</span>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {inject, PropType, ref} from 'vue';
import {initialLoadingKey} from "@/AppKeys";
import {SourcifyResponseItem} from "@/utils/cache/SourcifyCache";
import "prismjs/prism";
import "prismjs/themes/prism-tomorrow.css"
import "prismjs/prism.js";
import "prismjs/components/prism-clike.js";
import "prismjs/components/prism-solidity.js";
import SolidityCode from "@/components/SolidityCode.vue";

const props = defineProps({
  sourceFiles: {
    type: Object as PropType<SourcifyResponseItem[]>,
    default: [] as SourcifyResponseItem[] /* to please eslint */
  },
  filter: {
    type: String,
    default: ''
  }
})

const initialLoading = inject(initialLoadingKey, ref(false))
const isFiltered = (file: SourcifyResponseItem) => props.filter == '' || props.filter == file.name

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.source-filename {
  color: var(--network-text-accent-color);
}

hr.horizontal-line {
  height: 2px;
  margin: 16px 0;
}

</style>
