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
  <select
      v-model="selected"
      :style="{ 'width': width }"
      :class="{'border-visible': props.borderVisible}"
  >
    <slot/>
  </select>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {PropType} from "vue";

const props = defineProps({
  borderVisible: {
    type: Boolean,
    default: true
  },
  width: {
    type: String,
    default: "auto"
  }
})
const selected = defineModel({
  type: String as PropType<string|null>,
  default: null
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

select {
  appearance: none;
  border-width: 0;
  color: var(--text-primary);
  background-color: transparent;
  font-weight: 400;
  font-size: 14px;
  height: 40px;
  outline: none;
  padding: 0 24px 0 8px;
  background-image: url("@/assets/chevron-down.svg");
  background-repeat: no-repeat;
  background-position: calc(100% - 6px);
}

select.border-visible {
  border-color: var(--text-secondary);
  border-width: 1px;
  border-style: solid;
  border-radius: 2px;
}

</style>
