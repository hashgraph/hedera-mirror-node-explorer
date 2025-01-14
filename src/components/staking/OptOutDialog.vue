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
  <ModalDialog :icon-class="props.iconClass" :show-dialog="showDialog">
    <template v-slot:dialogMessage>
      <slot name="dialogMessage"/>
    </template>
    <template v-slot:dialogDetails>
      <slot name="dialogDetails"/>

      <div class="is-flex is-justify-content-space-between is-align-items-baseline mt-4">
        <div class="is-flex is-justify-content-start is-align-items-center mt-3 has-text-grey-light">
          <label class="checkbox mr-2 mt-1">
            <input v-model="dontShowNextTime" type="checkbox">
          </label>
          <span>Please don't show me this next time</span>
        </div>

        <div class="is-flex is-justify-content-flex-end">
          <button class="button is-white is-small" @click="handleCancel">CANCEL</button>
          <button class="button is-info is-small ml-4" @click="handleAgree">AGREE</button>
        </div>
      </div>

    </template>
  </ModalDialog>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {ref} from "vue";
import ModalDialog from "@/components/ModalDialog.vue";
import {AppStorage} from "@/AppStorage";


const showDialog = defineModel("showDialog", {
  type: Boolean,
  required: true
})

const props = defineProps({
  iconClass: String
})

const emit = defineEmits(["onAgree", "onClose"])

const dontShowNextTime = ref(false)
const handleAgree = () => {
  if (dontShowNextTime.value) {
    AppStorage.setSkipDisclaimer(true)
  }
  showDialog.value = false
  emit('onAgree')
}
const handleCancel = () => {
  dontShowNextTime.value = false
  showDialog.value = false
  emit('onClose')
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>
</style>

