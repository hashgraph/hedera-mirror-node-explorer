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
        <router-link v-if="isStakingEnabled"
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

<script lang="ts">

import {defineComponent, inject, onBeforeUnmount, onMounted} from 'vue';
import router, {routeManager} from "@/router";
import {MEDIUM_BREAKPOINT} from "@/BreakPoints";
import Footer from "@/components/Footer.vue";
import {networkRegistry} from "@/schemas/NetworkRegistry";
import {CoreConfig} from "@/config/CoreConfig";

export default defineComponent({
  name: 'MobileMenu',
  components: {Footer},
  props: {
    "searchedId": String,
    "network": String
  },
  setup() {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)
    const coreConfig = CoreConfig.inject()
    const isStakingEnabled = coreConfig.enableStaking

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

    return {
      isSmallScreen,
      isTouchDevice,
      isStakingEnabled,
      selectedNetwork: routeManager.selectedNetwork,
      previousRoute: routeManager.previousRoute,
      isDashboardRoute: routeManager.testDashboardRoute,
      isTransactionRoute: routeManager.testTransactionRoute,
      isTokenRoute: routeManager.testTokenRoute,
      isTopicRoute: routeManager.testTopicRoute,
      isContractRoute: routeManager.testContractRoute,
      isAccountRoute: routeManager.testAccountRoute,
      isNodeRoute: routeManager.testNodeRoute,
      isStakingRoute: routeManager.testStakingRoute,
      isBlocksRoute: routeManager.testBlocksRoute,
      networkEntries: networkRegistry.entries,
      routeManager
    }
  }
})

</script>


<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
