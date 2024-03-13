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
        <template v-slot:dialogTitle><slot name="dialogTitle"/></template>

        <!-- input -->
        <template v-slot:dialogInput><slot name="dialogInput"/></template>

        <!-- busy -->
        <template v-slot:dialogBusy>
            <progress id="progress" :value="downloader.progress.value" class="progress is-large is-info mt-5"/>
            <span>Downloading:</span>
            <span class="has-text-grey is-numeric ml-2">{{ busyMessage }}</span>
        </template>

        <!-- success -->
        <template v-slot:dialogSuccess>
            <span>Download completed:</span>
            <span class="has-text-grey is-numeric ml-2">{{ successMessage }}</span>
        </template>

        <!-- error -->
        <template v-slot:dialogError>
            <span>Download failed:</span>
            <span class="has-text-grey is-numeric ml-2">{{ errorMessage }}</span>
        </template>

        <template v-slot:dialogInputButtons>
            <DialogButton :controller="controller">CANCEL</DialogButton>
            <CommitButton :controller="controller" :enabled="downloadEnabled" @action="handleDownload" >DOWNLOAD</CommitButton>
        </template>


    </Dialog>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, PropType} from "vue";
import Dialog from "@/components/dialog/Dialog.vue";
import CommitButton from "@/components/dialog/CommitButton.vue";
import DialogButton from "@/components/dialog/DialogButton.vue";
import DialogTitle from "@/components/dialog/DialogTitle.vue";
import {DialogController, DialogMode} from "@/components/dialog/DialogController";
import {DownloaderState, EntityDownloader} from "@/utils/downloader/EntityDownloader";

export default defineComponent({
    components: {DialogTitle, DialogButton, CommitButton, Dialog},
    props: {
        controller: {
            type: Object as PropType<DialogController>,
            required: true
        },
        downloader: {
            type: Object as PropType<EntityDownloader<unknown, unknown>>,
            required: true
        },
        downloadEnabled: {
            type: Boolean,
            required: true
        }
    },
    setup(props) {

        const handleSave = () => {
            const blob = props.downloader.csvBlob.value
            if (blob !== null) {
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.setAttribute('href', url)
                a.setAttribute('download', props.downloader.getOutputName());
                a.click()
            }
        }

        const handleDownload = () => {
            props.controller.mode.value = DialogMode.Busy
            props.downloader.run()
                .then(() => {
                    switch(props.downloader.state.value) {
                        case DownloaderState.Completed:
                            props.controller.mode.value = DialogMode.Success
                            handleSave()
                            break
                        case DownloaderState.Failure:
                            props.controller.mode.value = DialogMode.Error
                            break
                        case DownloaderState.Running: // Emergency code
                            props.controller.mode.value = DialogMode.Busy
                            break
                        case DownloaderState.Fresh: // Emergency code
                        case DownloaderState.Aborted:
                            props.controller.mode.value = DialogMode.Input
                            break
                    }
                })
                .catch((reason: unknown) => {
                    console.log("Download did fail:" + reason)
                    props.controller.mode.value = DialogMode.Error
                })
        }

        const busyMessage = computed(() => {
            const items = props.downloader.downloadedCount.value
            return items + " " + (items > 1 ? "items" : "item")
        })

        const successMessage = computed(() => {
            let result: string
            const count = props.downloader.downloadedCount.value
            if (props.downloader.downloadedCount.value === 0) {
                result = "No item matches this range"
            } else if (!props.downloader.drained.value) {
                result = "The maximum of " + props.downloader.maxEntityCount + " downloaded items was hit"
            } else {
                result = count + " " + (count > 1 ? "items" : "item")
            }
            return result
        })

        const errorMessage = computed(() => {
            return props.downloader.failureReason.value
        })

        return {
            busyMessage,
            successMessage,
            errorMessage,
            handleDownload
        }
    }
})
</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped/>
