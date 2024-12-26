<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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
  <div class="div">

    <TabItem :tabId="TabId.Dashboard"
                 :target-route="routeManager.makeRouteToMainDashboard()"/>
    <TabItem :tabId="TabId.Transactions"
                 :target-route="routeManager.makeRouteToTransactions()"/>
    <TabItem :tabId="TabId.Tokens"
                 :target-route="routeManager.makeRouteToTokens()"/>
    <TabItem :tabId="TabId.Topics"
                 :target-route="routeManager.makeRouteToTopics()"/>
    <TabItem :tabId="TabId.Contracts"
                 :target-route="routeManager.makeRouteToContracts()"/>
    <TabItem :tabId="TabId.Accounts"
                 :target-route="routeManager.makeRouteToAccounts()"/>
    <TabItem :tabId="TabId.Nodes"
                 :target-route="routeManager.makeRouteToNodes()"/>
    <TabItem v-if="enableStaking"
                 :tabId="TabId.Staking"
                 :target-route="routeManager.makeRouteToStaking()"/>
    <TabItem :tabId="TabId.Blocks"
                 :target-route="routeManager.makeRouteToBlocks()"/>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {routeManager} from "@/router.ts"
import {TabId} from "@/utils/RouteManager.ts"
import TabItem from "@/components/page/header/TabItem.vue";

const enableStaking = routeManager.enableStaking

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

.div {
  align-items: baseline;
  column-gap: 16px;
  display: flex;
  font-family: 'Styrene A Web',serif;
  font-size: 14px;
  font-weight: 400;
  height: 42px;
  justify-content: space-between;
  padding: 11px 20px;
  line-height: 19px;
}

</style>
