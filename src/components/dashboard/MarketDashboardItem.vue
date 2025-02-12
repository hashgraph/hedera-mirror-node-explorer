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

  <div class="item-root">

    <slot/>

    <div class="item-content">
      <div class="item-l1">
        {{ props.title }}
      </div>

      <div v-if="props.value !== null" class="item-l2">
        <span class="item-value">{{ props.value }}</span>
        <span v-if="props.variation" class="item-variation">({{ props.variation }}%)</span>
      </div>
      <div v-else class="none-value">None</div>
    </div>

  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

const props = defineProps({
  title: String,
  value: String,
  variation: String,
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.item-root {
  align-items: center;
  display: flex;
  gap: 16px;
}

div.item-content {
  display: flex;
  flex-direction: column;
}

div.item-l1 {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  height: 16px;
}

div.item-l2 {
  align-items: baseline;
  display: flex;
  gap: 4px;
}

.item-value {
  color: var(--text-primary);
  font-family: 'Styrene A Web', sans-serif;
  font-size: 20px;
  font-weight: 500;
  line-height: 26px;
}

.item-variation {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 400;
  line-height: 18px;
}

.none-value {
  color: hsl(0, 0%, 48%) !important;
}

</style>
