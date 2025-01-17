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
  <ModalDialog v-model:show-dialog="props.controller.showDialog.value" :width="props.width">

    <template #modalDialogTitle>
      <slot name="taskDialogTitle"/>
    </template>

    <template #modalDialogContent>

      <div class="dialog-stack">

        <div class="dialog-layer-input" :style="{'visibility': inputVisibility}">
          <slot name="taskDialogInput"/>
        </div>
        <div class="dialog-layer-busy" :style="{'visibility': busyVisibility}">
          <slot name="taskDialogBusy">Task is on-going…</slot>
        </div>
        <div  class="dialog-layer-success" :style="{'visibility': successVisibility}">
          <slot name="taskDialogSuccess">Task did succeed</slot>
        </div>
        <div  class="dialog-layer-error" :style="{'visibility': errorVisibility}">
          <slot name="taskDialogError">Task did fail</slot>
        </div>
      </div>

    </template>

    <template #modalDialogControls>
      <div class="dialog-layer-controls" :style="{'visibility': inputVisibility}">
        <slot name="taskDialogControls"/>
      </div>
    </template>

    <template #modalDialogButtons>

      <template v-if="state == TaskDialogState.Input || state == TaskDialogState.Busy">

        <ModalDialogButton
            v-model:show-dialog="props.controller.showDialog.value"
            :enabled="cancelButtonEnabled">
          CANCEL</ModalDialogButton>

        <ModalDialogButton
            v-model:show-dialog="props.controller.showDialog.value"
            :enabled="executeButtonEnabled"
            :auto-close="false"
            :is-default="true"
            @action="handleExecute">
          <slot name="taskExecuteLabel">EXECUTE</slot>
        </ModalDialogButton>

      </template>

      <template v-else>

        <ModalDialogButton
            v-model:show-dialog="props.controller.showDialog.value">CLOSE</ModalDialogButton>

      </template>

    </template>

  </ModalDialog>

  <!-- Confirmation dialog -->

  <ModalDialog v-if="confirmationRequired"
               v-model:show-dialog="showConfirmDialog"
               :width="300"
  >
    <template #modalDialogContent>
      <slot name="taskDialogConfirm"/>
    </template>
    <template #modalDialogButtons>
      <ModalDialogButton v-model:show-dialog="showConfirmDialog">CANCEL</ModalDialogButton>
      <ModalDialogButton v-model:show-dialog="showConfirmDialog" @action="handleConfirmExecute">CONFIRM</ModalDialogButton>
    </template>
  </ModalDialog>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, PropType, ref, useSlots, watch} from "vue";
import ModalDialog from "@/dialogs/core/ModalDialog.vue";
import {TaskController} from "@/dialogs/core/task/TaskController.ts";
import ModalDialogButton from "@/dialogs/core/ModalDialogButton.vue";

const props = defineProps({
  controller: {
    type: Object as PropType<TaskController>,
    required: true
  },
  width: {
    type: Number,
    default: 768
  },
})

enum TaskDialogState {
  Input,
  Busy,
  Error,
  Success
}

const state = ref<TaskDialogState>(TaskDialogState.Input)
watch(props.controller.showDialog, (show) => {
  if (!show) {
    changeState(TaskDialogState.Input)
  }
})

const emit = defineEmits(["taskDialogDidSucceed"])

const handleExecute = async () => {

  if (confirmationRequired) {
    showConfirmDialog.value = true
  } else {
    await handleConfirmExecute()
  }

}

const handleConfirmExecute = async () => {
  changeState(TaskDialogState.Busy)
  try {
    await props.controller.execute()
    changeState(TaskDialogState.Success)
  } catch(error) {
    changeState(TaskDialogState.Error)
  }
}

const confirmationRequired = "taskDialogConfirm" in useSlots()

const cancelButtonEnabled = computed(
    () => state.value == TaskDialogState.Input)

const executeButtonEnabled = computed(
    () => state.value == TaskDialogState.Input && props.controller.canBeExecuted())

const inputVisibility = computed(() => state.value == TaskDialogState.Input ? "visible" : "hidden")

const busyVisibility = computed(() => state.value == TaskDialogState.Busy ? "visible" : "hidden")

const successVisibility = computed(() => state.value == TaskDialogState.Success ? "visible" : "hidden")

const errorVisibility = computed(() => state.value == TaskDialogState.Error ? "visible" : "hidden")

const changeState = (newValue: TaskDialogState) => {
  state.value = newValue
  if (newValue === TaskDialogState.Success) {
    emit("taskDialogDidSucceed")
  }
}

const showConfirmDialog = ref(false)

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.dialog-stack {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  justify-items: stretch;
  place-items: stretch;
}

div.dialog-stack div {
  grid-column-start: 1;
  grid-row-start: 1
}

div.dialog-layer-input {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  row-gap: 16px;
}

div.dialog-layer-busy {
  display: flex;
  flex-direction: column;
  align-items: center;
}

div.dialog-layer-success {
  display: flex;
  flex-direction: column;
  align-items: center;
}

div.dialog-layer-error {
  display: flex;
  flex-direction: column;
  align-items: center;
}

</style>
