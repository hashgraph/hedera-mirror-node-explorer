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
  <Dialog :controller="props.controller">

    <template v-slot:dialogInput>
      <div class="is-flex is-justify-content-center h-is-tertiary-text">
            <span class="icon has-text-warning h-is-secondary-title mr-3">
                <i class="fas fa-exclamation-triangle"></i>
            </span>
        <slot name="alertMessage"/>
      </div>
    </template>

    <template v-slot:dialogInputButtons>
      <DialogButton :controller="props.controller">CLOSE</DialogButton>
    </template>

  </Dialog>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {PropType} from "vue";
import Dialog from "@/dialogs/core/Dialog.vue";
import DialogButton from "@/dialogs/core/DialogButton.vue";
import {DialogController} from "@/dialogs/core/DialogController";

const props = defineProps({
  controller: {
    type: Object as PropType<DialogController>,
    required: true
  },
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped/>
