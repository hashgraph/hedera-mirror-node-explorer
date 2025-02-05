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

  <div v-if="showDialog" class="modal-dialog">
    <div class="modal-dialog-box" :style="{'width': dialogWidth}">

      <div v-if="slots.modalDialogTitle" class="modal-dialog-header">
        <slot name="modalDialogTitle"/>
      </div>

      <div class="modal-dialog-body">
        <slot name="modalDialogContent"/>
      </div>

      <div class="modal-dialog-buttons">

        <slot name="modalDialogButtons">
          <ModalDialogButton v-model:show-dialog="showDialog">CLOSE</ModalDialogButton>
        </slot>

      </div>

    </div>
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, useSlots, watch} from "vue";
import ModalDialogButton from "@/dialogs/core/ModalDialogButton.vue";

const showDialog = defineModel("showDialog", {
  type: Boolean,
  required: true
})

const props = defineProps({
  iconClass: String,
  width: {
    type: Number,
    default: 400
  },
})

const slots = useSlots()

const emit = defineEmits(["onClose"])

watch(showDialog, () => {
  if (!showDialog.value) {
    emit("onClose")
  }
})

const dialogWidth = computed(() => {
  return props.width === 0 ? "auto" : props.width + "px"
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>


div.modal-dialog {
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
  z-index: 40;
}

div.modal-dialog-box {
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background-color: var(--background-tertiary);
  border-radius: 16px;
  row-gap: 24px;
  color: var(--text-primary);
}

div.modal-dialog-header {
  border-bottom-color: var(--network-theme-color);
  border-bottom-style: solid;
  border-bottom-width: 1px;
  font-size: 20px;
  font-weight: 500;
  line-height: 26px;
  padding-bottom: 24px;
  text-align: center;
}

div.modal-dialog-body {
  font-size: 16px;
  font-weight: 400;
  line-height: 20px;
}

div.modal-dialog-buttons {
  column-gap: 1em;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

div.modal-dialog-footer > div {
  column-gap: 1em;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

</style>

