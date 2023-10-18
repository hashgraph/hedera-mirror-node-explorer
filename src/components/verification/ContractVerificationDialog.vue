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

import {computed, defineComponent, PropType, ref} from "vue"
import FileList from "@/components/verification/FileList.vue"
import {SolidityFileImporter} from "@/utils/SolidityFileImporter";
import {ByteCodeAnalyzer} from "@/utils/analyzer/ByteCodeAnalyzer";
import {SourcifyUtils} from "@/utils/sourcify/SourcifyUtils";

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
            return fileImporter.files.value.size >= 2 && fileImporter.metadataFileCount.value >= 1
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
        // Verify
        //

        const verifying = ref(false)
        const handleVerify = async () => {
            const shortCompilerVersion = props.byteCodeAnalyzer.solcVersion.value
            if (shortCompilerVersion != null) {
                verifying.value = true
                try {
                    // const longCompilerVersion = await SolcIndexCache.instance.fetchLongVersion(shortCompilerVersion)
                    // const sourcifyCompilerVersion = "v" + longCompilerVersion
                    await SourcifyUtils.verify(props.contractId, fileImporter.files.value)
                    context.emit('update:showDialog', false)
                    context.emit("verifyDidComplete")
                    fileImporter.reset()
                } finally {
                    verifying.value = false
                }
            }
        }


        //
        // Status
        //

        const status = computed(() => {
            let result: string
            if (fileImporter.started.value) {
                result = "Importing files…"
            } else if (fileImporter.metadataFileCount.value == 0) {
                result = "Metadata file is missing"
            } else if (fileImporter.metadataFileCount.value >= 2) {
                result = "Multiple metadata files are present. Keep the file matching the contract and remove others."
            } else if (fileImporter.files.value.size >= 2) {
                result = "Contract is ready to be verified"
            // } else if (compiling.value) {
            //     result = "Compiling…"
            // } else if (verifying.value) {
            //     result = "Verifying…"
            // } else if (contractRecord.value !== null) {
            //     result = "Contract " + contractRecord.value.contractName + " is ready to be verified"
            // } else if (solcOutput.value !== null) {
            //     if (SolcUtils.countErrors(solcOutput.value) >= 1) {
            //         const missingFiles = SolcUtils.fetchMissingFiles(solcOutput.value)
            //         if (missingFiles.length >= 1) {
            //             result = "File '" + missingFiles[0] + "' is missing"
            //         } else {
            //             result = "Compiler reports error. Check your Solidity files."
            //         }
            //     } else {
            //         result = "Contract " + props.contractId + " does not match those files"
            //     }
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
