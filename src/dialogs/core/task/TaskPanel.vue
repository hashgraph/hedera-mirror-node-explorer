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
  <div class="task-panel">

    <template v-if="props.mode === TaskPanelMode.success">
      <CircleCheck :size="48" style="color: var(--text-success)"/>
    </template>
    <template v-else-if="props.mode === TaskPanelMode.error">
      <TriangleAlert :size="48" style="color: var(--text-error)"/>
    </template>
    <template v-else-if="props.mode === TaskPanelMode.busy">
      <SpinnerView :size="48"/>
    </template>

    <div class="task-panel-message">
      <slot name="taskPanelMessage"/>
    </div>
    <div v-if="slots.taskPanelExtra1" class="task-panel-extra">
      <slot name="taskPanelExtra1"/>
    </div>
    <div v-if="slots.taskPanelExtra2" class="task-panel-extra">
      <slot name="taskPanelExtra2"/>
    </div>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {PropType, useSlots} from "vue";
import {CircleCheck} from 'lucide-vue-next';
import {TriangleAlert} from 'lucide-vue-next';
import {TaskPanelMode} from "@/dialogs/core/DialogUtils.ts";
import SpinnerView from "@/elements/SpinnerView.vue";

const props = defineProps({
  mode: {
    type: String as PropType<TaskPanelMode>,
    default: TaskPanelMode.busy
  }
})

const slots = useSlots()

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.task-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 24px;
  width: 100%;
}

div.task-panel-message {
  align-items: center;
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  font-family: "Styrene A Web", sans-serif;
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
  row-gap: 8px;
  text-align: center;
}

div.task-panel-extra {
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 4px;
  font-size: 14px;
  font-weight: 400;
  font-family: "Inter", sans-serif;
  color: var(--text-secondary)
}

</style>
