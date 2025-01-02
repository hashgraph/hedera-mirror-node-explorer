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
  <template v-if="controller.visible.value">
    <div class="dialog-modal">
      <div class="dialog-content" :style="{'width': props.width+'px'}">

        <slot name="dialogTitle"/>

        <div class="dialog-stack">
          <div class="dialog-layer dialog-layer-input" :class="{'is-invisible': !dialogInputVisible}">
            <slot name="dialogInput"/>
          </div>
          <div class="dialog-layer dialog-layer-busy" :class="{'is-invisible': !dialogBusyVisible}">
            <slot name="dialogBusy">Task is on-going…</slot>
          </div>
          <div  class="dialog-layer dialog-layer-success" :class="{'is-invisible': !dialogSuccessVisible}">
            <slot name="dialogSuccess">Task did succeed</slot>
          </div>
          <div  class="dialog-layer dialog-layer-error" :class="{'is-invisible': !dialogErrorVisible}">
            <slot name="dialogError">Task did fail</slot>
          </div>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; column-gap: 1em;">
          <div style="color: var(--network-theme-color)">
            <slot name="dialogFeedback"/>
          </div>
          <div style="display: flex; justify-content: space-between; column-gap: 1em;">
            <div style="display: flex; justify-content: flex-start; column-gap: 1em;">
              <template v-if="dialogInputVisible || dialogBusyVisible">
                <slot name="dialogInputControls"/>
              </template>
            </div>
            <div style="display: flex; justify-content: flex-end; column-gap: 1em;">
              <template v-if="dialogInputVisible || dialogBusyVisible">
                <slot name="dialogInputButtons">
                  <DialogButton :controller="props.controller">Close</DialogButton>
                </slot>
              </template>
              <template v-else-if="dialogSuccessVisible">
                <slot name="dialogSuccessButtons">
                  <DialogButton :controller="props.controller">Close</DialogButton>
                </slot>
              </template>
              <template v-else-if="dialogErrorVisible">
                <slot name="dialogErrorButtons">
                  <DialogButton :controller="props.controller">Close</DialogButton>
                </slot>
              </template>
            </div>
          </div>
        </div>

      </div>
    </div>
  </template>
</template>


<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, PropType, watch} from "vue";
import DialogButton from "@/dialogs/core/DialogButton.vue";
import {DialogController, DialogMode} from "@/dialogs/core/DialogController.ts";

const props = defineProps({
      controller: {
        type: Object as PropType<DialogController>,
        required: true
      },
      width: {
        type: Number,
        default: 768
      },
    })

const dialogInputVisible = computed(() => props.controller.mode.value === DialogMode.Input)
const dialogBusyVisible = computed(() => props.controller.mode.value === DialogMode.Busy)
const dialogSuccessVisible = computed(() => props.controller.mode.value === DialogMode.Success)
const dialogErrorVisible = computed(() => props.controller.mode.value === DialogMode.Error)

watch(props.controller.visible, () => {
  if (props.controller.visible.value) {
    props.controller.mode.value = DialogMode.Input
  }
})


</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.dialog-modal {
  align-items: center;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(2px);
  bottom: 0;
  display: flex;
  justify-content: center;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
}

div.dialog-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background-color: var(--background-tertiary);
  border-radius: 16px;
  row-gap: 24px;
}

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


div.dialog-layer.is-invisible {
  visibility: hidden;
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

