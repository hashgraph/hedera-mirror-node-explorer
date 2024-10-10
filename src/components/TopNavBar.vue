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

    <ConnectWalletDialog :error="connectError" :controller="connectDialogController"/>

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

      <div id="navbar-grid">
        <div id="search-bar">
          <SearchBarV2/>
        </div>

        <div id="drop-down-menu">
          <o-field>
            <o-select v-model="selectedNetwork" class="h-is-navbar-item">
              <option v-for="network in networkEntries" :key="network.name" :value="network.name">
                {{ network.displayName }}
              </option>
            </o-select>
          </o-field>
        </div>

        <div id="connect-button">
          <button v-if="!connected" :disabled="connecting" id="connectWalletButton" class="button is-white is-small"
                  @click="chooseWallet" style="outline: none; height: 40px; width: 100%; font-size: 0.8rem;">
            {{ connecting ? "Connecting..." : "CONNECT WALLET..." }}
          </button>

          <div v-else @click="showWalletInfo = !showWalletInfo" id="walletInfoBanner"
               class="is-flex is-align-items-center is-justify-content-space-between"
               style="outline: none; height: 40px; width: 100%; font-size: 0.9rem; border: 0.5px solid white; cursor: pointer;">

            <div class="is-flex is-align-items-center is-justify-content-flex-start">
              <figure class="is-flex is-align-items-center mx-1" style="height: 40px;">
                <img :src="walletIconURL ?? undefined" alt="wallet logo"
                     style="object-fit: contain; aspect-ratio: 3/2; height: 60%;">
              </figure>
              {{ accountId }}
            </div>
            <div class="is-flex is-align-items-center is-justify-content-center" style="width: 30px;">
              <i v-if="!showWalletInfo" class="fas fa-solid fa-angle-down is-flex is-align-items-center"/>
              <i v-else class="fas fa-solid fa-angle-up is-flex is-align-items-center"/>
            </div>

          </div>
        </div>

        <WalletInfo
            :connected="connected"
            :accountIds="accountIds"
            v-model:show-wallet-info="showWalletInfo"
            :accountId="accountId || undefined"
            :walletIconURL="walletIconURL || undefined"
            @wallet-disconnect="disconnectFromWallet"
            @change-account="handleChangeAccount"
        />

      </div>
    </div>

  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import router, {routeManager, walletManager} from "@/router";
import SearchBarV2 from "@/components/search/SearchBarV2.vue";
import AxiosStatus from "@/components/AxiosStatus.vue";
import {networkRegistry} from "@/schemas/NetworkRegistry";
import WalletChooser from "@/components/staking/WalletChooser.vue";
import {WalletDriver} from '@/utils/wallet/WalletDriver';
import {WalletDriverCancelError} from '@/utils/wallet/WalletDriverError';
import {defineComponent, inject, ref} from "vue";
import WalletInfo from '@/components/wallet/WalletInfo.vue'
import {DialogController} from "@/components/dialog/DialogController";
import ConnectWalletDialog from "@/components/wallet/ConnectWalletDialog.vue";
import {gtagWalletConnect, gtagWalletConnectionFailure} from "@/gtag";

export default defineComponent({
  name: "TopNavBar",
  components: {ConnectWalletDialog, AxiosStatus, SearchBarV2, WalletChooser, WalletInfo},

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
    const walletIconURL = ref("")
    const showWalletInfo = ref(false)

    const connectDialogController = new DialogController()
    const connectError = ref<unknown>()

    //
    // handleChooseWallet
    //
    const handleChooseWallet = (wallet: WalletDriver) => {
      walletManager.setActiveDriver(wallet)
      connecting.value = true
      walletManager
          .connect()
          .catch((reason) => {
            if (!(reason instanceof WalletDriverCancelError)) {
              console.warn("Failed to connect wallet - reason:" + reason.toString())
              connectError.value = reason
              connectDialogController.visible.value = true
              gtagWalletConnectionFailure(wallet.name)
            }
          })
          .finally(() => {
            connecting.value = false
            navigateToMyAccount()
          })
      walletIconURL.value = walletManager.getActiveDriver().iconURL || ""
      gtagWalletConnect(wallet.name)
    }

    //
    // handleChangeAccount
    //
    const handleChangeAccount = (chosenAccountId: string) => {
      walletManager.changeAccount(chosenAccountId)
      navigateToMyAccount()
    }

    //
    // disconnectFromWallet
    //
    const disconnectFromWallet = () => {
      walletManager
          .disconnect()
          .finally(() => {
            connecting.value = false;
            showWalletInfo.value = false;
          })
    }

    //
    // navigateToMyAccount
    //
    const navigateToMyAccount = () => {
      if (walletManager.accountId.value) {
        router.push(routeManager.makeRouteToAccount(walletManager.accountId.value))
      }
    }

    return {
      buildTime,
      connecting,
      productName,
      routeManager,
      chooseWallet,
      walletIconURL,
      isSmallScreen,
      isTouchDevice,
      isMediumScreen,
      showWalletInfo,
      isStakingEnabled,
      isMobileMenuOpen,
      showWalletChooser,
      handleChooseWallet,
      handleChangeAccount,
      disconnectFromWallet,
      connectDialogController,
      connectError,
      name: routeManager.currentRoute,
      accountId: walletManager.accountId,
      connected: walletManager.connected,
      accountIds: walletManager.accountIds,
      isNodeRoute: routeManager.isNodeRoute,
      isTokenRoute: routeManager.isTokenRoute,
      isTopicRoute: routeManager.isTopicRoute,
      networkEntries: networkRegistry.entries,
      isBlocksRoute: routeManager.isBlocksRoute,
      isStakingRoute: routeManager.isStakingRoute,
      isAccountRoute: routeManager.isAccountRoute,
      isContractRoute: routeManager.isContractRoute,
      selectedNetwork: routeManager.selectedNetwork,
      isDashboardRoute: routeManager.isDashboardRoute,
      isTransactionRoute: routeManager.isTransactionRoute,
    }
  },
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>

@media (min-width: 1450px) {
  #product-logo {
    max-width: 242px;
  }

  #navbar-grid {
    position: relative;
    display: grid;
    column-gap: 1.2rem;
    grid-template-columns:repeat(20, minmax(0, 35px));
  }

  #search-bar {
    grid-column: span 13;
  }

  #drop-down-menu {
    grid-column: span 3;
  }

  #connect-button {
    grid-column: span 4;
  }
}

@media (max-width: 1449px) {
  #product-logo {
    max-width: 220px;
  }

  #navbar-grid {
    position: relative;
    display: grid;
    column-gap: 1.2rem;
    grid-template-columns:repeat(17, minmax(0, 35px));
  }

  #search-bar {
    grid-column: span 10;
  }

  #drop-down-menu {
    grid-column: span 3;
  }

  #connect-button {
    grid-column: span 4;
  }
}

@media (max-width: 1249px) {
  #product-logo {
    max-width: 200px;
  }

  #navbar-grid {
    position: relative;
    display: grid;
    column-gap: 1.2rem;
    grid-template-columns:repeat(18, minmax(0, 24px));
  }

  #search-bar {
    grid-column: span 9;
  }

  #drop-down-menu {
    grid-column: span 4;
  }

  #connect-button {
    grid-column: span 5;
  }
}

</style>