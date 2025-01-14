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

    <!-- title -->
    <template #dialogTitle>
      <DialogTitle>{{ dialogTitle }}</DialogTitle>
    </template>

    <!-- input -->
    <template #dialogInput>
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
          {{ status }}
        </div>
        <div class="mb-4 p-3 h-dotted-area" @drop="handleDrop" @dragover="handleDragOver">
          <template v-if="items.length >= 1">
            <FileList :audit-items="items" @clear-all-files="handleClearAllFiles"/>
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

    <!-- busy -->
    <template #dialogBusy>
      Verifying {{ matchingContractName }} contract…
    </template>

    <!-- success -->
    <template #dialogSuccess>
      <div class="is-flex is-align-items-baseline">
        <div class="icon is-medium has-text-success ml-0">
          <i class="fas fa-check"/>
        </div>
        <div class="h-is-tertiary-text mb-4">
          {{ mainSuccessMessage }}
        </div>
      </div>
      <div v-if="extraSuccessMessage" class="h-is-property-text">
        {{ extraSuccessMessage }}
      </div>
    </template>

    <!-- error -->
    <template #dialogError>
      <div class="is-flex is-align-items-baseline">
        <div class="icon is-medium has-text-danger">
          <span style="font-size: 18px; font-weight: 900">X</span>
        </div>
        <div class="h-is-tertiary-text mb-4">Verification failed</div>
      </div>
      <div v-if="extraErrorMessage !== null" class="h-is-property-text">
        {{ extraErrorMessage }}
      </div>
    </template>

    <!-- feedback -->
    <template #dialogFeedback>
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

    <!-- buttons -->
    <template #dialogInputButtons>
      <DialogButton :controller="controller" @action="handleCancel">CANCEL</DialogButton>
      <CommitButton :controller="controller" :enabled="verifyButtonEnabled" @action="handleVerify">VERIFY</CommitButton>
    </template>

  </Dialog>

  <ConfirmDialog :show-dialog="showConfirmDialog"
                 :main-message="confirmMessage"
                 :extra-message="confirmExtraMessage"
                 @onConfirm="handleConfirmVerification"
                 @onCancel="handleCancelVerification">
    <template v-slot:confirmTitle>{{ dialogTitle }}</template>
  </ConfirmDialog>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, PropType, ref} from "vue"
import FileList from "@/dialogs/verification/FileList.vue"
import Dialog from "@/dialogs/core/dialog/Dialog.vue";
import ConfirmDialog from "@/dialogs/ConfirmDialog.vue";
import {ContractSourceAnalyzer} from "@/utils/analyzer/ContractSourceAnalyzer.ts";
import {SourcifyUtils, SourcifyVerifyCheckedContract} from "@/utils/sourcify/SourcifyUtils.ts";
import {gtagVerifyContract} from "@/gtag.ts";
import {DialogController, DialogMode} from "@/dialogs/core/dialog/DialogController.ts";
import DialogTitle from "@/dialogs/core/dialog/DialogTitle.vue";
import DialogButton from "@/dialogs/core/dialog/DialogButton.vue";
import CommitButton from "@/dialogs/core/dialog/CommitButton.vue";

const showDialog = defineModel("showDialog", {
  type: Boolean,
  required: true
})

const props = defineProps({
  contractId: {
    type: String as PropType<string|null>,
    required: true
  }
})

const emit = defineEmits(["verifyDidComplete"])

const controller = new DialogController(showDialog)

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
    await contractSourceAnalyzer.chooseFiles(selectedFiles)
  } else {
    console.log("Selected file is undefined")
  }
}

//
// Buttons
//

const handleCancel = async () => {
  showDialog.value = false
  await contractSourceAnalyzer.reset()
}

const verifyButtonEnabled = computed(
    () => !contractSourceAnalyzer.analyzing.value && contractSourceAnalyzer.matchingContractName.value !== null)

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
    await contractSourceAnalyzer.dropFiles(e.dataTransfer.items)
  }
}

const items = computed(() => contractSourceAnalyzer.items.value)

//
// ContractSourceAnalyzer
//

const contractSourceAnalyzer = new ContractSourceAnalyzer(computed(() => props.contractId))

//
// Verify
//

const handleVerify = async () => {
  showConfirmDialog.value = true
}

//
// Status
//

const status = computed(() => {
  let result: string
  if (contractSourceAnalyzer.analyzing.value) {
    result = "Analyzing…"
  } else if (contractSourceAnalyzer.failure.value) {
    result = "Analysis failed"
  } else if (contractSourceAnalyzer.matchingContract.value !== null) {
    const matchingContract = contractSourceAnalyzer.matchingContract.value
    const note = matchingContract.status == "perfect" ? "full match" : "partial match"
    result = "Ready to verify contract \"" + contractSourceAnalyzer.matchingContractName.value + "\" (" + note + ")"
  } else if (contractSourceAnalyzer.contractCount.value == 0 && contractSourceAnalyzer.unusedCount.value >= 1) {
    result = "Add contract metadata json"
  } else {
    result = "Drop files…"
  }
  return result
})

const handleClearAllFiles = async () => {
  await contractSourceAnalyzer.reset()
}

//
// Confirm dialog
//
const showConfirmDialog = ref(false)
const confirmMessage = ref<string | null>(
    "Once verified, the contract status and source files will be public."
)
const confirmExtraMessage = ref<string | null>(null)

//
// handleConfirmVerification
//

const matchingContractName = computed(
    () => contractSourceAnalyzer.matchingContract.value?.name ?? null)

const mainSuccessMessage = computed(() => {
  let result: string|null
  if (newMatchingContract.value !== null) {
    const status = newMatchingContract.value.status
    if (status == "perfect" || status == "partial") {
      result = "Verification succeeded"
    } else {
      result = "Verification failed"
    }
  } else {
    result = null
  }
  return result
})

const extraSuccessMessage = computed(() => {
  let result: string|null
  if (newMatchingContract.value !== null) {
    const status = newMatchingContract.value.status
    if (status == "perfect" || status == "partial") {
      result = status == "perfect" ? "Full Match" : "Partial Match"
    } else {
      result = newMatchingContract.value.statusMessage ?? null
    }
  } else {
    result = null
  }
  return result
})

const extraErrorMessage = computed(() => {
  let result: string|null
  if (verificationError.value !== null) {
    result = (verificationError.value as any).toString()
  } else {
    result = null
  }
  return result
})

const newMatchingContract = ref<SourcifyVerifyCheckedContract|null>(null)
const verificationError = ref<unknown>(null)

const handleConfirmVerification = async () => {
  const contractId = props.contractId!
  const matchingContract = contractSourceAnalyzer.matchingContract.value!

  showConfirmDialog.value = false
  controller.mode.value = DialogMode.Busy

  try {
    const verificationIds = [matchingContract.verificationId]
    const response = await SourcifyUtils.sessionVerifyChecked(contractId, verificationIds, true)
    newMatchingContract.value = SourcifyUtils.fetchMatchingContract(response)
    verificationError.value = null
    controller.mode.value = DialogMode.Success
    emit("verifyDidComplete")
  } catch (reason) {
    newMatchingContract.value = null
    verificationError.value = reason
    controller.mode.value = DialogMode.Error
  } finally {
    gtagVerifyContract(mainSuccessMessage.value ?? "Verification failed")
  }
}

const handleCancelVerification = () => {
  showDialog.value = true
  showConfirmDialog.value = false
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
