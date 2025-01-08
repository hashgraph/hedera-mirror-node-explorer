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

  <div :class="{'is-active': showDialog}" class="modal has-text-white">
    <div class="modal-background"/>
    <div class="modal-content" style="width: 768px; border-radius: 16px">
      <div class="box">
        <div class="h-is-primary-title mb-3">
          {{ dialogTitle }}
        </div>
        <div>
          Please upload the Solidity source files and metadata associated with the Hedera contract.
          Once submitted the verification service will compile the source code and match it with
          the contract bytecode deployed on the Hedera network.
        </div>

        <hr class="h-card-separator"/>

        <div>
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

        <div class="is-flex is-justify-content-space-between">
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
          <div class="is-flex is-justify-content-flex-end">
            <button class="button is-white is-small" @click="handleCancel">CANCEL</button>
            <button :disabled="!verifyButtonEnabled"
                    class="button is-info is-small ml-4" @click="handleVerify">VERIFY
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <ConfirmDialog :show-dialog="showMetadataDialog"
                 :main-message="metadataMessage"
                 :extra-message="metadataExtraMessage"
                 @onConfirm="handleMetadataContinue"
                 @onCancel="handleCancelVerification"
                 confirm-label="CONTINUE">
    <template v-slot:dialogTitle>
            <span class="h-is-primary-title">
                {{ dialogTitle }}
            </span>
    </template>
  </ConfirmDialog>

  <ConfirmDialog :show-dialog="showConfirmDialog"
                 :main-message="confirmMessage"
                 :extra-message="confirmExtraMessage"
                 @onConfirm="handleConfirmVerification"
                 @onCancel="handleCancelVerification">
    <template v-slot:dialogTitle>
            <span class="h-is-primary-title">
                {{ dialogTitle }}
            </span>
    </template>
  </ConfirmDialog>

  <ProgressDialog v-model:show-dialog="showProgressDialog"
                  :mode="progressDialogMode"
                  :main-message="progressMainMessage"
                  :extra-message="progressExtraMessage"
                  :show-spinner="showProgressSpinner"
                  @dialogClosing="progressDialogClosing"
  >
    <template v-slot:dialogTitle>
            <span class="h-is-primary-title">
                {{ dialogTitle }}
            </span>
    </template>
  </ProgressDialog>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, ref} from "vue"
import FileList from "@/components/verification/FileList.vue"
import ProgressDialog, {Mode} from "@/components/staking/ProgressDialog.vue";
import ConfirmDialog from "@/dialogs/ConfirmDialog.vue";
import {ContractSourceAnalyzer} from "@/utils/analyzer/ContractSourceAnalyzer";
import {SourcifyUtils} from "@/utils/sourcify/SourcifyUtils";
import {gtagVerifyContract} from "@/gtag";

export default defineComponent({
  name: "ContractVerificationDialog",
  components: {ConfirmDialog, ProgressDialog, FileList},
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    contractId: {
      type: String,
      default: null
    }
  },
  emits: ["update:showDialog", "verifyDidComplete"],
  setup(props, context) {

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
      context.emit('update:showDialog', false)
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

    // Metadata dialog
    const showMetadataDialog = ref(false)
    const metadataMessage = ref<string | null>(null)
    const metadataExtraMessage = ref<string | null>(null)

    const handleMetadataContinue = async () => {
      showMetadataDialog.value = false
      showConfirmDialog.value = true
    }

    //
    // Confirm dialog
    //
    const showConfirmDialog = ref(false)
    const confirmMessage = ref<string | null>(
        "Once verified, the contract status and source files will be public."
    )
    const confirmExtraMessage = ref<string | null>(null)

    const handleConfirmVerification = async () => {
      const contractId = props.contractId
      const matchingContract = contractSourceAnalyzer.matchingContract.value!

      showConfirmDialog.value = false
      showProgressDialog.value = true
      showProgressSpinner.value = true
      progressDialogMode.value = Mode.Busy
      progressMainMessage.value = `Verifying ${matchingContract.name} contract…`
      progressExtraMessage.value = null

      try {
        const verificationIds = [matchingContract.verificationId]
        const response = await SourcifyUtils.sessionVerifyChecked(contractId, verificationIds, true)
        showProgressSpinner.value = false

        const matchingContractBis = SourcifyUtils.fetchMatchingContract(response)
        if (matchingContractBis !== null) {
          const status = matchingContractBis.status
          if (status == "perfect" || status == "partial") {
            progressDialogMode.value = Mode.Success
            progressMainMessage.value = "Verification succeeded"
            if (status == "perfect") {
              progressExtraMessage.value = "Full Match"
            } else {
              progressExtraMessage.value = "Partial Match"
            }
          } else {
            progressDialogMode.value = Mode.Error
            progressMainMessage.value = "Verification failed"
            progressExtraMessage.value = matchingContractBis.statusMessage ?? null
          }
        } else {
          // Bug
          progressDialogMode.value = Mode.Error
          progressMainMessage.value = "Verification cannot be done"
          progressExtraMessage.value = null
        }
      } catch (reason) {
        showProgressSpinner.value = false
        progressDialogMode.value = Mode.Error
        progressMainMessage.value = "Verification failed"
        progressExtraMessage.value = (reason as any).toString()
      } finally {
        gtagVerifyContract(progressMainMessage.value)
      }
    }

    const handleCancelVerification = () => {
      context.emit('update:showDialog', true)
      showMetadataDialog.value = false
      showConfirmDialog.value = false
    }

    //
    // Progress dialog
    //
    const showProgressDialog = ref(false)
    const progressDialogMode = ref(Mode.Busy)
    const progressMainMessage = ref<string | null>(null)
    const progressExtraMessage = ref<string | null>(null)
    const showProgressSpinner = ref(false)

    const progressDialogClosing = () => {
      if (progressDialogMode.value == Mode.Success) {
        context.emit('update:showDialog', false) // => call ContractSourceAnalyzer.unmount()
        context.emit("verifyDidComplete")
      }
    }

    return {
      dialogTitle,
      handleCancel,
      handleVerify,
      handleDragOver,
      handleDrop,
      items,
      verifyButtonEnabled,
      status,
      handleClearAllFiles,
      showMetadataDialog,
      metadataMessage,
      metadataExtraMessage,
      showConfirmDialog,
      confirmMessage,
      confirmExtraMessage,
      showProgressDialog,
      progressDialogMode,
      progressMainMessage,
      progressExtraMessage,
      showProgressSpinner,
      fileChooser,
      showFileChooser,
      handleFileSelected,
      handleMetadataContinue,
      handleConfirmVerification,
      handleCancelVerification,
      progressDialogClosing
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
