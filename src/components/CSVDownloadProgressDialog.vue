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

  <div :class="{'is-active': showProgressDialog}" class="modal has-text-white">
    <div class="modal-background"/>
    <div class="modal-content" style="width: 768px; border-radius: 16px">
      <div class="box">
        <div class="is-flex is-justify-content-space-between is-align-items-self-end">
          <span>
            <span class="h-is-primary-title">Download transactions</span>
            <span v-if="accountId" class="h-is-tertiary-text"> for account {{ accountId }}</span>
          </span>
          <a @click="handleAbort">
            <img alt="Search bar" src="@/assets/close-icon.png" style="max-height: 20px;">
          </a>
        </div>

        <hr class="h-card-separator"/>

        <progress id="progress" :value="progress" class="progress is-large is-info mt-5"></progress>

        <div>
          <span>{{ statusMessage }}</span>
          <span class="has-text-grey is-numeric ml-2">{{ feedbackMessage }}</span>
        </div>
        <br/>

        <div class="is-flex is-justify-content-flex-end">
          <button class="button is-white is-small" @click="handleAbort">CANCEL</button>
          <button :disabled="!enableSaveButton"
                  class="button is-info is-small ml-4" @click="handleSave">SAVE
          </button>
        </div>

      </div>
    </div>
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, PropType} from "vue";
import {DownloaderState, EntityDownloader} from "@/utils/downloader/EntityDownloader";
import {CoreConfig} from "@/config/CoreConfig.ts";

export default defineComponent({
  name: "CSVDownloadProgressDialog",

  props: {
    showProgressDialog: {
      type: Boolean,
      default: false
    },
    downloader: {
      type: Object as PropType<EntityDownloader<unknown, unknown>>,
      required: true
    },
    accountId: String as PropType<string | undefined>
  },

  emits: ["update:showProgressDialog"],

  setup(props, context) {

    const cryptoName = CoreConfig.inject().cryptoName
    const enableSaveButton = computed(() => props.downloader.csvBlob.value !== null)

    const statusMessage = computed(() => {
      const state = props.downloader.state.value
      return state === DownloaderState.Completed ? "Download completed:"
          : state === DownloaderState.Failure ? "Download failed:"
              : "Downloading:"
    })

    const feedbackMessage = computed(() => {
      const state = props.downloader.state.value
      const items = props.downloader.downloadedCount.value
      let message
      if (state === DownloaderState.Completed) {
        if (items === 0) {
          message = "No item to download"
        } else if (!props.downloader.drained.value) {
          message = "The maximum of " + props.downloader.maxEntityCount + " downloaded items was hit"
        } else {
          message = items + " " + (items > 1 ? "items" : "item")
        }
      } else if (state === DownloaderState.Failure) {
        message = props.downloader.failureReason.value
      } else if (items > 0) {
        message = items + " " + (items > 1 ? "items" : "item")
      } else {
        message = ""
      }
      return message
    })

    const handleAbort = () => {
      props.downloader.abort()
          .then(() => {
            context.emit('update:showProgressDialog', false)
          })
    }

    const handleSave = () => {
      const blob = props.downloader.csvBlob.value
      if (blob !== null) {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.setAttribute('href', url)
        a.setAttribute('download', props.downloader.getOutputName(cryptoName));
        a.click()
      }
      context.emit('update:showProgressDialog', false)
    }

    return {
      enableSaveButton,
      statusMessage,
      feedbackMessage,
      progress: props.downloader.progress,
      handleAbort,
      handleSave
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>

