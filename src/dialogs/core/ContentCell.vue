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

  <template v-if="props.direction == 'vertical'">
    <div style="display: flex; flex-direction: column; align-items: flex-start; justify-content: stretch; width: 100%;">
      <div class="cellTitle">
        <slot name="cellTitle"/>
      </div>
      <slot name="cellContent"/>
    </div>
  </template>

  <template v-else> <!-- horizontal -->
    <div style="display: flex; align-items: center; justify-content: space-between; width: 100%">
      <div class="cellTitle">
        <slot name="cellTitle"/>
      </div>
      <slot name="cellContent"/>
    </div>
  </template>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {PropType} from "vue";

const props = defineProps({
  direction: {
    type: String as PropType<"vertical" | "horizontal">,
    default: "vertical"
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.cellTitle {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 400;
}

</style>
