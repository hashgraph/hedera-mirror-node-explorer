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
                        <template v-if="fileList.length >= 1">
                            <FileList :file-list="fileList" @clear-all-files="handleClearAllFiles"/>
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

export default defineComponent({
    name: "ContractVerificationDialog",
    components: {ProgressDialog, FileList},
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
            return sourceAnalyzer.contractRecord.value !== null
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

        const fileList = computed(() => {
            return Array.from(fileImporter.files.value.keys())
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
            showProgressDialog.value = true
            showProgressSpinner.value = true
            progressDialogMode.value = Mode.Busy
            progressMainMessage.value = "Verifying " + sourceAnalyzer.contractRecord.value!.contractName + " contract…"
            progressExtraMessage.value = null
            try {
                let response: SourcifyVerifyResponse | null
                const resolvedMetadataFile = sourceAnalyzer.resolvedMetadataFile.value
                if (resolvedMetadataFile !== null) {
                    // We verify using /verify REST call
                    const metadata = resolvedMetadataFile[1]
                    const sourceFiles = sourceAnalyzer.sourceFiles.value
                    response = await SourcifyUtils.verify(props.contractId, metadata, sourceFiles)
                } else {
                    const contractRecord = sourceAnalyzer.contractRecord.value
                    const compilerVersion = sourceAnalyzer.longCompilerVersion.value
                    const solcInput = sourceAnalyzer.solcInput.value
                    if (contractRecord !== null && compilerVersion !== null && solcInput !== null) {
                        // We verify using /verify/solc-input REST call
                        response = await SourcifyUtils.verifyWithSolcInput(props.contractId, contractRecord.contractName, compilerVersion, solcInput)
                    } else {
                        // Bug
                        response = null
                    }
                }
                showProgressSpinner.value = false
                if (response !== null) {
                    if (response.result) {
                        progressDialogMode.value = Mode.Success
                        progressMainMessage.value = "Verification succeeded"
                        const status = SourcifyUtils.fetchVerifyStatus(response)
                        if (status == "perfect") {
                            progressExtraMessage.value = "Perfect Match"
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


        //
        // Status
        //

        const status = computed(() => {
            let result: string
            if (fileImporter.started.value) {
                result = "Importing files…"
            } else if (sourceAnalyzer.analyzing.value) {
                result = "Analyzing source files…"
            } else if (sourceAnalyzer.contractRecord.value !== null) {
                const contractName = sourceAnalyzer.contractRecord.value.contractName
                const resolveMetatadataFile = sourceAnalyzer.resolvedMetadataFile.value
                if (resolveMetatadataFile !== null) {
                    result = "Contract \"" + contractName + "\" is ready to be verified (with " + resolveMetatadataFile[0] + ")"
                } else {
                    result = "Contract \"" + contractName + "\" is ready to be verified (without metadata file)"
                }
            } else if (fileImporter.files.value.size >= 1) {
                result = "These source files do not match contract byte code"
            } else {
                result = "Drop the Solidity source files (and metadata if available) in the area below"
            }
            return result
        })

        const handleClearAllFiles = () => {
            fileImporter.reset()
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
            fileList,
            verifyButtonEnabled,
            status,
            handleClearAllFiles,
            showProgressDialog,
            progressDialogMode,
            progressMainMessage,
            progressExtraMessage,
            showProgressSpinner,
            progressDialogClosing
        }
    }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
