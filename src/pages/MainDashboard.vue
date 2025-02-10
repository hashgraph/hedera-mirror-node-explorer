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

  <PageHeader page-title="Dashboard"/>

  <div class="h-page-content">
    <div class="dashboard-title">
      Network
    </div>
    <div class="dashboard-separator"/>
    <div class="dashboard-content">
      <div style="height:300px; width: 100%; background-color: #222222"/>
    </div>
    <div class="dashboard-content">
      <div style="height:300px; width: 100%; background-color: #222222"/>
    </div>

    <div class="dashboard-title">
      Accounts
    </div>
    <div class="dashboard-separator"/>
    <div class="dashboard-content">
      <div style="height:300px; width: 100%; background-color: #222222"/>
    </div>
  </div>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {onBeforeUnmount, onMounted, ref, watch} from 'vue';
import {TransactionType} from "@/schemas/MirrorNodeSchemas";
import {TransactionTableController} from "@/components/transaction/TransactionTableController";
import {useRouter} from "vue-router";
import Footer from "@/components/page/Footer.vue";
import PageHeader from "@/components/page/header/PageHeader.vue";

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

div.dashboard-title {
  color: var(--text-primary);
  font-family: 'Styrene A Web', serif;
  font-size: 20px;
  font-weight: 500;
  line-height: 26px;
  margin-top: 12px;
}

@media (min-width: 1080px) {
  div.dashboard-title {
    font-size: 32px;
    font-weight: 400;
    line-height: 42px;
    margin-top: 8px;
  }
}

div.dashboard-separator {
  background-color: var(--network-button-color);
  height: 2px;
  width: 100%;
}

div.dashboard-content {
  background-color: var(--background-tertiary);
  border: 1px solid var(--table-border);
  border-radius: 16px;
  padding: 16px;
}

@media (min-width: 1080px) {
  div.dashboard-content {
    padding: 32px;
  }
}

</style>
