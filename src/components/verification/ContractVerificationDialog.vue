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
                <div class="is-flex is-justify-content-space-between is-align-items-self-end">
                    <span class="h-is-primary-title">Verify Contract {{ contractId }}</span>
                    <a @click="handleCancel">
                        <img alt="" src="@/assets/close-icon.png" style="max-height: 20px;">
                    </a>
                </div>

                <hr class="h-card-separator"/>

                <div>
                    <div class="mb-4">{{ status }}</div>
                    <div class="mb-4 p-3" style="border: dashed 1px grey" @drop="handleDrop" @dragover="handleDragOver">
                        <template v-if="fileList.length >= 1">
                            <FileList :file-list="fileList"/>
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

export default defineComponent({
    name: "ContractVerificationDialog",
    components: {FileList},
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
            return sourceAnalyzer.contractRecord.value !== null && !verifying.value
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

        const verifying = ref(false)
        const handleVerify = async () => {
            verifying.value = true
            try {
                let response: SourcifyVerifyResponse|null
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
                        // We'll user /verify/solc-input REST call
                        response = await SourcifyUtils.verifyWithSolcInput(props.contractId, contractRecord.contractName, compilerVersion, solcInput)
                    } else {
                        // Bug
                        response = null
                    }
                }
                if (response !== null) {
                    context.emit('update:showDialog', false)
                    context.emit("verifyDidComplete")
                    fileImporter.reset()
                }
            } finally {
                verifying.value = false
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
            } else if (verifying.value) {
                result = "Verifying…"
            } else if (sourceAnalyzer.contractRecord.value !== null) {
                const contractName = sourceAnalyzer.contractRecord.value.contractName
                const resolveMetatadataFile = sourceAnalyzer.resolvedMetadataFile.value
                if (resolveMetatadataFile !== null) {
                    result = "Contract " + contractName + " is ready to be verified (with " + resolveMetatadataFile[0] + ")"
                } else {
                    result = "Contract " + contractName + " is ready to be verified (without metadata file)"
                }
            } else if (fileImporter.files.value.size >= 1) {
                result = "These source files do not match contract byte code"
            } else {
                result = "Drop Solidity files in the area below"
            }
            return result
        })



        return {
            handleCancel,
            handleVerify,
            handleDragOver,
            handleDrop,
            fileList,
            verifyButtonEnabled,
            status
        }
    }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
