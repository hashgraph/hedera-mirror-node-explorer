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

  <Dialog :controller="controller">

    <template #dialogTitle>
      <DialogTitle>
        <slot name="confirmTitle"/>
      </DialogTitle>
    </template>

    <template #dialogInput>

      <div v-if="props.mainMessage" class="block h-is-tertiary-text mt-2">{{ props.mainMessage }}</div>
      <div v-else class="block h-is-property-text" style="visibility: hidden">Filler</div>
      <div v-if="props.extraMessage" class="my-4" style="line-height: 21px">
        <span v-if="props.extraMessage" class="h-is-property-text">{{ props.extraMessage }}</span>
        <span v-else class="h-is-property-text" style="visibility: hidden">Filler</span>
      </div>


      <div v-if="slots.dialogOption">
        <slot name="dialogOption"/>
      </div>

    </template>

    <template #dialogInputButtons>
      <DialogButton :controller="controller" @action="handleCancel">{{ props.cancelLabel }}</DialogButton>
      <DialogButton :controller="controller" @action="handleConfirm">{{ props.confirmLabel }}</DialogButton>
    </template>

  </Dialog>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {PropType, useSlots} from "vue";
import {DialogController} from "@/dialogs/core/dialog/DialogController.ts";
import Dialog from "@/dialogs/core/dialog/Dialog.vue";
import DialogButton from "@/dialogs/core/dialog/DialogButton.vue";
import DialogTitle from "@/dialogs/core/dialog/DialogTitle.vue";

const showDialog = defineModel("showDialog", {
  type: Boolean,
  required: true
})

const props = defineProps({
  mainMessage: {
    type: String as PropType<string | null>,
    default: null
  },
  extraMessage: {
    type: String as PropType<string | null>,
    default: null
  },
  confirmLabel: {
    type: String as PropType<string>,
    default: "CONFIRM"
  },
  cancelLabel: {
    type: String as PropType<string>,
    default: "CANCEL"
  },
})

const emit = defineEmits(["onCancel", "onConfirm"])

const controller = new DialogController(showDialog)

const slots = useSlots()

const handleCancel = () => {
  emit("onCancel")
}

const handleConfirm = () => {
  emit("onConfirm")
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>

