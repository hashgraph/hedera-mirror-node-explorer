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

  <div v-if="!isMediumScreen"
       class="is-flex is-align-items-center is-justify-content-space-between pt-3 pb-4">

    <span class="is-inline-flex is-align-items-center is-flex-grow-0 is-flex-shrink-0">
      <router-link :to="routeManager.makeRouteToMainDashboard()" class="mr-3">
        <img alt="Product Logo" class="image" src="@/assets/branding/brand-product-logo.png" style="max-width: 165px;">
      </router-link>
      <AxiosStatus/>
    </span>

    <div class="is-flex is-align-items-center pt-2">
      <router-link v-if="name !== 'MobileMenu' && name !== 'MobileSearch'"
                   :to="routeManager.makeRouteToMobileSearch()">
        <img alt="Search bar" id="mobile-search-icon" src="@/assets/search-icon.png" style="max-height: 20px;">
      </router-link>
      <router-link v-if="name !== 'MobileMenu' && name !== 'MobileSearch'"
                   :to="routeManager.makeRouteToMobileMenu(name)" class="ml-5">
        <img alt="Mobile menu" id="mobile-menu-icon" src="@/assets/hamburger.png" style="max-height: 32px;">
      </router-link>
      <a v-else class="ml-5 mr-2"
         @click="$router.back()">
        <img alt="Search bar" id="close-icon" src="@/assets/close-icon.png" style="max-height: 22px;">
      </a>
    </div>

  </div>

  <div v-else class="is-flex is-justify-content-space-between is-align-items-flex-end">
    <div  class="is-inline-flex is-align-items-center is-flex-grow-0 is-flex-shrink-0 mr-3">
      <router-link :to="routeManager.makeRouteToMainDashboard()">
        <img id="product-logo" alt="Product Logo" class="image" src="@/assets/branding/brand-product-logo.png">
      </router-link>
      <AxiosStatus/>
    </div>
    <div class="is-flex-grow-0 is-flex-shrink-0 is-flex is-flex-direction-column ml-4">
      <div class="is-flex mb-3 is-align-items-baseline">

        <div id="drop-down-menu">
          <o-field>
            <o-select v-model="selectedNetwork" class="h-is-navbar-item" style="outline: none">
              <option v-for="network in networkEntries" :key="network.name" :value="network.name">
                {{ network.displayName }}
              </option>
            </o-select>
          </o-field>
        </div>

        <div class="is-flex-grow-1 px-2"/>

        <router-link :to="routeManager.makeRouteToMainDashboard()"
                     id="dashboard-menu-item"
                     class="button is-ghost is-first h-is-navbar-item h-is-dense"
                     :class="{ 'is-rimmed': isDashboardRoute}">Dashboard</router-link>
        <router-link :to="routeManager.makeRouteToTransactions()"
                     class="button is-ghost h-is-navbar-item h-is-dense"
                     :class="{ 'is-rimmed': isTransactionRoute}">Transactions</router-link>
        <router-link :to="routeManager.makeRouteToTokens()"
                     class="button is-ghost h-is-navbar-item h-is-dense"
                     :class="{ 'is-rimmed': isTokenRoute}">Tokens</router-link>
        <router-link :to="routeManager.makeRouteToTopics()"
                     class="button is-ghost h-is-navbar-item h-is-dense"
                     :class="{ 'is-rimmed': isTopicRoute}">Topics</router-link>
        <router-link :to="routeManager.makeRouteToContracts()"
                     class="button is-ghost h-is-navbar-item h-is-dense"
                     :class="{ 'is-rimmed': isContractRoute}">Contracts</router-link>
        <router-link :to="routeManager.makeRouteToAccounts()"
                     class="button is-ghost h-is-navbar-item h-is-dense"
                     :class="{ 'is-rimmed': isAccountRoute}">Accounts</router-link>
        <router-link :to="routeManager.makeRouteToNodes()"
                     class="button is-ghost h-is-navbar-item h-is-dense"
                     :class="{ 'is-rimmed': isNodeRoute}">Nodes</router-link>
        <router-link v-if="isStakingEnabled"
                     :to="routeManager.makeRouteToStaking()"
                     class="button is-ghost h-is-navbar-item h-is-dense"
                     :class="{ 'is-rimmed': isStakingRoute}">Staking</router-link>
        <router-link :to="routeManager.makeRouteToBlocks()"
                     class="button is-ghost is-last h-is-navbar-item h-is-dense"
                     :class="{ 'is-rimmed': isBlocksRoute}">Blocks</router-link>
      </div>
      <SearchBar style="margin-top: 4px"/>
    </div>

  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, ref} from "vue";
import {routeManager} from "@/router";
import SearchBar from "@/components/SearchBar.vue";
import AxiosStatus from "@/components/AxiosStatus.vue";
import {networkRegistry} from "@/schemas/NetworkRegistry";
import {getEnv} from "@/utils/getEnv";

export default defineComponent({
  name: "TopNavBar",
  components: {AxiosStatus, SearchBar},

  setup() {
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)
    const buildTime = inject('buildTime', "not available")

    const productName = getEnv('VUE_APP_PRODUCT_NAME') ?? "Hedera Mirror Node Explorer"
    const isStakingEnabled = getEnv('VUE_APP_ENABLE_STAKING') === 'true'

    const isMobileMenuOpen = ref(false)

    return {
      isSmallScreen,
      isMediumScreen,
      isTouchDevice,
      buildTime,
      productName,
      isStakingEnabled,
      isMobileMenuOpen,
      networkEntries: networkRegistry.entries,
      selectedNetwork: routeManager.selectedNetwork,
      name: routeManager.currentRoute,
      isDashboardRoute: routeManager.isDashboardRoute,
      isTransactionRoute: routeManager.isTransactionRoute,
      isTokenRoute: routeManager.isTokenRoute,
      isTopicRoute: routeManager.isTopicRoute,
      isContractRoute: routeManager.isContractRoute,
      isAccountRoute: routeManager.isAccountRoute,
      isNodeRoute: routeManager.isNodeRoute,
      isStakingRoute: routeManager.isStakingRoute,
      isBlocksRoute: routeManager.isBlocksRoute,
      routeManager,
    }
  },
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>

@media (min-width: 1240px) {
  #product-logo {
    max-width: 242px;
  }
}

@media (max-width: 1239px) {
  #product-logo {
    max-width: 220px;
  }
}

</style>