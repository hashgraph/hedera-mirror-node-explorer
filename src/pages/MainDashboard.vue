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

  <PageFrameV2 page-title="Dashboard">

    <div class="page-container">

      <DashboardCardV2 data-cy="cryptoTransfers">
        <template #title>
          <span>Crypto Transfers</span>
        </template>
        <template #left-control>
          <PlayPauseButtonV2 :controller="cryptoTableController"/>
        </template>
        <template #right-control>
          TBD: 'All Crypto Transfers' link
        </template>
        <template #content>
          <SimpleTransactionTable :controller="cryptoTableController"/>
        </template>
      </DashboardCardV2>

      <div class="side-by-side-container">

        <DashboardCardV2 data-cy="smartContractCalls">
          <template #title>
            <span>Smart Contract Calls</span>
          </template>
          <template #left-control>
            <PlayPauseButtonV2 :controller="contractTableController"/>
          </template>
          <template #right-control>
            TBD: 'All Smart Contract Calls' link
          </template>
          <template #content>
            <SimpleTransactionTable :controller="contractTableController"/>
          </template>
        </DashboardCardV2>
        <DashboardCardV2 data-cy="hcsMessages">
          <template #title>
            <span>HCS Messages</span>
          </template>
          <template #left-control>
            <PlayPauseButtonV2 :controller="messageTableController"/>
          </template>
          <template #right-control>
            TBD: 'All HCS Messages' link
          </template>
          <template #content>
            <MessageTransactionTable v-bind:controller="messageTableController"/>
          </template>
        </DashboardCardV2>

      </div>

    </div>

  </PageFrameV2>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {onBeforeUnmount, onMounted, ref, watch} from 'vue';
import SimpleTransactionTable from "@/components/dashboard/SimpleTransactionTable.vue";
import MessageTransactionTable from "@/components/dashboard/MessageTransactionTable.vue";
import {TransactionType} from "@/schemas/MirrorNodeSchemas";
import PageFrameV2 from "@/components/page/PageFrameV2.vue";
import {TransactionTableController} from "@/components/transaction/TransactionTableController";
import {useRouter} from "vue-router";
import DashboardCardV2 from "@/components/DashboardCardV2.vue";
import PlayPauseButtonV2 from "@/components/PlayPauseButtonV2.vue";

const props = defineProps({
  network: String
})

const router = useRouter()
const topPageSize = ref(6)
const bottomPageSize = ref(6)

const cryptoTableController = new TransactionTableController(
    router, topPageSize, TransactionType.CRYPTOTRANSFER, "", null, "p1", "k1")

const messageTableController = new TransactionTableController(
    router, bottomPageSize, TransactionType.CONSENSUSSUBMITMESSAGE, "", null, "p2", "k2")

const contractTableController = new TransactionTableController(
    router, bottomPageSize, TransactionType.CONTRACTCALL, "", null, "p3", "k3")

onMounted(() => {
  cryptoTableController.mount()
  messageTableController.mount()
  contractTableController.mount()
})

onBeforeUnmount(() => {
  cryptoTableController.unmount()
  messageTableController.unmount()
  contractTableController.unmount()
})

watch(() => props.network, () => {
  cryptoTableController.reset()
  messageTableController.reset()
  contractTableController.reset()
  cryptoTableController.startAutoRefresh()
  messageTableController.startAutoRefresh()
  contractTableController.startAutoRefresh()
})

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

div.side-by-side-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 1280px) {
  div.side-by-side-container {
    display: grid;
    gap: 16px;
    grid-template-columns: 1fr 1fr;
  }
}

</style>
