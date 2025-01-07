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

    <template v-slot:dialogInput>
      <div>
        <span class="icon">
            <i class="fas fa-exclamation-triangle"></i>
        </span>
        <slot name="alertMessage"/>
      </div>
    </template>

    <template v-slot:dialogInputButtons>
      <DialogButton :controller="controller">CLOSE</DialogButton>
    </template>

  </Dialog>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import Dialog from "@/dialogs/core/dialog/Dialog.vue";
import DialogButton from "@/dialogs/core/dialog/DialogButton.vue";
import {DialogController} from "@/dialogs/core/dialog/DialogController.ts";

const visible = defineModel("visible", {
  type: Boolean,
  required: true
})

const controller = new DialogController(visible)

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div {
  display: flex;
  justify-content: center;
  font-style: normal;
  font-weight: normal;
  font-size: 18px;
  line-height: 22px;
}

span.icon {
  height: 1.5rem;
  width: 1.5rem;
  color: rgb(255, 183, 15);
  margin-right: 0.75rem;
}

</style>
