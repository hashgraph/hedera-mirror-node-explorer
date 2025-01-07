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

  <CSVDownloadDialog
      v-if="accountId"
      v-model:show-dialog="showDownloadDialog"
      :downloader="downloader"
      :account-id="accountId"
  />

  <DashboardCardV2 v-if="accountId" collapsible-key="myRecentRewards">
    <template #title>
      <span>Recent Staking Rewards</span>
    </template>
    <template #right-control>
      <DownloadButton @click="showDownloadDialog = true"/>
    </template>
    <template #content>
      <StakingRewardsTable :controller="transactionTableController"/>
    </template>
  </DashboardCardV2>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {onBeforeUnmount, onMounted, ref} from 'vue';
import DashboardCardV2 from "@/components/DashboardCardV2.vue";
import {walletManager} from "@/router.ts";
import DownloadButton from "@/components/DownloadButton.vue";
import StakingRewardsTable from "@/components/staking/StakingRewardsTable.vue";
import {StakingRewardsTableController} from "@/components/staking/StakingRewardsTableController.ts";
import {AppStorage} from "@/AppStorage.ts";
import {RewardDownloader} from "@/utils/downloader/RewardDownloader.ts";
import CSVDownloadDialog from "@/components/CSVDownloadDialog.vue";
import {useRouter} from "vue-router";

const router = useRouter()
const showDownloadDialog = ref(false)
const accountId = walletManager.accountId

//
// Rewards Transactions Table Controller
//
const pageSize = ref(6)
const transactionTableController = new StakingRewardsTableController(
    router,
    accountId,
    pageSize,
    AppStorage.STAKING_TABLE_PAGE_SIZE_KEY
)
onMounted(() => transactionTableController.mount())
onBeforeUnmount(() => transactionTableController.unmount())

//
// Rewards transaction downloader
//
const downloader = new RewardDownloader(accountId, ref(null), ref(null), 1000)

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
