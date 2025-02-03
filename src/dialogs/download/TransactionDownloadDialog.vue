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
  <DownloadDialog v-model:show-dialog="showDialog" :downloader="downloader" :download-enabled="downloadEnabled">

    <template #downloadDialogTitle>{{ dialogTitle }}</template>

    <template #downloadDialogInput>
      <div class="columns">
        <p class="column is-one-fifth has-text-weight-light">
          Select scope:
        </p>
        <div class="column is-two-fifths">
          <SelectView v-model="selectedScope" :small="true">
            <option v-for="s in scopes" v-bind:key="s" v-bind:value="s">
              {{ s }}
            </option>
          </SelectView>
        </div>
        <div v-if="selectedScope==='TOKEN TRANSFERS BY ID' || selectedScope==='NFT TRANSFERS BY ID'"
             class="column is-two-fifths">
          <input class="input is-small has-text-left has-text-white" type="text" placeholder="ENTER TOKEN ID"
                 :class="{'has-text-grey': !tokenId}"
                 :value="tokenId"
                 @input="handleInput"
                 style="min-width: 13rem; max-width: 13rem; height:26px; margin-top: 1px; border-radius: 4px; border-width: 1px; background-color: var(--h-theme-box-background-color)">
          <span v-if="topicIdFeedback=='valid'" class="icon is-small has-text-success ml-2"><i class="fas fa-check"></i></span>
          <span v-else-if="topicIdFeedback=='invalid'" class="icon is-small has-text-danger ml-2"><i
              class="fas fa-times"></i></span>
        </div>
        <div v-else-if="selectedScope==='TRANSACTION TYPE'" class="column is-two-fifths">
          <TransactionFilterSelect v-model:selected-filter="selectedFilter"/>
        </div>
      </div>
      <div class="columns">
        <p class="column is-one-fifth has-text-weight-light">
          Start date:
        </p>
        <div class="column is-two-fifths is-flex is-align-items-center">
          <Datepicker
              v-model="selectedStartDate"
              placeholder="SELECT A DATE"
              :is-24="false"
              :enable-time-picker="false" dark
              :teleport="true"/>
        </div>
        <div v-if="!isStartDateValid" class="column icon is-small has-text-danger">
          <i class="fas fa-times"></i>
        </div>
      </div>
      <div class="columns">
        <p class="column is-one-fifth has-text-weight-light">
          End date:
        </p>
        <div class="column is-two-fifths ">
          <Datepicker
              v-model="selectedEndDate"
              placeholder="SELECT A DATE"
              :is-24="false"
              :enable-time-picker="false" dark
              :teleport="true"/>
        </div>
        <div v-if="!isEndDateValid" class="column icon is-small has-text-danger">
          <i class="fas fa-times"></i>
        </div>
      </div>
    </template>

  </DownloadDialog>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import DownloadDialog from "@/dialogs/download/DownloadDialog.vue";
import {computed, ref, watch} from "vue";
import {AbstractTransactionDownloader} from "@/utils/downloader/AbstractTransationDownloader.ts";
import {TokenTransferDownloader} from "@/utils/downloader/TokenTransferDownloader.ts";
import {NFTTransferDownloader} from "@/utils/downloader/NFTTransferDownloader.ts";
import {HbarTransferDownloader} from "@/utils/downloader/HBarTransferDownloader.ts";
import {TransactionDownloader} from "@/utils/downloader/TransactionDownloader.ts";
import {TransactionType} from "@/schemas/MirrorNodeSchemas.ts";
import {EntityID} from "@/utils/EntityID.ts";
import {TokenInfoCache} from "@/utils/cache/TokenInfoCache.ts";
import SelectView from "@/elements/SelectView.vue";
import TransactionFilterSelect from "@/components/transaction/TransactionFilterSelect.vue";
import Datepicker from "@vuepic/vue-datepicker";


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


const dialogTitle = computed(() => "Download transactions from " + props.accountId)

