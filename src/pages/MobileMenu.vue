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

  <PageFrameV2 page-title="Mobile Menu">
    <section class="section has-text-centered" style="min-height: 450px">

      <div class="is-flex is-justify-content-center">

        <div class="is-flex is-flex-direction-column is-align-items-start">
          <div id="mobile-drop-down-menu" class="ml-1 mb-5 ">
            <SelectView v-model="selectedNetwork" :small="true">
              <option v-for="network in networkEntries" :key="network.name" :value="network.name">
                {{ network.displayName }}
              </option>
            </SelectView>
          </div>

          <NavMenuItem :tabId="TabId.Dashboard"
                       :is-mobile="true"
                       :target-route="routeManager.makeRouteToMainDashboard()"/>
          <NavMenuItem :tabId="TabId.Transactions"
                       :is-mobile="true"
                       :target-route="routeManager.makeRouteToTransactions()"/>
          <NavMenuItem :tabId="TabId.Tokens"
                       :is-mobile="true"
                       :target-route="routeManager.makeRouteToTokens()"/>
          <NavMenuItem :tabId="TabId.Topics"
                       :is-mobile="true"
                       :target-route="routeManager.makeRouteToTopics()"/>
          <NavMenuItem :tabId="TabId.Contracts"
                       :is-mobile="true"
                       :target-route="routeManager.makeRouteToContracts()"/>
          <NavMenuItem :tabId="TabId.Accounts"
                       :is-mobile="true"
                       :target-route="routeManager.makeRouteToAccounts()"/>
          <NavMenuItem :tabId="TabId.Nodes"
                       :is-mobile="true"
                       :target-route="routeManager.makeRouteToNodes()"/>
          <NavMenuItem v-if="enableStaking"
                       :tabId="TabId.Staking"
                       :is-mobile="true"
                       :target-route="routeManager.makeRouteToStaking()"/>
          <NavMenuItem :tabId="TabId.Blocks"
                       :is-mobile="true"
                       :target-route="routeManager.makeRouteToBlocks()"/>
        </div>

      </div>

    </section>
  </PageFrameV2>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {onBeforeUnmount, onMounted, ref, watch} from 'vue';
import router, {routeManager} from "@/router";
import {MEDIUM_BREAKPOINT} from "@/BreakPoints";
import PageFrameV2 from "@/components/page/PageFrameV2.vue";
import {NetworkConfig} from "@/config/NetworkConfig";
import {TabId} from "@/utils/RouteManager.ts";
import NavMenuItem from "@/components/page/NavMenuItem.vue";
import SelectView from "@/components/SelectView.vue";

defineProps(
    {
      "network": String
    }
)

const networkConfig = NetworkConfig.inject()

const onResizeHandler = () => {
  if (window.innerWidth >= MEDIUM_BREAKPOINT) {
    router.back()
  }
}
onMounted(() => {
  window.addEventListener('resize', onResizeHandler);
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', onResizeHandler);
})

//
// Public (selectedNetwork)
//

const selectedNetwork = ref(routeManager.currentNetwork.value)
watch(routeManager.currentNetwork, (newNetwork) => {
  selectedNetwork.value = newNetwork // Checked : does not trigger any watch when value is unchanged
})
watch(selectedNetwork, (newNetwork) => {
  if (newNetwork !== routeManager.currentNetwork.value) {
    routeManager.routeToMainDashboard(newNetwork)
  }
})

const enableStaking = routeManager.enableStaking
const networkEntries = networkConfig.entries

</script>


<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
