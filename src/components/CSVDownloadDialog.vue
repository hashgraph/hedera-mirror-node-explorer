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
            <SelectView v-model="periodOption">
              <option :key="Period.Day" :value="Period.Day"
                      style="background-color: var(--h-theme-box-background-color)">
                LAST 24 HOURS
              </option>
              <option :key="Period.Week" :value="Period.Week"
                      style="background-color: var(--h-theme-box-background-color)">
                LAST 7 DAYS
              </option>
              <option :key="Period.Month" :value="Period.Month"
                      style="background-color: var(--h-theme-box-background-color)">
                LAST 30 DAYS
              </option>
              <option :key="Period.Year" :value="Period.Year"
                      style="background-color: var(--h-theme-box-background-color)">
                LAST 365 DAYS
              </option>
            </SelectView>
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

  <CSVDownloadProgressDialog
      v-model:show-progress-dialog="showProgressDialog"
      :downloader="downloader"
      :account-id="accountId"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, onMounted, PropType, ref, watch} from "vue";
import CSVDownloadProgressDialog from "@/components/CSVDownloadProgressDialog.vue";
import {EntityDownloader} from "@/utils/downloader/EntityDownloader";
import SelectView from "@/components/SelectView.vue";

export default defineComponent({
  name: "CSVDownloadDialog",
  components: {SelectView, CSVDownloadProgressDialog},
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    downloader: {
      type: Object as PropType<EntityDownloader<unknown, unknown>>,
      required: true
    },
    accountId: String as PropType<string | undefined>
  },
  emits: ["update:showDialog"],
  setup(props, context) {
    enum Period { Day = 1, Week = 7, Month = 30, Year = 365 }

    const showProgressDialog = ref(false)
    const enableDownloadButton = computed(() => props.accountId != null)

    const periodOption = ref(1)
    onMounted(() => adjustDates())
    watch(periodOption, () => adjustDates())
    const adjustDates = () => {
      const downloader = props.downloader
      const now = new Date()
      const daysAgo = new Date(now.getTime());
      daysAgo.setDate(now.getDate() - periodOption.value);
      downloader.startDate.value = daysAgo
      downloader.endDate.value = null
    }

    const handleCancel = () => {
      context.emit('update:showDialog', false)
    }

    const handleDownload = () => {
      props.downloader.run()
      showProgressDialog.value = true
      context.emit('update:showDialog', false)
    }

    return {
      showProgressDialog,
      enableDownloadButton,
      periodOption,
      progress: props.downloader.progress,
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

