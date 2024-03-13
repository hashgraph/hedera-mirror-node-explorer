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
    <DownloadDialog :controller="controller" :downloader="downloader" :download-enabled="downloadEnabled">

        <!-- title -->
        <template v-slot:dialogTitle>
            <DialogTitle>{{ dialogTitle }}</DialogTitle>
        </template>

        <!-- input -->
        <template v-slot:dialogInput>
            <div class="columns">
                <p class="column has-text-weight-light">
                    Select transaction type:
                </p>
                <div class="column">
                    <TransactionFilterSelect v-model:selected-filter="selectedFilter"/>
                </div>
            </div>
            <div class="columns">
                <p class="column has-text-weight-light">
                    Select start date:
                </p>
                <div class="column">
                    <Datepicker
                        v-model="startDate"
                        placeholder="SELECT A DATE"
                        :is-24="false"
                        :enable-time-picker="false" dark
                        :teleport="true"
                        @closed="" @cleared=""/>
                </div>
            </div>
            <div class="columns ">
                <p class="column has-text-weight-light">
                    Select end date:
                </p>
                <div class="column">
                    <Datepicker
                        v-model="endDate"
                        placeholder="SELECT A DATE"
                        :is-24="false"
                        :enable-time-picker="false" dark
                        :teleport="true"
                        @closed="" @cleared=""/>
                </div>
            </div>
        </template>

    </DownloadDialog>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, PropType, ref} from "vue";
import {DialogController} from "@/components/dialog/DialogController";
import {TransactionDownloader} from "@/utils/downloader/TransactionDownloader";
import DownloadDialog from "@/components/download/DownloadDialog.vue";
import DialogTitle from "@/components/dialog/DialogTitle.vue";
import TransactionFilterSelect from "@/components/transaction/TransactionFilterSelect.vue";
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

export default defineComponent({
    name: 'TransactionDownloadDialog',
    components: {Datepicker, TransactionFilterSelect, DialogTitle, DownloadDialog},
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
        const selectedFilter = ref<string>("CRYPTOTRANSFER")
        const endDate = ref<Date|null>(new Date(new Date().setHours(0, 0, 0, 0)))
        const endTimestamp = computed(() => endDate.value ? endDate.value.getTime()/1000 : null)
        const startDate = ref<Date|null>(new Date(new Date(endDate.value?.getTime() ?? '').setMonth(new Date(endDate.value?.getTime() ?? '').getMonth()-1)))
        const startTimestamp = computed(() => startDate.value ? startDate.value.getTime()/1000 : null)
        const transactionTypes = computed<Set<string>>(
            () => new Set(selectedFilter.value ? [selectedFilter.value] : [])
        )
        const downloader = new TransactionDownloader(accountId, startDate, endDate, transactionTypes, 1000)

        const downloadEnabled = computed(() => {
            return startDate.value !== null
                && endDate.value !== null
                && startDate.value < endDate.value
        })

        return {
            dialogTitle,
            selectedFilter,
            startDate,
            endDate,
            startTimestamp,
            endTimestamp,
            downloader,
            downloadEnabled,
        }
    }

})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>
.dp__theme_dark {
    --dp-background-color: var(--h-theme-box-background-color);
    --dp-primary-color: #575757;
    --dp-border-color: white;
    --dp-border-color-hover: white;
    --dp-icon-color: white;
}
:root {
    --dp-font-family: "Styrene A Web", sans-serif;
    --dp-border-radius: 0;
    --dp-font-size: 11px;
    --dp-input-padding: 3.5px 30px 3.5px 12px
}
</style>