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

  <MainDashboardHeader/>

  <div class="h-page-content">
    <div class="dashboard-title">
      Network
    </div>

    <div class="dashboard-separator"/>

    <div class="dashboard-content">
      <ChartView :controller="tpsController">
        <template #chartViewExtra>{{ currentTPS }}</template>
      </ChartView>
    </div>

    <div class="dashboard-content">
      <ChartView :controller="networkFeeController"/>
    </div>

    <div class="dashboard-title">
      Accounts
    </div>

    <div class="dashboard-separator"/>

    <div class="dashboard-content">
      <ChartView :controller="activeAccountsController"/>
    </div>
  </div>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {onBeforeUnmount, onMounted} from 'vue';
import Footer from "@/components/page/Footer.vue";
import MainDashboardHeader from "@/components/page/header/MainDashboardHeader.vue";
import {TPSController} from "@/charts/hgraph/TPSController.ts";
import ChartView from "@/charts/core/ChartView.vue";
import {NetworkFeeController} from "@/charts/hgraph/NetworkFeeController.ts";
import {GenericMetricController} from "@/charts/hgraph/GenericMetricController.ts";
import {TPSMetricLoader} from "@/components/dashboard/metrics/TPSMetricLoader.ts";
import {ChartRange} from "@/charts/core/ChartController.ts";

defineProps({
  network: String
})

const tpsController = new TPSController()
onMounted(() => tpsController.mount())
onBeforeUnmount(() => tpsController.unmount())

const tpsMetricLoader = new TPSMetricLoader()
const currentTPS = tpsMetricLoader.currentTPS
onMounted(() => tpsMetricLoader.mount())
onBeforeUnmount(() => tpsMetricLoader.unmount())

const networkFeeController = new NetworkFeeController()
onMounted(() => networkFeeController.mount())
onBeforeUnmount(() => networkFeeController.unmount())

const activeAccountsController = new GenericMetricController(
    "Active Accounts",
    "active_accounts",
    [ChartRange.year, ChartRange.all]
)
onMounted(() => activeAccountsController.mount())
onBeforeUnmount(() => activeAccountsController.unmount())

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
