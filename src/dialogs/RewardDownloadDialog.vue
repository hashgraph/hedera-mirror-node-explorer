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
  <DownloadDialog :controller="controller" :downloader="downloader" :download-enabled="true">

    <!-- title -->
    <template v-slot:dialogTitle>
      <DialogTitle>
          <span>
            <span class="h-is-primary-title">Download rewards</span>
            <span v-if="accountId" class="h-is-tertiary-text"> for account {{ accountId }}</span>
          </span>
      </DialogTitle>
    </template>

    <!-- input -->
    <template v-slot:dialogInput>
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
    </template>

  </DownloadDialog>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, ref} from "vue";
import {DialogController} from "@/dialogs/core/dialog/DialogController.ts";
import {RewardDownloader} from "@/utils/downloader/RewardDownloader.ts";
import DownloadDialog from "@/components/download/DownloadDialog.vue";
import DialogTitle from "@/dialogs/core/dialog/DialogTitle.vue";
import SelectView from "@/components/SelectView.vue";


const props = defineProps({
  accountId: {
    type: String,
    required: true
  }
})

const visible = defineModel("visible", {
  type: Boolean,
  required: true
})

enum Period { Day = 1, Week = 7, Month = 30, Year = 365 }
const periodOption = ref(1)

//
// Dialog controller
//

const controller = new DialogController(visible)


//
// Rewards transaction downloader
//

const accountId = computed(() => props.accountId)
const startDate = computed(() => {
  const now = new Date()
  const result = new Date(now.getTime());
  result.setDate(now.getDate() - periodOption.value);
  return result
})
const endDate = ref(null)
const downloader = new RewardDownloader(accountId, startDate, endDate, 1000)

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
