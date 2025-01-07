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

  <div style="display: flex; align-items: baseline">

    <div v-if="dialogSuccessVisible" class="icon is-medium has-text-success">
      <i class="fas fa-check"/>
    </div>
    <div v-else-if="dialogErrorVisible" class="icon is-medium has-text-danger">
      <span style="font-size: 18px; font-weight: 900">X</span>
    </div>
    <div v-else/>

    <div class="main-message">
      <slot name="mainMessage"/>
    </div>
  </div>

  <div class="extra-message">
    <slot name="extraMessage"/>
  </div>

</template>


<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, PropType} from "vue";
import {DialogController, DialogMode} from "@/dialogs/core/dialog/DialogController.ts";

const props = defineProps({
  controller: {
    type: Object as PropType<DialogController>,
    required: true
  },
  isSuccess: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined
  }
})

const dialogSuccessVisible = computed(
    () => props.isSuccess !== undefined
        ? props.isSuccess
        : props.controller.mode.value === DialogMode.Success)
const dialogErrorVisible = computed(
    () => props.isSuccess !== undefined
        ? !props.isSuccess
        : props.controller.mode.value === DialogMode.Error)

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.icon.is-medium {
  align-items: center;
  display: inline-flex;
  justify-content: center;
  height: 1.5rem;
  width: 1.5rem;
}

div.icon.has-text-success {
  color: var(--text-success);
}

div.icon.has-text-danger {
  color: var(--text-danger);
}

div.main-message {
  margin-bottom: 1.5rem;
  margin-top: 0.5rem;
  font-size: 14px;
}

div.extra-message {
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 17px;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

</style>
