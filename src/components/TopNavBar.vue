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
      <a class="mr-3" @click="routeManager.routeToMainDashboard()">
        <img alt="Product Logo" class="image" src="@/assets/branding/brand-product-logo.png" style="max-width: 165px;">
      </a>
      <AxiosStatus/>
    </span>

    <div class="is-flex is-align-items-center pt-2">
      <a v-if="name !== 'MobileMenu' && name !== 'MobileSearch'"
         @click="$router.push(routeManager.mobileSearchRoute)">
        <img alt="Search bar" src="@/assets/search-icon.png" style="max-height: 20px;">
      </a>
      <a v-if="name !== 'MobileMenu' && name !== 'MobileSearch'" class="ml-5"
         @click="$router.push(routeManager.makeRouteToMobileMenu(name))">
        <img alt="Search bar" src="@/assets/hamburger.png" style="max-height: 32px;">
      </a>
      <a v-else class="ml-5 mr-2"
         @click="$router.back()">
        <img alt="Search bar" src="@/assets/close-icon.png" style="max-height: 22px;">
      </a>
    </div>

  </div>

  <div v-else class="is-flex is-justify-content-space-between is-align-items-flex-end">
    <span class="is-inline-flex is-align-items-center is-flex-grow-0 is-flex-shrink-0">
      <a id="product-logo" @click="routeManager.routeToMainDashboard()" class="mr-3">
        <img alt="Product Logo" class="image" src="@/assets/branding/brand-product-logo.png">
      </a>
      <AxiosStatus/>
    </span>
    <div class="is-flex-grow-0 is-flex-shrink-0 is-flex is-flex-direction-column ml-4">
      <div class="is-flex mb-3 is-align-items-baseline">

        <div id="drop-down-menu">
          <o-field>
            <o-select v-model="selectedNetwork" class="h-is-navbar-item">
              <option v-for="network in networkEntries" :key="network.name" :value="network.name">
                {{ network.displayName }}
              </option>

            </o-select>
          </o-field>
        </div>

        <div class="is-flex-grow-1 px-2"/>
        <a id="dashboard-menu-item" class="button is-ghost is-first h-is-navbar-item h-is-dense"
           :class="{'is-rimmed': isDashboardRoute}"
           @click="$router.push(routeManager.mainDashboardRoute)">Dashboard</a>
        <a class="button is-ghost h-is-navbar-item h-is-dense"
           :class="{ 'is-rimmed': isTransactionRoute}"
           @click="$router.push(routeManager.transactionsRoute)">Transactions</a>
        <a class="button is-ghost h-is-navbar-item h-is-dense"
           :class="{ 'is-rimmed': isTokenRoute}"
           @click="$router.push(routeManager.tokensRoute)">Tokens</a>
        <a class="button is-ghost h-is-navbar-item h-is-dense"
           :class="{ 'is-rimmed': isTopicRoute}"
           @click="$router.push(routeManager.topicsRoute)">Topics</a>
        <a class="button is-ghost h-is-navbar-item h-is-dense"
           :class="{ 'is-rimmed': isContractRoute}"
           @click="$router.push(routeManager.contractsRoute)">Contracts</a>
        <a class="button is-ghost h-is-navbar-item h-is-dense"
           :class="{ 'is-rimmed': isAccountRoute}"
           @click="$router.push(routeManager.accountsRoute)">Accounts</a>
        <a class="button is-ghost h-is-navbar-item h-is-dense"
           :class="{ 'is-rimmed': isNodeRoute}"
           @click="$router.push(routeManager.nodesRoute)">Nodes</a>
        <a v-if="isStakingEnabled"
           class="button is-ghost h-is-navbar-item h-is-dense"
           :class="{ 'is-rimmed': isStakingRoute}"
           @click="$router.push(routeManager.stakingRoute)">Staking</a>
        <a class="button is-ghost is-last h-is-navbar-item h-is-dense"
           :class="{ 'is-rimmed': isBlocksRoute}"
           @click="$router.push(routeManager.blocksRoute)">Blocks</a>
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