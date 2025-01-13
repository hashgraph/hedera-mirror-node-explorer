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

  <div>
    <Tooltip :text="props.tooltipLabel">
      <div class="item-root">
        <div class="item-l1">
          {{ title }}
          <InfoTooltip v-if="props.infoLabel" :label="props.infoLabel"/>
        </div>

        <div v-if="props.value !== null" class="item-l2">
          <span class="item-value">{{ props.value }}</span>
          <span class="item-unit">{{ props.unit }}</span>
        </div>
        <div v-else class="none-value">None</div>

        <div v-if="props.extra" class=" item-l3">
          {{ props.extra }}
        </div>
      </div>
    </Tooltip>
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, PropType} from 'vue';
import InfoTooltip from "@/components/InfoTooltip.vue";
import Tooltip from "@/components/Tooltip.vue";

const props = defineProps({
  title: String,
  value: String as PropType<string | null>,
  unit: String,
  tooltipLabel: {
    type: String as PropType<string | null>,
    default: null
  },
  infoLabel: {
    type: String as PropType<string | null>,
    default: null
  },
  extra: {
    type: String as PropType<string | null>,
    default: null
  },
})

const title = computed(() => props.title?.toUpperCase())

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.item-root {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

div.item-l1 {
  color: var(--text-secondary);
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
  height: 16px;
}

div.item-l2 {
  align-items: baseline;
  display: flex;
  gap: 4px;
  padding-bottom: 5px;
}

.item-value {
  color: var(--text-primary);
  font-family: 'Styrene A Web', sans-serif;
  font-size: 20px;
  font-weight: 500;
  height: 26px;
}

.item-unit {
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  font-weight: 400;
  height: 13px;
}

.none-value {
  color: hsl(0, 0%, 48%) !important;
}

div.item-l3 {
  color: var(--text-accent);
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 400;
  height: 16px;
}

</style>
