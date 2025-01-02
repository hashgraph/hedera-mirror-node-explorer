<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>
  <button class="dialog-button"
          @click="handleClick"
          :class="{'is-default': props.isDefault}"
          :disabled="!buttonEnabled">
    <slot/>
  </button>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                     TEMPLATE                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, PropType} from "vue";
import {DialogController, DialogMode} from "@/dialogs/core/dialog/DialogController.ts";


const props = defineProps({
  controller: {
    type: Object as PropType<DialogController>,
    required: true
  },
  autoClose: {
    type: Boolean,
    default: true
  },
  enabled: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(["action"])

const handleClick = () => {
  emit("action")
  if (props.autoClose) {
    props.controller.visible.value = false
  }
}

const buttonEnabled = computed(
    () => props.enabled && props.controller.mode.value !== DialogMode.Busy)

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

button.dialog-button {
  appearance: none;
  color: var(--button-text-secondary);
  background-color: var(--button-background-secondary);
  border-radius: 32px;
  height: 48px;
  padding: 15px 24px 15px 24px;
  font-size: 14px;
  font-weight: 500;
}

button.dialog-button:disabled {
  cursor: not-allowed;
}

button.dialog-button.is-default {
  color: var(--button-text-primary);
  background-color: var(--button-background-primary);
  cursor: not-allowed;
}

</style>
