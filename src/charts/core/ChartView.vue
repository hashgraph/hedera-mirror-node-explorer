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
  <div class="chart-view">
    <div class="chart-view-header">
      <div>{{ controller.chartTitle }}</div>
      <RangeSelectView :controller="props.controller"/>
    </div>
    <div class="chart-view-container" :style="{height: props.height + 'px'}">

      <template v-if="state === ChartState.loading">
        <div class="building">Loading data</div>
      </template>

      <template v-else-if="state === ChartState.error">
        <TaskPanel :mode="TaskPanelMode.error">
          <template #taskPanelMessage>Chart data are not available</template>
          <template v-if="errorExtra" #taskPanelExtra1>{{ errorExtra }}</template>
        </TaskPanel>
      </template>

      <canvas ref="canvasRef" :style="{ display: canvasDisplay}"/>

    </div>

  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, PropType} from "vue";
import {ChartController, ChartState} from "@/charts/core/ChartController.ts";
import TaskPanel from "@/dialogs/core/task/TaskPanel.vue";
import {TaskPanelMode} from "@/dialogs/core/DialogUtils.ts";
import RangeSelectView from "@/charts/core/RangeSelectView.vue";

const props = defineProps({
  controller: {
    type: Object as PropType<ChartController>,
    required: true
  },
  height: {
    type: Number,
    default: 300
  }
})

const canvasRef = props.controller.canvas
const canvasDisplay = computed(() => props.controller.state.value === ChartState.ok ? "block": "none")
const state = props.controller.state
const errorExtra = props.controller.errorExtra.value

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.chart-view {
  display: flex;
  flex-direction: column;
  row-gap: 32px;
}

div.chart-view-header {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 400;
  color: var(--text-secondary)
}

div.chart-view-container {
  display: flex;
  position: relative; /* Required by chartjs */
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  width: 100%;
}

div.building {
  text-align: center;
  color: var(--text-secondary)
}

</style>
