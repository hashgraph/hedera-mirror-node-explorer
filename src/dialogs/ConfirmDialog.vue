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

  <ModalDialog v-model:show-dialog="showDialog">

    <template #modalDialogTitle>
      <slot name="confirmTitle"/>
    </template>

    <template #modalDialogContent>
      <div>{{ props.mainMessage }}</div>
      <div v-if="props.extraMessage" class="extra-message">{{ props.extraMessage }}</div>
    </template>

    <template v-if="slots.dialogOption" #modalDialogControls>
      <slot name="dialogOption"/>
    </template>

    <template #modalDialogButtons>
      <ModalDialogButton v-model:show-dialog="showDialog" @action="handleCancel">{{ props.cancelLabel }}</ModalDialogButton>
      <ModalDialogButton v-model:show-dialog="showDialog" :is-default="true" @action="handleConfirm">{{ props.confirmLabel }}</ModalDialogButton>
    </template>

  </ModalDialog>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {PropType, useSlots} from "vue";
import ModalDialog from "@/dialogs/core/ModalDialog.vue";
import ModalDialogButton from "@/dialogs/core/ModalDialogButton.vue";

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

const handleCancel = () => {
  emit("onCancel")
}

const handleConfirm = () => {
  emit("onConfirm")
}

const slots = useSlots()

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.extra-message {
  font-size: 14px;
  font-weight: 500;
  line-height: 18px;
}

</style>

