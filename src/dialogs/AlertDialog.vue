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
  <ModalDialog v-model:show-dialog="visible" :width="350">

    <template #modalDialogContent>
      <div class="alert-dialog">
        <div class="icon">
            <i class="fas fa-exclamation-triangle"></i>
        </div>
        <slot name="alertMessage"/>
      </div>
    </template>

    <template #modalDialogButtons>
      <ModalDialogButton v-model:show-dialog="visible">CLOSE</ModalDialogButton>
    </template>

  </ModalDialog>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import ModalDialog from "@/dialogs/core/ModalDialog.vue";
import ModalDialogButton from "@/dialogs/core/ModalDialogButton.vue";

const visible = defineModel("visible", {
  type: Boolean,
  required: true
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.alert-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 16px;
  justify-content: center;
  font-style: normal;
  font-weight: normal;
  font-size: 18px;
  line-height: 22px;
}

div.icon {
  height: 1.5rem;
  width: 1.5rem;
  color: rgb(255, 183, 15);
  margin-right: 0.75rem;
}

</style>
