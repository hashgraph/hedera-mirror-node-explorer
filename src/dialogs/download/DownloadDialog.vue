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
  <TaskDialog :controller="controller" @task-dialog-did-succeed="handleSuccess">

    <template #taskDialogTitle>
      <slot name="downloadDialogTitle"/>
    </template>

    <template #taskExecuteLabel>DOWNLOAD</template>

    <template #taskDialogInput>
      <slot name="downloadDialogInput"/>
    </template>

    <template #taskDialogBusy>
      <progress id="progress" :value="props.downloader.progress.value"/>
      <span>Downloading:</span>
      <span class="has-text-grey is-numeric ml-2">{{ busyMessage }}</span>
    </template>

    <template #taskDialogSuccess>
      <div style="display: flex">
        <span>Download completed:</span>
        <div style="margin-left: 0.5rem; color: var(--text-secondary)">
          <div>{{ successMessage }}</div>
          <div v-if="successMessage2">{{ successMessage2 }}</div>
          <div v-if="successMessage3">{{ successMessage3 }}</div>
        </div>
      </div>
    </template>

    <template #taskDialogError>
      <span>Download failed:</span>
      <span>{{ errorMessage }}</span>
    </template>

  </TaskDialog>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, PropType} from "vue";
import TaskDialog from "@/dialogs/core/task/TaskDialog.vue";
import {DownloadController} from "@/dialogs/download/DownloadController.ts";
import {EntityDownloader} from "@/utils/downloader/EntityDownloader.ts";
import {CoreConfig} from "@/config/CoreConfig.ts";

const showDialog = defineModel("showDialog", {
  type: Boolean,
  required: true
})

const props = defineProps({
  downloader: {
    type: Object as PropType<EntityDownloader<unknown, unknown>>,
    required: true
  },
  downloadEnabled: {
    type: Boolean,
    required: true
  }
})

const controller = new DownloadController(showDialog, props.downloader)

const busyMessage = computed(() => {
  const items = props.downloader.downloadedCount.value
  return items + " " + (items > 1 ? "items" : "item")
})

const successMessage = computed(() => {
  let result: string
  const entityCount = props.downloader.entities.value.length
  if (entityCount === 0) {
    result = "No item matches this range"
  } else {
    result = entityCount + " " + (entityCount > 1 ? "items" : "item")
  }
  return result
})

const successMessage2 = computed(() => {
  return props.downloader.drained.value ? null : "The maximum of " + props.downloader.maxEntityCount + " downloads was hit"
})

const successMessage3 = computed(() => {
  let result: string | null
  const drained = props.downloader.drained.value
  const lastDownloadedEntityDate = props.downloader.lastDownloadedEntityDate.value
  if (!drained && lastDownloadedEntityDate !== null) {
    const locale = "en-US"
    const dateOptions: Intl.DateTimeFormatOptions = {
      second: "2-digit",
      minute: "2-digit",
      hour: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
    const format = new Intl.DateTimeFormat(locale, dateOptions)
    const lastDate = format.format(lastDownloadedEntityDate)
    result = "Operation stopped at " + lastDate
  } else {
    result = null
  }
  return result
})

const errorMessage = computed(() => {
  return props.downloader.failureReason.value
})

const cryptoName = CoreConfig.inject().cryptoName

const handleSuccess = () => {
  const blob = props.downloader.csvBlob.value
  if (blob !== null) {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('href', url)
    a.setAttribute('download', props.downloader.getOutputName(cryptoName));
    a.click()
  }
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
