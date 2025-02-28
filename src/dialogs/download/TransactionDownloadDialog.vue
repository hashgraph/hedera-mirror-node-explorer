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
  <DownloadDialog :controller="controller" :width="450">

    <template #downloadDialogTitle>{{ dialogTitle }}</template>

    <template #downloadDialogInput>

      <div class="download-hint">
        This will download the transaction history of the account as a CSV file.
      </div>

      <ContentCell>
        <template #cellTitle>Select Scope:</template>
        <template #cellContent>

          <div style="display: flex; align-items: center; column-gap: 12px; width: 100%;">

            <SelectView v-model="selectedScope" :small="true">
              <option v-for="s in scopes" v-bind:key="s" v-bind:value="s">
                {{ s }}
              </option>
            </SelectView>

            <template v-if="tokenIdRequired">
              <TextFieldView
                  v-model="tokenInput"
                  placeholder="Token ID (0.0.1234)"
                  :small="true"
                  style="width: 100%"/>
            </template>
            <template v-else-if="selectedScope==='TRANSACTION TYPE'">
              <TransactionFilterSelect v-model:selected-filter="selectedFilter" style="width: 100%"/>
            </template>

          </div>

        </template>
      </ContentCell>

      <ContentCell>
        <template #cellTitle>Start date:</template>
        <template #cellContent>
          <Datepicker
              v-model="selectedStartDate"
              placeholder="SELECT A DATE"
              :is-24="false"
              :enable-time-picker="false"
              :dark="darkSelected"
              :teleport="true"/>
        </template>
      </ContentCell>

      <ContentCell>
        <template #cellTitle>End date:</template>
        <template #cellContent>
          <Datepicker
              v-model="selectedEndDate"
              placeholder="SELECT A DATE"
              :is-24="false"
              :enable-time-picker="false"
              :dark="darkSelected"
              :teleport="true"/>
        </template>
      </ContentCell>

    </template>

    <template #downloadDialogControls>{{ feedbackMessage }}</template>

  </DownloadDialog>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed} from "vue";
import DownloadDialog from "@/dialogs/download/DownloadDialog.vue";
import SelectView from "@/elements/SelectView.vue";
import TransactionFilterSelect from "@/components/transaction/TransactionFilterSelect.vue";
import Datepicker from "@vuepic/vue-datepicker";
import {ThemeController} from "@/components/ThemeController.ts";
import ContentCell from "@/dialogs/core/ContentCell.vue";
import TextFieldView from "@/elements/TextFieldView.vue";
import {NetworkConfig} from "@/config/NetworkConfig.ts";
import {scopes, TransactionDownloadController} from "@/dialogs/download/TransactionDownloadController.ts";


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

const darkSelected = ThemeController.inject().darkSelected

const dialogTitle = computed(() => "Download transactions from " + props.accountId)

const accountId = computed(() => props.accountId ?? null)

const networkConfig = NetworkConfig.inject()
const controller = new TransactionDownloadController(showDialog, accountId, networkConfig)
const selectedScope = controller.selectedScope
const selectedFilter = controller.selectedFilter
const tokenInput = controller.tokenController.inputText
const selectedStartDate = controller.selectedStartDate
const selectedEndDate = controller.selectedEndDate
const feedbackMessage = controller.feedbackMessage
const tokenIdRequired = controller.tokenIdRequired

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.download-hint {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 400;
}

</style>
