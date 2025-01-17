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
  <TaskDialog :controller="controller" @task-dialog-did-succeed="emit('verifyDidComplete')">

    <!-- title -->
    <template #taskDialogTitle>{{ dialogTitle }}</template>

    <!-- execute label -->
    <template #taskExecuteLabel>VERIFY</template>

    <!-- input -->
    <template #taskDialogInput>
      <div>
        Please upload the Solidity source files and metadata associated with the Hedera contract.
        Once submitted the verification service will compile the source code and match it with
        the contract bytecode deployed on the Hedera network.
      </div>
      <hr class="h-card-separator"/>

      <div style="width: 100%">
        <div class="h-is-primary-subtitle mb-3">
          Add files
        </div>
        <div class="mb-4">
          {{ controller.status.value }}
        </div>
        <div class="mb-4 p-3 h-dotted-area" @drop="handleDrop" @dragover="handleDragOver">
          <template v-if="items.length >= 1">
            <FileList :audit-items="items" @clear-all-files="controller.handleClearAllFiles()"/>
          </template>
          <div v-else class="is-flex is-justify-content-center is-align-items-center my-5">
            <img alt="Add file" class="image mr-1" style="width: 30px; height: 30px;"
                 src="../../assets/file-add.svg"
            >
            <span class="has-text-grey">
                                Drop .sol and .json files, or folder here... or
                            </span>
            <a @click="showFileChooser">
                                <span class="has-text-info ml-2" style="cursor: pointer">
                                    Choose files
                                </span>
            </a>
            <input
                type="file"
                ref="fileChooser"
                id="file-chooser"
                accept=".json, .sol"
                multiple
                style="display: none"
                @change="handleFileSelected"
            />
          </div>
        </div>
      </div>
    </template>

    <!-- confirm -->
    <template #taskDialogConfirm>
      Once verified, the contract status and source files will be public.
    </template>

    <!-- busy -->
    <template #taskDialogBusy>
      Verifying {{ controller.matchingContractName.value }} contract…
    </template>

    <!-- success -->
    <template #taskDialogSuccess>
      <div class="is-flex is-align-items-baseline">
        <div class="icon is-medium has-text-success ml-0">
          <i class="fas fa-check"/>
        </div>
        <div class="h-is-tertiary-text mb-4">
          {{ controller.mainSuccessMessage.value }}
        </div>
      </div>
      <div v-if="controller.extraSuccessMessage.value" class="h-is-property-text">
        {{ controller.extraSuccessMessage.value }}
      </div>
    </template>

    <!-- error -->
    <template #taskDialogError>
      <div class="is-flex is-align-items-baseline">
        <div class="icon is-medium has-text-danger">
          <span style="font-size: 18px; font-weight: 900">X</span>
        </div>
        <div class="h-is-tertiary-text mb-4">Verification failed</div>
      </div>
      <div v-if="controller.extraErrorMessage.value !== null" class="h-is-property-text">
        {{ controller.extraErrorMessage.value }}
      </div>
    </template>

    <!-- feedback -->
    <template #taskDialogControls>
      <div>
        <button class="button is-white is-small"
                :class="{'is-invisible': items.length === 0}"
                @click="showFileChooser">
          ADD MORE FILES
        </button>
        <input
            type="file"
            ref="fileChooser"
            id="file-chooser"
            accept=".json, .sol"
            multiple
            style="display: none"
            @change="handleFileSelected"
        />
      </div>
    </template>


  </TaskDialog>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, PropType, ref} from "vue";
import TaskDialog from "@/dialogs/core/task/TaskDialog.vue";
import FileList from "@/dialogs/verification/FileList.vue";
import {ContractVerificationController} from "@/dialogs/verification/ContractVerificationController.ts";

//
// ModalDialog
//

const showDialog = defineModel("showDialog", {
  type: Boolean,
  required: true
})

const props = defineProps({
  contractId: {
    type: String as PropType<string|null>,
    default: null
  }
})

const emit = defineEmits(["verifyDidComplete"])

const contractId = computed(() => props.contractId)
const controller = new ContractVerificationController(showDialog, contractId)

const dialogTitle = computed(() => `Verify contract ${props.contractId}`)

// File Chooser
const fileChooser = ref<HTMLInputElement | null>(null)

const showFileChooser = () => {
  if (fileChooser.value !== null) {
    fileChooser.value.value = ''
    fileChooser.value.click()
  }
}

const handleFileSelected = async () => {
  const selectedFiles = fileChooser.value?.files ?? null
  if (selectedFiles && selectedFiles.length >= 1) {
    await controller.chooseFiles(selectedFiles)
  } else {
    console.log("Selected file is undefined")
  }
}

//
// Drag & drop
//
const handleDragOver = (e: DragEvent) => {
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = "copy";
  }
  e.preventDefault()
}

const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = "copy"
    await controller.dropFiles(e.dataTransfer.items)
  }
}

const items = controller.items

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
