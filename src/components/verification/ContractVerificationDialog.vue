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
                    Verify contract {{ contractId }}
                </div>
                <div>
                    Verify the contract by recompiling all the Solidity source files and checking that the output
                    is the same as the bytecode of the deployed contract
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
                        <template v-else>
                            <div class="has-text-centered mb-4 has-text-grey">No files</div>
                        </template>
                    </div>
                </div>

                <div class="is-flex is-justify-content-flex-end">
                    <button class="button is-white is-small" @click="handleCancel">CANCEL</button>
                    <button :disabled="!verifyButtonEnabled"
                            class="button is-info is-small ml-4" @click="handleVerify">VERIFY</button>
                </div>

            </div>
        </div>
    </div>

    <ConfirmDialog :show-dialog="showConfirmDialog"
                   :main-message ="confirmMessage"
                   :extra-message="confirmExtraMessage"
                   @onConfirm="handleConfirmVerification"
                   @onCancel="handleCancelVerification">
        <template v-slot:dialogTitle>
            <span class="h-is-primary-title">
                Are you sure you want to continue?
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
            <span class="h-is-primary-title">Verify Contract</span>
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

        //
        // Buttons
        //

        const handleCancel = () => {
            context.emit('update:showDialog', false)
            fileImporter.reset()
        }

        const verifyButtonEnabled = computed(() => {
            const auditStatus = sourceAnalyzer.audit.value?.status
            return auditStatus == ContractAuditStatus.Resolved || auditStatus == ContractAuditStatus.Uncertain
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
            showConfirmDialog.value = true
            confirmMessage.value =
                "Once the contract is verified, its verification status and source files will be publicly available."
            confirmExtraMessage.value =
                "This action can not be reverted."
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
                        result = "These source files do not match contract byte code"
                        break
                    case ContractAuditStatus.UnknownCompilerVersion:
                        const compilerVersion = props.byteCodeAnalyzer.solcVersion.value ?? "?"
                        result = "Cannot find compiler for version " + compilerVersion
                        break
                    case ContractAuditStatus.CompilationErrors:
                        result = "Compiler reports some errors. Check your source files."
                        break
                    case ContractAuditStatus.Resolved: {
                        const contractName = sourceAnalyzer.audit.value.contractRecord!.contractName
                        const metadataFile = sourceAnalyzer.audit.value.resolvedMetadata![0]
                        result = "Contract \"" + contractName + "\" is ready to be verified"
                        break
                    }
                    case ContractAuditStatus.Uncertain: {
                        const contractName = sourceAnalyzer.audit.value.contractRecord!.contractName
                        result = "Contract \"" + contractName + "\" is ready to be verified (without metadata file)"
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

        //
        // Confirm dialog
        //
        const showConfirmDialog = ref(false)
        const confirmMessage = ref<string|null>(null)
        const confirmExtraMessage = ref<string|null>(null)

        const handleConfirmVerification = async () => {
            const audit = sourceAnalyzer.audit.value!
            const contractRecord = audit.contractRecord!

            showConfirmDialog.value = false
            showProgressDialog.value = true
            showProgressSpinner.value = true
            progressDialogMode.value = Mode.Busy
            progressMainMessage.value = "Verifying " + contractRecord.contractName + " contract…"
            progressExtraMessage.value = null
            try {
                let response: SourcifyVerifyResponse | null
                if (audit.status == ContractAuditStatus.Resolved) {
                    // We verify using /verify REST call
                    const metadata = audit.resolvedMetadata![1]
                    const sourceFiles = audit.makeReducedSourceFiles()
                    response = await SourcifyUtils.verify(props.contractId, metadata, sourceFiles)
                } else {
                    const compilerVersion = "v" + audit.longCompilerVersion!
                    const solcInput = audit.makeReducedSolcInput()
                    response = await SourcifyUtils.verifyWithSolcInput(props.contractId, contractRecord.contractName, compilerVersion, solcInput)
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
            handleCancel,
            handleVerify,
            handleDragOver,
            handleDrop,
            auditItems,
            verifyButtonEnabled,
            status,
            handleClearAllFiles,
            showConfirmDialog,
            confirmMessage,
            confirmExtraMessage,
            showProgressDialog,
            progressDialogMode,
            progressMainMessage,
            progressExtraMessage,
            showProgressSpinner,
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
