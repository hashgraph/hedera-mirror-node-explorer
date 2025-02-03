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
  <div class="group-box">
    <div v-if="slots.groupBoxTitle" class="group-box-title">
      <slot name="groupBoxTitle"/>
    </div>
    <slot/>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {useSlots} from "vue";

const slots = useSlots()

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.group-box {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  border-radius: 16px;
  border-width: 1px;
  border-color: var(--table-border);
  border-style: solid;
  padding: 16px;
  row-gap: 8px;
  background-color: var(--background-primary);
  color: var(--text-primary);
}

div.group-box-title {
  display: flex;
  align-items: center;
  column-gap: 8px;
  color: var(--text-secondary);
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 12px;
}

</style>
