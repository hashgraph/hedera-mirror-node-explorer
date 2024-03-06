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
    <DownloadDialog :controller="controller" :downloader="downloader">

        <!-- title -->
        <template v-slot:dialogTitle>
            <DialogTitle>{{ dialogTitle }}</DialogTitle>
        </template>

        <!-- input -->
        <template v-slot:dialogInput>
            <div>
                <div>Start date: {{ downloader.startDate.value?.toDateString() }}</div>
                <div>End date: {{ downloader.startDate.value?.toDateString() }}</div>
                <div>Transaction types: {{ transactionTypesText }}</div>
            </div>
        </template>

    </DownloadDialog>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, PropType, ref} from "vue";
import {DialogController, DialogMode} from "@/components/dialog/DialogController";
import {TransactionDownloader} from "@/utils/downloader/TransactionDownloader";
import {DownloaderState} from "@/utils/downloader/EntityDownloader";
import DownloadDialog from "@/components/download/DownloadDialog.vue";
import DialogTitle from "@/components/dialog/DialogTitle.vue";

export default defineComponent({
    components: {DialogTitle, DownloadDialog},
    props: {
        controller: {
            type: Object as PropType<DialogController>,
            required: true
        },
        accountId: String
    },
    setup(props) {

        const dialogTitle = computed(() => "Download transactions from " + props.accountId)

        const accountId = computed(() => props.accountId ?? null)
        const startDate = ref<Date|null>(new Date(2023, 0, 1))
        const endDate = ref<Date|null>(new Date(2023, 0, 7))
        const transactionTypes = ref<Set<string>>(new Set(["CONTRACTCALL", "TOKENMINT"]))
        const downloader = new TransactionDownloader(accountId, startDate, endDate, transactionTypes, 1000)

        const handleSave = () => {
            const blob = downloader.csvBlob.value
            if (blob !== null) {
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.setAttribute('href', url)
                a.setAttribute('download', downloader.getOutputName());
                a.click()
            }
        }

        const handleDownload = () => {
            props.controller.mode.value = DialogMode.Busy
            downloader.run()
                .then(() => {
                    switch(downloader.state.value) {
                        case DownloaderState.Completed:
                            props.controller.mode.value = DialogMode.Success
                            handleSave()
                            break
                        case DownloaderState.Failure:
                            props.controller.mode.value = DialogMode.Error
                            break
                        default:
                            props.controller.mode.value = DialogMode.Error
                            break
                    }
                })
                .catch(() => {
                    props.controller.mode.value = DialogMode.Error
                })
        }

        const downloadEnabled = computed(() => {
            return downloader.accountId.value !== null
            && downloader.startDate.value !== null
            && downloader.endDate.value !== null
            && downloader.startDate.value < downloader.endDate.value
        })

        const busyMessage = computed(() => {
            const items = downloader.downloadedCount.value
            return items + " " + (items > 1 ? "items" : "item")
        })

        const successMessage = computed(() => {
            let result: string
            const count = downloader.downloadedCount.value
            if (downloader.downloadedCount.value === 0) {
                result = "No item matches this range"
            } else if (!downloader.drained.value) {
                result = "The maximum of " + downloader.maxEntityCount + " downloaded items was hit"
            } else {
                result = count + " " + (count > 1 ? "items" : "item")
            }
            return result
        })

        const errorMessage = computed(() => {
           return downloader.failureReason.value
        })

        const transactionTypesText = computed(() => JSON.stringify(Array.from(downloader.transactionTypes.value)))

        return {
            dialogTitle,
            transactionTypesText,
            downloadEnabled,
            busyMessage,
            successMessage,
            errorMessage,
            downloader,
            handleDownload
        }
    }

})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped/>