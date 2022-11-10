<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2022 Hedera Hashgraph, LLC
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
          <span>
            <span class="h-is-primary-title">Download transactions</span>
            <span v-if="accountId" class="h-is-tertiary-text"> for account {{ accountId }}</span>
          </span>
          <a @click="handleCancel">
            <img alt="" src="@/assets/close-icon.png" style="max-height: 20px;">
          </a>
        </div>

        <hr class="h-card-separator"/>

        <div class="columns">
          <div class="column is-one-third has-text-weight-light">
            Select period
          </div>
          <div class="column">
            <o-field>
              <o-select class="h-is-text-size-1" style="border-radius: 4px">
                <option value="1" style="background-color: var(--h-theme-box-background-color)">
                  1 month
                </option>
              </o-select>
            </o-field>
          </div>
        </div>

        <div class="is-flex is-justify-content-flex-end">
          <button class="button is-white is-small" @click="handleCancel">CANCEL</button>
          <button class="button is-info is-small ml-4"
                  :disabled="!enableDownloadButton" @click="handleDownload">DOWNLOAD</button>
        </div>

      </div>
    </div>
  </div>

  <div :class="{'is-active': showProgressDialog}" class="modal has-text-white">
    <div class="modal-background"/>
    <div class="modal-content" style="width: 768px; border-radius: 16px">
      <div class="box">
        <div class="is-flex is-justify-content-space-between is-align-items-self-end">
          <span>
            <span class="h-is-primary-title">Download transactions</span>
            <span v-if="accountId" class="h-is-tertiary-text"> for account {{ accountId }}</span>
          </span>
          <a @click="handleCancel">
            <img alt="Search bar" src="@/assets/close-icon.png" style="max-height: 20px;">
          </a>
        </div>

        <hr class="h-card-separator"/>

        <progress id="progress" class="progress is-large is-info mt-5" :value="progress"></progress>

        <div class="is-flex is-justify-content-flex-end">
          <button class="button is-white is-small" @click="handleAbort">CANCEL</button>
          <button class="button is-info is-small ml-4"
                  :disabled="!enableSaveButton" @click="handleSave">SAVE</button>
        </div>

      </div>
    </div>
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, ref} from "vue";
import {TransactionDownloader} from "@/utils/downloader/TransactionDownloader";
import {DownloaderState} from "@/utils/downloader/EntityDownloader";

export default defineComponent({
  name: "CSVDownloadDialog",
  components: {},
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    accountId: {
      type: String,
      required: true
    }
  },
  emits: [ "update:showDialog"],
  setup(props, context) {

    const showProgressDialog = ref(false)
    const enableDownloadButton = computed(() => downloader.state.value === DownloaderState.Fresh)
    const enableSaveButton = computed(() => downloader.csvBlob.value != null)

    const startDate = new Date(2022, 10, 1)
    const endDate = new Date(2022, 11, 1)
    const maxTransactionCount = 10000
    const downloader = new TransactionDownloader(
        computed(() => props.accountId),
        computed(() => startDate),
        computed(() => endDate),
        maxTransactionCount)

    const handleCancel = () => {
      context.emit('update:showDialog', false)
    }

    const handleDownload = () => {
      downloader.run()
          .then(() => {
            console.log("Download completed")
          })
      showProgressDialog.value = true
    }

    const handleAbort = () => {
      downloader.abort()
          .then(() => {
            console.log("Download aborted")
          })
      showProgressDialog.value = false
    }

    const handleSave = () => {
      const url = window.URL.createObjectURL(downloader.csvBlob.value)
      const a = document.createElement('a')
      a.setAttribute('href', url)
      a.setAttribute('download', downloader.getOutputName());
      a.click()
    }

    return {
      showProgressDialog,
      enableDownloadButton,
      enableSaveButton,
      progress: downloader.progress,
      handleCancel,
      handleDownload,
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

