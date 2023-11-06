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
                        <template v-if="auditItems.length >= 1">
                            <FileList :audit-items="auditItems" @clear-all-files="handleClearAllFiles"/>
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
                                :class="{'is-invisible': auditItems.length === 0}"
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
                                class="button is-info is-small ml-4" @click="handleVerify">VERIFY</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <ConfirmDialog :show-dialog="showMetadataDialog"
                   :main-message ="metadataMessage"
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
                   :main-message ="confirmMessage"
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

import {computed, defineComponent, onBeforeUnmount, onMounted, PropType, ref} from "vue"
import FileList from "@/components/verification/FileList.vue"
import {SolidityFileImporter} from "@/utils/SolidityFileImporter";
import {ByteCodeAnalyzer} from "@/utils/analyzer/ByteCodeAnalyzer";
import {SourcifyUtils, SourcifyVerifyResponse} from "@/utils/sourcify/SourcifyUtils";
import {ContractSourceAnalyzer} from "@/utils/analyzer/ContractSourceAnalyzer";
import ProgressDialog, {Mode} from "@/components/staking/ProgressDialog.vue";
import {ContractAuditStatus} from "@/utils/analyzer/ContractSourceAudit";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import {SolcUtils} from "@/utils/solc/SolcUtils";
import {SolcInput} from "@/utils/solc/SolcInput";

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
        },
        byteCodeAnalyzer: {
            type: Object as PropType<ByteCodeAnalyzer>,
            required: true
        }
    },
    emits: ["update:showDialog", "verifyDidComplete"],
    setup(props, context) {

        const dialogTitle = `Verify contract ${props.contractId}`

        // File Chooser
        const fileChooser = ref<HTMLInputElement | null>(null)

        const showFileChooser = () => {
            if (fileChooser.value !== null) {
                fileChooser.value.click()
            }
        }

        const handleFileSelected = () => {
            const selectedFiles = fileChooser.value?.files ?? null
            if (selectedFiles && selectedFiles.length >= 1) {
                fileImporter.start(selectedFiles)
            } else {
                console.log("Selected file is undefined")
            }
        }

        //
        // Buttons
        //

        const handleCancel = () => {
            context.emit('update:showDialog', false)
            fileImporter.reset()
        }

        const verifyButtonEnabled = computed(() => {
            const auditStatus = sourceAnalyzer.audit.value?.status
            return auditStatus == ContractAuditStatus.Resolved
                || auditStatus == ContractAuditStatus.Uncertain
                || auditStatus == ContractAuditStatus.Mismatch
        })

        //
        // Drag & drop
        //
        const fileImporter = new SolidityFileImporter()
        const handleDragOver = (e: DragEvent) => {
            if (e.dataTransfer) {
                e.dataTransfer.dropEffect = "copy";
            }
            e.preventDefault()
        }

        const handleDrop = (e: DragEvent) => {
            if (e.dataTransfer) {
                e.dataTransfer.dropEffect = "copy";
                fileImporter.start(e.dataTransfer.items)
            }
            e.preventDefault()
        }

        const auditItems = computed(() => {
            return sourceAnalyzer.audit.value?.items ?? []
        })

        //
        // Source analysis
        //

        const sourceAnalyzer = new ContractSourceAnalyzer(props.byteCodeAnalyzer, fileImporter.files)
        onMounted(() => sourceAnalyzer.mount())
        onBeforeUnmount(() => sourceAnalyzer.unmount())

        //
        // Verify
        //

        const handleVerify = async () => {
            context.emit('update:showDialog', false)
            const audit = sourceAnalyzer.audit.value
            if (audit?.status === ContractAuditStatus.Uncertain && audit.resolvedMetadata === null) {
                showMetadataDialog.value = true
                metadataMessage.value = "You may proceed as is, or go back and add the metadata file if you have it."
                metadataExtraMessage.value = "Providing the metadata may increase the chances to get a full match."
                showMetadataDialog.value = true
            } else {
                showConfirmDialog.value = true
            }
            console.log(`status: ${sourceAnalyzer.audit.value?.status}`)
            console.log(`failure: ${sourceAnalyzer.audit.value?.failure}`)
            console.log(`resolvedMetadata: ${sourceAnalyzer.audit.value?.resolvedMetadata}`)
        }

        //
        // Status
        //

        const status = computed(() => {
            let result: string
            if (fileImporter.started.value) {
                result = "Importing files…"
            } else if (sourceAnalyzer.analyzing.value) {
                result = "Analyzing source files…"
            } else if (sourceAnalyzer.audit.value !== null) {
                switch(sourceAnalyzer.audit.value.status) {
                    case ContractAuditStatus.NoSourceFile:
                        result = "Drop the Solidity source files (and metadata if available) in the area below"
                        break
                    case ContractAuditStatus.Failure:
                        result = "Compilation failed. Check your source files."
                        break
                    case ContractAuditStatus.Mismatch:
                        switch(sourceAnalyzer.audit.value.countSolcMetadata()) {
                            case 0:
                                result = "These source files do not match contract byte code"
                                break
                            case 1:
                                result = "Contract is ready to be verified"
                                break
                            default:
                                result = "Multiple metadata files are present. Make sure to drop only a single one."
                        }
                        break
                    case ContractAuditStatus.UnknownCompilerVersion:
                        const compilerVersion = props.byteCodeAnalyzer.solcVersion.value ?? "?"
                        result = "Cannot find compiler for version " + compilerVersion
                        break
                    case ContractAuditStatus.CompilationErrors:
                        if (sourceAnalyzer.audit.value.missingFiles.length >= 1) {
                            result = "File '" + sourceAnalyzer.audit.value.missingFiles[0] + "' is missing."
                        } else {
                            result = "Compiler reports some errors. Check your source files."
                        }
                        break
                    case ContractAuditStatus.Resolved: {
                        const contractName = sourceAnalyzer.audit.value.resolvedContractName
                        result = "Contract \"" + contractName + "\" is ready to be verified"
                        break
                    }
                    case ContractAuditStatus.Uncertain: {
                        const contractName = sourceAnalyzer.audit.value.resolvedContractName
                        result = "Contract \"" + contractName + "\" is ready to be verified"
                        break
                    }
                }
            } else {
                result = "Drop the Solidity source files (and metadata if available) in the area below"
            }
            return result
        })

        const handleClearAllFiles = () => {
            fileImporter.reset()
        }

        // Metadata dialog
        const showMetadataDialog = ref(false)
        const metadataMessage = ref<string|null>(null)
        const metadataExtraMessage = ref<string|null>(null)

        const handleMetadataContinue = async () => {
            showMetadataDialog.value = false
            showConfirmDialog.value = true
        }

        //
        // Confirm dialog
        //
        const showConfirmDialog = ref(false)
        const confirmMessage = ref<string|null>(
            "Once verified, the contract status and source files will be public."
        )
        const confirmExtraMessage = ref<string|null>(null)

        const handleConfirmVerification = async () => {
            const audit = sourceAnalyzer.audit.value!

            showConfirmDialog.value = false
            showProgressDialog.value = true
            showProgressSpinner.value = true
            progressDialogMode.value = Mode.Busy
            progressMainMessage.value = "Verifying " + audit.resolvedContractName + " contract…"
            progressExtraMessage.value = null
            try {
                let response: SourcifyVerifyResponse | null
                if (audit.status == ContractAuditStatus.Resolved) {
                    const solcMetadata = SolcUtils.castSolcMetadata(audit.resolvedMetadata)
                    if (solcMetadata !== null) {
                        // We verify using /verify REST call
                        const sourceFiles = audit.makeReducedSourceFiles()
                        response = await SourcifyUtils.verify(
                            props.contractId,
                            solcMetadata,
                            sourceFiles)
                    } else {
                        // We verify using /verify/solc-input REST call
                        const compilerVersion = "v" + audit.longCompilerVersion!
                        const solcInput = audit.resolvedMetadata as SolcInput
                        response = await SourcifyUtils.verifyWithSolcInput(
                            props.contractId,
                            audit.resolvedContractName!,
                            compilerVersion,
                            solcInput)
                    }
                } else if (audit.status == ContractAuditStatus.Uncertain) {
                    const contractName = audit.resolvedContractName!
                    const compilerVersion = "v" + audit.longCompilerVersion!
                    const solcInput = audit.makeReducedSolcInput()
                    response = await SourcifyUtils.verifyWithSolcInput(
                        props.contractId,
                        contractName,
                        compilerVersion,
                        solcInput)
                } else {
                    // audit.status == ContractAuditStatus.Mismatch
                    // We verify using /verify REST call
                    const sourceFiles = audit.makeReducedSourceFiles()
                    const fallbackMetadata = audit.fetchFallbackMetadata()
                    response = await SourcifyUtils.verify(
                        props.contractId,
                        fallbackMetadata!,
                        sourceFiles)
                }
                showProgressSpinner.value = false
                if (response !== null) {
                    if (response.result) {
                        progressDialogMode.value = Mode.Success
                        progressMainMessage.value = "Verification succeeded"
                        const status = SourcifyUtils.fetchVerifyStatus(response)
                        if (status == "perfect") {
                            progressExtraMessage.value = "Full Match"
                        } else if (status == "partial") {
                            progressExtraMessage.value = "Partial Match"
                        } else {
                            progressExtraMessage.value = status
                        }
                    } else {
                        progressDialogMode.value = Mode.Error
                        progressMainMessage.value = "Verification failed"
                        progressExtraMessage.value = response.error ?? null
                    }
                } else {
                    // Bug
                    progressDialogMode.value = Mode.Error
                    progressMainMessage.value = "Verification cannot be done"
                    progressExtraMessage.value = null
                }
            } catch(reason) {
                showProgressSpinner.value = false
                progressDialogMode.value = Mode.Error
                progressMainMessage.value = "Verification failed"
                progressExtraMessage.value = SourcifyUtils.fetchVerifyError(reason)
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
        const progressMainMessage = ref<string|null>(null)
        const progressExtraMessage = ref<string|null>(null)
        const showProgressSpinner = ref(false)

        const progressDialogClosing = () => {
            if (progressDialogMode.value == Mode.Success) {
                context.emit('update:showDialog', false)
                context.emit("verifyDidComplete")
                fileImporter.reset()
            }
        }

        return {
            dialogTitle,
            handleCancel,
            handleVerify,
            handleDragOver,
            handleDrop,
            auditItems,
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
