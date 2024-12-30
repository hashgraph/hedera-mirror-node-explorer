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

  <PageFrameV2 page-title="Contracts">

    <div class="page-container">
      <DashboardCardV2>
        <template #title>
          <span>Recent Contracts</span>
        </template>
        <template #left-control>
          <PlayPauseButton v-if="!filterVerified" :controller="contractTableController"/>
          <PlayPauseButton v-else :controller="verifiedContractsController"/>
        </template>
        <template #right-control>
          <div class="verify-switch">
            <div class="switch-text">All</div>
            <o-field style="margin-bottom: 0;">
              <o-switch v-model="filterVerified"/>
            </o-field>
            <div class="switch-text">Verified</div>
          </div>
        </template>
        <template #content>
          <ContractTable
              v-if="!filterVerified"
              :controller="contractTableController"
          />
          <VerifiedContractsTable
              v-else
              :controller="verifiedContractsController"
              :loaded="loaded"
              :overflow="overflow"
          />
        </template>
      </DashboardCardV2>
    </div>

  </PageFrameV2>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {inject, ref} from 'vue';
import ContractTable from "@/components/contract/ContractTable.vue";
import PageFrameV2 from "@/components/page/PageFrameV2.vue";
import PlayPauseButton from "@/components/PlayPauseButton.vue";
import {ContractTableController} from "@/components/contract/ContractTableController";
import {useRouter} from "vue-router";
import VerifiedContractsTable from "@/components/account/VerifiedContractsTable.vue";
import {VerifiedContractsController} from "@/components/contract/VerifiedContractsController";
import {VerifiedContractsCache} from "@/utils/cache/VerifiedContractsCache";
import {AppStorage} from "@/AppStorage";
import DashboardCardV2 from "@/components/DashboardCardV2.vue";

defineProps({
  network: String
})

const isMediumScreen = inject('isMediumScreen', true)

const filterVerified = ref(false)

//
// ContractTableController
//
const perPage = ref(isMediumScreen ? 15 : 10)
const contractTableController = new ContractTableController(useRouter(), perPage)
const verifiedContractsController = new VerifiedContractsController(
    VerifiedContractsCache.instance.makeLookup(),
    perPage,
    AppStorage.CONTRACT_TABLE_PAGE_SIZE_KEY
)
const loaded = verifiedContractsController.loaded
const overflow = verifiedContractsController.overflow

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.page-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-left: 32px;
  margin-right: 32px;
}

div.verify-switch {
  align-items: center;
  display: flex;
  gap: 8px;
}

div.switch-text {
  font-family: 'Styrene A Web', serif;
  font-size: 14px;
  font-weight: 400;
  height: 18px;
  vertical-align: center;
}

</style>
