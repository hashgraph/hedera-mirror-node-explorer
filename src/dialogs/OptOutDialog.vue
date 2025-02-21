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

    <template #modalDialogTitle>Disclaimer</template>

    <template #modalDialogContent>
      <div class="opt-out-dialog-content">
        <div v-html="disclaimer"/>
        <label>
          <input v-model="dontShowNextTime" type="checkbox" style="margin-right: 0.5em; vertical-align: text-top" />
          <span>Please don't show me this next time</span>
        </label>
      </div>
    </template>

    <template #modalDialogButtons>
      <ModalDialogButton v-model:show-dialog="showDialog">CANCEL</ModalDialogButton>
      <ModalDialogButton v-model:show-dialog="showDialog" @action="handleAgree">AGREE</ModalDialogButton>
    </template>

  </ModalDialog>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {ref} from "vue";
import ModalDialog from "@/dialogs/core/ModalDialog.vue";
import {AppStorage} from "@/AppStorage.ts";
import {CoreConfig} from "@/config/CoreConfig.ts";
import ModalDialogButton from "@/dialogs/core/ModalDialogButton.vue";


const showDialog = defineModel("showDialog", {
  type: Boolean,
  required: true
})

const disclaimer = CoreConfig.inject().walletChooserDisclaimerPopup ?? ""

const emit = defineEmits(["onAgree"])

const dontShowNextTime = ref(false)
const handleAgree = () => {
  if (dontShowNextTime.value) {
    AppStorage.setSkipDisclaimer(true)
  }
  emit('onAgree')
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

.opt-out-dialog-content {
  display: flex;
  flex-direction: column;
  row-gap: 24px;
}

</style>