const accountId = computed(() => props.accountId ?? null)
const scopes = [
  'HBAR TRANSFERS',
  'TOKEN TRANSFERS',
  'TOKEN TRANSFERS BY ID',
  'NFT TRANSFERS',
  'NFT TRANSFERS BY ID',
  'TRANSACTION TYPE'
]
const selectedScope = ref<string>("HBAR TRANSFERS")
const selectedFilter = ref<string>("CRYPTOTRANSFER")
const tokenId = ref<string | null>(null)
const isTokenIdRequired = computed(
    () => selectedScope.value === 'TOKEN TRANSFERS BY ID' || selectedScope.value === 'NFT TRANSFERS BY ID'
)
const isTokenIdValid = ref(false)
const topicIdFeedback = ref<string>('')

const lastMidnight = new Date(new Date().setHours(0, 0, 0, 0))
const nextMidnight = new Date(new Date().setHours(24, 0, 0, 0))

const selectedStartDate = ref<Date | null>(new Date())
const startDate = computed<Date | null>(() => {
      let result
      if (selectedStartDate.value != null) {
        result = new Date(selectedStartDate.value)
        result.setHours(0, 0, 0, 0)
      } else {
        result = null
      }
      return result
    }
)
const isStartDateValid = computed(
    () => startDate.value !== null && startDate.value <= lastMidnight
)

const selectedEndDate = ref<Date | null>(new Date())
const endDate = computed<Date | null>(() => {
      let result
      if (selectedEndDate.value != null) {
        result = new Date(selectedEndDate.value)
        result.setHours(24, 0, 0, 0)
      } else {
        result = null
      }
      return result
    }
)
const isEndDateValid = computed(
    () => endDate.value !== null
        && endDate.value <= nextMidnight
        && (startDate.value == null || startDate.value < endDate.value)
)

const transactionType = computed(
    () => selectedFilter.value !== '' ? selectedFilter.value as TransactionType : null
)

const downloader = computed<AbstractTransactionDownloader>(() => {
  let result: AbstractTransactionDownloader
  if (selectedScope.value === 'TOKEN TRANSFERS' || selectedScope.value === 'TOKEN TRANSFERS BY ID') {
    result = new TokenTransferDownloader(accountId, startDate, endDate, tokenId, 1000)
  } else if (selectedScope.value === 'NFT TRANSFERS' || selectedScope.value === 'NFT TRANSFERS BY ID') {
    result = new NFTTransferDownloader(accountId, startDate, endDate, tokenId, 1000)
  } else if (selectedScope.value === 'HBAR TRANSFERS') {
    result = new HbarTransferDownloader(accountId, startDate, endDate, 1000)
  } else {
    result = new TransactionDownloader(accountId, startDate, endDate, transactionType, 1000)
  }
  return result
})

const downloadEnabled = computed(() => {
  return isStartDateValid.value
      && isEndDateValid.value
      && (!isTokenIdRequired.value || isTokenIdValid.value)
})

let validationTimerId = -1
watch(tokenId, () => {
  isTokenIdValid.value = false
  topicIdFeedback.value = ''

  if (validationTimerId != -1) {
    window.clearTimeout(validationTimerId)
    validationTimerId = -1
  }
  if (tokenId.value?.length) {
    validationTimerId = window.setTimeout(() => validate(), 500)
  } else {
    tokenId.value = null
  }
})

const validate = async () => {
  let entity = EntityID.normalize(tokenId.value ?? '')
  isTokenIdValid.value = entity != null && await TokenInfoCache.instance.lookup(entity) != null
  topicIdFeedback.value = isTokenIdValid.value ? 'valid' : 'invalid'
}

const handleInput = (event: Event) => {
  const input = (event.target as HTMLInputElement).value
  const previousValue = tokenId.value
  let isValidInput = true
  let pastDigits = 0
  let pastDots = 0

  for (const c of input) {
    if ((c >= '0' && c <= '9') || c === '.') {
      if (c === '.') {
        if (++pastDots > 2 || !pastDigits) {
          isValidInput = false
          break
        } else {
          pastDigits = 0
        }
      } else if (++pastDigits > 10) {
        isValidInput = false
        break
      }
    } else {
      isValidInput = false
      break
    }
  }

  if (isValidInput) {
    tokenId.value = input
  } else {
    tokenId.value = ""
    tokenId.value = previousValue
  }
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
