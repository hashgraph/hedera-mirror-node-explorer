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

  <section class="section has-text-centered" style="min-height: 450px">

    <div class="is-flex is-justify-content-center">

      <div class="is-flex is-flex-direction-column is-align-items-start">
        <div id="mobile-drop-down-menu" class="ml-1 mb-5 ">
          <o-field>
            <o-select v-model="selectedNetwork" class="h-is-navbar-item" style="outline: none">
              <option v-for="network in networkEntries" :key="network.name" :value="network.name">
                {{ network.displayName }}
              </option>
            </o-select>
          </o-field>
        </div>
        <router-link :to="routeManager.makeRouteToMainDashboard()" replace
                     id="dashboard-menu-item"
                     class="button is-ghost h-is-navbar-item h-is-mobile-navbar-item h-is-dense"
                     :class="{'is-rimmed': isDashboardRoute(previousRoute)}">Dashboard
        </router-link>
        <router-link :to="routeManager.makeRouteToTransactions()" replace
                     id="dashboard-menu-item"
                     class="button is-ghost h-is-navbar-item h-is-mobile-navbar-item h-is-dense"
                     :class="{'is-rimmed': isTransactionRoute(previousRoute)}">Transactions
        </router-link>
        <router-link :to="routeManager.makeRouteToTokens()" replace
                     id="dashboard-menu-item"
                     class="button is-ghost h-is-navbar-item h-is-mobile-navbar-item h-is-dense"
                     :class="{'is-rimmed': isTokenRoute(previousRoute)}">Tokens
        </router-link>
        <router-link :to="routeManager.makeRouteToTopics()" replace
                     id="dashboard-menu-item"
                     class="button is-ghost h-is-navbar-item h-is-mobile-navbar-item h-is-dense"
                     :class="{'is-rimmed': isTopicRoute(previousRoute)}">Topics
        </router-link>
        <router-link :to="routeManager.makeRouteToContracts()" replace
                     id="dashboard-menu-item"
                     class="button is-ghost h-is-navbar-item h-is-mobile-navbar-item h-is-dense"
                     :class="{'is-rimmed': isContractRoute(previousRoute)}">Contracts
        </router-link>
        <router-link :to="routeManager.makeRouteToAccounts()" replace
                     id="dashboard-menu-item"
                     class="button is-ghost h-is-navbar-item h-is-mobile-navbar-item h-is-dense"
                     :class="{'is-rimmed': isAccountRoute(previousRoute)}">Accounts
        </router-link>
        <router-link :to="routeManager.makeRouteToNodes()" replace
                     id="dashboard-menu-item"
                     class="button is-ghost h-is-navbar-item h-is-mobile-navbar-item h-is-dense"
                     :class="{'is-rimmed': isNodeRoute(previousRoute)}">Nodes
        </router-link>
        <router-link v-if="enableStaking"
                     :to="routeManager.makeRouteToStaking()" replace
                     id="dashboard-menu-item"
                     class="button is-ghost h-is-navbar-item h-is-mobile-navbar-item h-is-dense"
                     :class="{'is-rimmed': isStakingRoute(previousRoute)}">Staking
        </router-link>
        <router-link :to="routeManager.makeRouteToBlocks()" replace
                     id="dashboard-menu-item"
                     class="button is-ghost h-is-navbar-item h-is-mobile-navbar-item h-is-dense"
                     :class="{'is-rimmed': isBlocksRoute(previousRoute)}">Blocks
        </router-link>
      </div>

    </div>

  </section>

  <Footer :keep-background="true"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {onBeforeUnmount, onMounted, ref, watch} from 'vue';
import router, {routeManager} from "@/router";
import {MEDIUM_BREAKPOINT} from "@/BreakPoints";
import Footer from "@/components/Footer.vue";
import {NetworkConfig} from "@/config/NetworkConfig";

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
const previousRoute = routeManager.previousRoute
const isDashboardRoute = routeManager.testDashboardRoute
const isTransactionRoute = routeManager.testTransactionRoute
const isTokenRoute = routeManager.testTokenRoute
const isTopicRoute = routeManager.testTopicRoute
const isContractRoute = routeManager.testContractRoute
const isAccountRoute = routeManager.testAccountRoute
const isNodeRoute = routeManager.testNodeRoute
const isStakingRoute = routeManager.testStakingRoute
const isBlocksRoute = routeManager.testBlocksRoute
const networkEntries = networkConfig.entries

</script>


<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
