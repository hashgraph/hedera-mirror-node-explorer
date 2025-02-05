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
  <ModalDialog :icon-class="props.iconClass" v-model:show-dialog="props.showDialog" :show-close-icon="false">
    <template #modalDialogTitle>
      <span>Accept Cookies</span>
    </template>
    <template #modalDialogContent>
      <div v-html="cookiesDialogContent"/>
    </template>
    <template #modalDialogButtons>
      <ModalDialogButton v-model:show-dialog="props.showDialog" @action="handleChooseReject">REJECT</ModalDialogButton>
      <ModalDialogButton v-model:show-dialog="props.showDialog" :is-default="true" @action="handleChooseAccept">ACCEPT</ModalDialogButton>
    </template>
  </ModalDialog>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import ModalDialog from "@/dialogs/core/ModalDialog.vue";
import {CoreConfig} from "@/config/CoreConfig.ts";
import ModalDialogButton from "@/dialogs/core/ModalDialogButton.vue";

const props = defineProps({
  showDialog: {
    type: Boolean,
    default: false
  },
  iconClass: String
})

const emit = defineEmits(["update:showDialog", "onChooseAccept", "onChooseReject"],)

const coreConfig = CoreConfig.inject()
const cookiesDialogContent = coreConfig.cookiesDialogContent

const handleChooseAccept = () => {
  emit('update:showDialog', false)
  emit('onChooseAccept')
}
const handleChooseReject = () => {
  emit('update:showDialog', false)
  emit('onChooseReject')
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>
</style>

