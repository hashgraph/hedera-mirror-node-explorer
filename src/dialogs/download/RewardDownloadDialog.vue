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
  <DownloadDialog :controller="controller">

    <template #downloadDialogTitle>
      <span>
        <span>Download rewards</span>
        <span v-if="accountId"> for account {{ accountId }}</span>
      </span>
    </template>

    <template #downloadDialogInput>
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

import {computed} from "vue";
import DownloadDialog from "@/dialogs/download/DownloadDialog.vue";
import SelectView from "@/elements/SelectView.vue";
import {Period, RewardDownloadController} from "@/dialogs/download/RewardDownloadController.ts";

const showDialog = defineModel("showDialog", {
  type: Boolean,
  required: true
})

const props = defineProps({
  accountId: {
    type: String,
    required: true
  }
})

const accountId = computed(() => props.accountId)
const controller = new RewardDownloadController(showDialog, accountId)
const periodOption = controller.periodOption

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
