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
    <template v-slot:dialogTitle>
      <slot name="dialogTitle"/>
    </template>

    <!-- input -->
    <template v-slot:dialogInput>
      <slot name="dialogInput"/>
    </template>

    <!-- busy -->
    <template v-slot:dialogBusy>
      <progress id="progress" :value="downloader.progress.value" class="progress is-large is-info mt-5"/>
      <span>Downloading:</span>
      <span class="has-text-grey is-numeric ml-2">{{ busyMessage }}</span>
    </template>

    <!-- success -->
    <template v-slot:dialogSuccess>
      <div class="is-flex">
        <span>Download completed:</span>
        <div class="ml-2">
          <div class="has-text-grey is-numeric">{{ successMessage }}</div>
          <div v-if="successMessage2" class="has-text-grey is-numeric">{{ successMessage2 }}</div>
          <div v-if="successMessage3" class="has-text-grey is-numeric">{{ successMessage3 }}</div>
        </div>
      </div>
    </template>

    <!-- error -->
    <template v-slot:dialogError>
      <span>Download failed:</span>
      <span class="has-text-grey is-numeric ml-2">{{ errorMessage }}</span>
    </template>

    <template v-slot:dialogInputButtons>
      <DialogButton :controller="controller">CANCEL</DialogButton>
      <CommitButton :controller="controller" :enabled="downloadEnabled" @action="handleDownload">DOWNLOAD</CommitButton>
    </template>


  </Dialog>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, PropType} from "vue";
import Dialog from "@/dialogs/core/Dialog.vue";
import CommitButton from "@/dialogs/core/CommitButton.vue";
import DialogButton from "@/dialogs/core/DialogButton.vue";
import {DialogController, DialogMode} from "@/dialogs/core/DialogController";
import {DownloaderState, EntityDownloader} from "@/utils/downloader/EntityDownloader";
import {CoreConfig} from "@/config/CoreConfig.ts";

export default defineComponent({
  name: "DownloadDialog",
  components: {DialogButton, CommitButton, Dialog},
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

    const cryptoName = CoreConfig.inject().cryptoName

    const handleSave = () => {
      const blob = props.downloader.csvBlob.value
      if (blob !== null) {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.setAttribute('href', url)
        a.setAttribute('download', props.downloader.getOutputName(cryptoName));
        a.click()
      }
    }

    const handleDownload = () => {
      props.controller.mode.value = DialogMode.Busy
      props.downloader.run()
          .then(() => {
            switch (props.downloader.state.value) {
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

    return {
      busyMessage,
      successMessage,
      successMessage2,
      successMessage3,
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
