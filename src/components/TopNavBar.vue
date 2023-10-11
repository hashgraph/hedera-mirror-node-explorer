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
    <WalletChooser v-model:show-dialog="showWalletChooser" v-on:choose-wallet="handleChooseWallet"/>
    
    <ProgressDialog v-model:show-dialog="showProgressDialog"
                  :mode="progressDialogMode"
                  :main-message="progressMainMessage"
                  :extra-message="progressExtraMessage"
                  :extra-transaction-id="progressExtraTransactionId"
                  :show-spinner="showProgressSpinner"
  >
    <template v-slot:dialogTitle>
      <span class="h-is-primary-title">{{ progressDialogTitle }}</span>
    </template>
  </ProgressDialog>

    <div class="is-inline-flex is-align-items-center is-flex-grow-0 is-flex-shrink-0 mr-3">
      <router-link :to="routeManager.makeRouteToMainDashboard()">
        <img id="product-logo" alt="Product Logo" class="image" src="@/assets/branding/brand-product-logo.png">
      </router-link>
      <AxiosStatus/>
    </div>
    
    <div class="is-flex-grow-0 is-flex-shrink-0 is-flex is-flex-direction-column ml-4">
      <div class="is-flex mb-3 is-align-items-baseline is-justify-content-space-between">
        <router-link :to="routeManager.makeRouteToMainDashboard()"
                     id="dashboard-menu-item"
                     class="button is-ghost is-first/ h-is-navbar-item h-is-dense"
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

      <div style="display: grid; gap: 1.2rem; grid-template-columns: repeat(12, minmax(0, 3.9rem));">
        <div style="grid-column: span 7;">
          <SearchBar/>
        </div>
        
        <div style="grid-column: span 2;">
          <o-field>
            <o-select v-model="selectedNetwork" class="h-is-navbar-item" style="outline: none; height: 40px">
              <option v-for="network in networkEntries" :key="network.name" :value="network.name">
                {{ network.displayName }}
              </option>
            </o-select>
          </o-field>
        </div>

        <div style="grid-column: span 3;">
          <button v-if="!connected" :disabled="connecting" id="connectWalletButton" class="button" @click="chooseWallet" style="outline: none; height: 40px; width: 100%; font-size: 0.9rem;">
            {{ connecting ? "Attempting to connect..." : "CONNECT WALLET" }}
          </button>

          <div v-else class="is-flex is-align-items-center" style="outline: none; height: 40px; width: 100%; font-size: 0.9rem; border: 1px solid white; display: flex; justify-content: space-between;">
            <figure style="width: 50px; height: 100%;">
                <img :src="walletIconURL ?? undefined" alt="wallet logo">
            </figure>

            <p class="ml-3/" style="font-size: 1.02rem;">
              {{ accountId }}
            </p>

            <div class="is-flex is-align-items-center" style="width: 30px; justify-content: center;">
              <i class="fas fa-solid fa-angle-down is-flex is-align-items-center"/>
            </div>

          </div>
        </div>
      </div>
    </div>

  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {routeManager, walletManager} from "@/router";
import SearchBar from "@/components/SearchBar.vue";
import AxiosStatus from "@/components/AxiosStatus.vue";
import {networkRegistry} from "@/schemas/NetworkRegistry";
import WalletChooser from "@/components/staking/WalletChooser.vue";
import { WalletDriver } from '@/utils/wallet/WalletDriver';
import { WalletDriverError } from '@/utils/wallet/WalletDriverError';
import ProgressDialog, { Mode } from './staking/ProgressDialog.vue';
import { AccountLocParser } from '@/utils/parser/AccountLocParser';
import {computed, defineComponent, inject, onBeforeUnmount, onMounted, ref} from "vue";

export default defineComponent({
  name: "TopNavBar",
  components: {AxiosStatus, SearchBar, WalletChooser, ProgressDialog},

  setup() {
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)
    const buildTime = inject('buildTime', "not available")

    const productName = import.meta.env.VITE_APP_PRODUCT_NAME ?? "Hedera Mirror Node Explorer"
    const isStakingEnabled = import.meta.env.VITE_APP_ENABLE_STAKING === 'true'

    const isMobileMenuOpen = ref(false)

    const showWalletChooser = ref(false)
    const chooseWallet = () => {
      showWalletChooser.value = true
    }

    const connecting = ref(false)
    const showProgressDialog = ref(false)
    const showProgressSpinner = ref(false)
    const progressDialogMode = ref(Mode.Busy)
    const progressDialogTitle = ref<string|null>(null)
    const progressMainMessage = ref<string|null>(null)
    const progressExtraMessage = ref<string|null>(null)
    const progressExtraTransactionId = ref<string|null>(null)

    //
    // handleChooseWallet
    //
    const handleChooseWallet = (wallet: WalletDriver) => {
      walletManager.setActiveDriver(wallet)
      connecting.value = true
      walletManager
          .connect()
          .catch((reason) => {
            console.warn("Failed to connect wallet - reason:" + reason.toString())
            showProgressDialog.value = true
            progressDialogMode.value = Mode.Error
            progressDialogTitle.value = "Could not connect wallet"
            showProgressSpinner.value = false
            progressExtraTransactionId.value = null
            if (reason instanceof WalletDriverError) {
              progressMainMessage.value = reason.message
              progressExtraMessage.value = reason.extra
            } else {
              progressMainMessage.value = "Unexpected error"
              progressExtraMessage.value = JSON.stringify(reason)
            }
          })
          .finally(() => connecting.value = false)
    }

    //
    // Account
    //
    const accountLocParser = new AccountLocParser(walletManager.accountId)
    onMounted(() => accountLocParser.mount())
    onBeforeUnmount(() => accountLocParser.unmount())

    const accountRoute = computed(() => {
      return walletManager.accountId.value !== null
          ? routeManager.makeRouteToAccount(walletManager.accountId.value, false)
          : null
    })

    const balanceInHbar = computed(() => {
      const balance = accountLocParser.balance.value ?? 10000000000
      return balance / 100000000
    })
    

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
      chooseWallet,
      showWalletChooser,
      handleChooseWallet,
      connecting,
      showProgressDialog,
      progressDialogMode,
      progressMainMessage,
      progressExtraMessage,
      progressExtraTransactionId,
      showProgressSpinner,
      progressDialogTitle,
      accountId: walletManager.accountId,
      accountChecksum: accountLocParser.accountChecksum,
      walletIconURL: walletManager.getActiveDriver().iconURL,
      connected: walletManager.connected,
      accountRoute,
      balanceInHbar, 
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