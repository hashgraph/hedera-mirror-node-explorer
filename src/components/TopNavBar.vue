<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2022 Hedera Hashgraph, LLC
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
      <a class="mr-3" @click="$router.push({name: 'MainDashboard'})">
        <img alt="Product Logo" class="image" src="@/assets/branding/brand-product-logo.png" style="max-width: 165px;">
      </a>
      <AxiosStatus/>
    </span>

    <div class="is-flex is-align-items-center pt-2">
      <a v-if="name !== 'MobileMenu' && name !== 'MobileSearch'"
         @click="$router.push({name: 'MobileSearch'})">
        <img alt="Search bar" src="@/assets/search-icon.png" style="max-height: 20px;">
      </a>
      <a v-if="name !== 'MobileMenu' && name !== 'MobileSearch'" class="ml-5"
         @click="$router.push({name: 'MobileMenu', query: {from: name}})">
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
      <a id="product-logo" @click="$router.push({name: 'MainDashboard'})" class="mr-3">
        <img alt="Product Logo" class="image" src="@/assets/branding/brand-product-logo.png">
      </a>
      <AxiosStatus/>
    </span>
    <div class="is-flex-grow-0 is-flex-shrink-0 is-flex is-flex-direction-column mx-5">
      <div class="is-flex mb-3 is-align-items-baseline">

        <template v-if="useFlatMenu">
          <a class="button is-outlined h-is-navbar-item"
             :class="{ 'is-active': isTestnetSelected, 'is-highlighted': isMainnetSelected}"
             @click="selectedNetwork = HederaNetwork.MAINNET">MAINNET</a>
          <a class="button is-outlined h-is-navbar-item ml-2"
             :class="{ 'is-active': isMainnetSelected, 'is-highlighted': isTestnetSelected}"
             @click="selectedNetwork = HederaNetwork.TESTNET">TESTNET</a>
        </template>

        <div v-else id="drop-down-menu">
          <o-field>
            <o-select
                v-model="selectedNetwork"
                class="h-is-navbar-item"
            >
              <option v-bind:key="HederaNetwork.MAINNET" v-bind:value="HederaNetwork.MAINNET">MAINNET</option>
              <option v-bind:key="HederaNetwork.TESTNET" v-bind:value="HederaNetwork.TESTNET">TESTNET</option>
            </o-select>
          </o-field>
        </div>

        <div class="is-flex-grow-1 px-2"/>
        <a id="dashboard-menu-item"
            class="button is-ghost is-first h-is-navbar-item"
           :class="{'is-rimmed': isDashboardRoute, 'h-is-dense': !isDashboardRoute}"
           @click="$router.push({name: 'MainDashboard'})">Dashboard</a>
        <a class="button is-ghost h-is-navbar-item"
           :class="{ 'is-rimmed': isTransactionRoute, 'h-is-dense': !isTransactionRoute }"
           @click="$router.push({name: 'Transactions'})">Transactions</a>
        <a class="button is-ghost h-is-navbar-item"
           :class="{ 'is-rimmed': isTokenRoute, 'h-is-dense': !isTokenRoute }"
           @click="$router.push({name: 'Tokens'})">Tokens</a>
        <a class="button is-ghost h-is-navbar-item"
           :class="{ 'is-rimmed': isTopicRoute, 'h-is-dense': !isTopicRoute }"
           @click="$router.push({name: 'Topics'})">Topics</a>
        <a class="button is-ghost h-is-navbar-item"
           :class="{ 'is-rimmed': isContractRoute, 'h-is-dense': !isContractRoute }"
           @click="$router.push({name: 'Contracts'})">Contracts</a>
        <a class="button is-ghost is-last h-is-navbar-item"
           :class="{ 'is-rimmed': isAccountRoute, 'h-is-dense': !isAccountRoute }"
           @click="$router.push({name: 'Accounts'})">Accounts</a>
      </div>
      <SearchBar style="margin-top: 4px"/>
    </div>
    <a v-if="showTopRightLogo" id="built-on-hedera-logo" href="https://hedera.com" style="line-height: 1">
      <img alt="Built On Hedera" src="@/assets/built-on-hedera-white.svg" style="min-width: 104px;">
    </a>

  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, ref, watch, WatchStopHandle} from "vue";
import {useRoute} from "vue-router";
import router from "@/router";
import SearchBar from "@/components/SearchBar.vue";
import AxiosStatus from "@/components/AxiosStatus.vue";

export enum HederaNetwork {
  TESTNET = "testnet",
  MAINNET = "mainnet"
}

export default defineComponent({
  name: "TopNavBar",
  components: {AxiosStatus, SearchBar},

  setup() {
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    const route = useRoute()
    const network = computed( () => { return route.params.network })
    const name = computed( () => { return route.name })

    const hideNavBar = inject('sizeFallBack', false)
    const useFlatMenu = inject('isXLargeScreen', true)
    const showTopRightLogo = inject('isLargeScreen', true)

    const isMobileMenuOpen = ref(false)

    watch(network, (value) => {
      updateSelectedNetworkSilently(value)
    })
    const isMainnetSelected = computed(() => {
      return selectedNetwork.value == HederaNetwork.MAINNET
    })
    const isTestnetSelected = computed(() => {
      return selectedNetwork.value == HederaNetwork.TESTNET
    })

    const selectedNetwork = ref(network.value)
    
    let selectedNetworkWatchHandle: WatchStopHandle|undefined
    const updateSelectedNetworkSilently = (newValue: string|string[]) => {
      if (selectedNetworkWatchHandle) {
        selectedNetworkWatchHandle()
      }
      selectedNetwork.value = newValue
      selectedNetworkWatchHandle = watch(selectedNetwork, (selection) => {
        router.push({
          name: name.value as string,
          params: { network: selection }
        })
      })
    }

    const isDashboardRoute = computed(() => {
      return name.value === 'MainDashboard'
    })

    const isTransactionRoute = computed(() => {
      return name.value === 'Transactions' || name.value === 'TransactionsById' || name.value === 'TransactionDetails'
    })

    const isTokenRoute = computed(() => {
      return name.value === 'Tokens' || name.value === 'TokenDetails'
    })

    const isTopicRoute = computed(() => {
      return name.value === 'Topics' || name.value === 'TopicDetails'
    })

    const isContractRoute = computed(() => {
      return name.value === 'Contracts' || name.value === 'ContractDetails'
    })

    const isAccountRoute = computed(() => {
      return name.value === 'Accounts' || name.value === 'AccountDetails' || name.value === 'AccountBalances'
    })

    return {
      isSmallScreen,
      isMediumScreen,
      isTouchDevice,
      name,
      hideNavBar,
      useFlatMenu,
      showTopRightLogo,
      isMobileMenuOpen,
      isMainnetSelected,
      isTestnetSelected,
      selectedNetwork,
      isDashboardRoute,
      isTransactionRoute,
      isTokenRoute,
      isTopicRoute,
      isContractRoute,
      isAccountRoute,
      HederaNetwork
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

@media (max-width: 1119px) {
  #product-logo {
    max-width: 220px;
  }
}

@media (max-width: 1023px) {
  #product-logo {
    max-width: 220px;
  }
}

</style>