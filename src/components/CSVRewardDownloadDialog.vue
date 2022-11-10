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
              <o-select v-model="periodOption" class="h-is-text-size-1" style="border-radius: 4px">
                <option :key="Period.ThisYear" :value="Period.ThisYear" style="background-color: var(--h-theme-box-background-color)">
                  This calendar year
                </option>
                <option :key="Period.ThisMonth" :value="Period.ThisMonth" style="background-color: var(--h-theme-box-background-color)">
                  This month
                </option>
              </o-select>
            </o-field>
          </div>
        </div>

        <div class="is-flex is-justify-content-flex-end">
          <button class="button is-white is-small" @click="handleCancel">CANCEL</button>
          <button :disabled="!enableDownloadButton"
                  class="button is-info is-small ml-4" @click="handleDownload">DOWNLOAD
          </button>
        </div>

      </div>
    </div>
  </div>

  <CSVDownloadProgressDialog v-model:show-progress-dialog="showProgressDialog" :downloader="downloader"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, ref} from "vue";
import CSVDownloadProgressDialog from "@/components/CSVDownloadProgressDialog.vue";
import {RewardTransactionDownloader} from "@/utils/downloader/RewardTransactionDownloader";

export default defineComponent({
  name: "CSVRewardDownloadDialog",
  components: {CSVDownloadProgressDialog},
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
  emits: ["update:showDialog"],
  setup(props, context) {
    enum Period { ThisYear = 1, ThisMonth = 2 }

    const showProgressDialog = ref(false)
    const enableDownloadButton = computed(() => downloader.accountId.value != null)
    const periodOption = ref(1)
    const startDate = computed(() => {
      let result
      const now = new Date()
      switch (periodOption.value) {
        case Period.ThisYear:
          result = new Date(now.getFullYear(), 0, 1)
          break
        case Period.ThisMonth:
        default:
          result = new Date(now.getFullYear(), now.getMonth(), 1)
          break
      }
      return result
    })
    const endDate = computed(() => null)

    const downloader = new RewardTransactionDownloader(
        computed(() => props.accountId),
        startDate,
        endDate,
        10000)

    const handleCancel = () => {
      context.emit('update:showDialog', false)
    }

    const handleDownload = () => {
      downloader.run()
          .then(() => {
            console.log("Download completed")
            console.log("state: " + downloader.state.value)
            console.log("csvBlob: " + downloader.csvBlob.value)
            console.log("failureReason: " + downloader.failureReason.value)
            console.log("downloadedCount: " + downloader.downloadedCount.value)
            console.log("drained: " + downloader.drained.value)
          })
      showProgressDialog.value = true
      context.emit('update:showDialog', false)
    }

    return {
      showProgressDialog,
      enableDownloadButton,
      downloader,
      periodOption,
      progress: downloader.progress,
      handleCancel,
      handleDownload,
      Period
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>

