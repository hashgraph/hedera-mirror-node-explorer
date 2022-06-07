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

  <ModalDialog v-model:show-dialog="showErrorDialog" :iconClass="'fa fa-2x fa-info has-text-info'">
    <template v-slot:dialogMessage>{{ productName }} is a ledger explorer for the Hedera network</template>
    <template v-slot:dialogDetails>
      <div>Build date: {{ buildTime }}</div>
    </template>
  </ModalDialog>

  <div v-if="!isMediumScreen"
       class="is-flex is-align-items-center is-justify-content-space-between pt-3 pb-4">

    <span class="is-inline-flex is-align-items-center is-flex-grow-0 is-flex-shrink-0">
      <a class="mr-3" @click="showErrorDialog=true">
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
      <a id="product-logo" @click="showErrorDialog = true" class="mr-3">
        <img alt="Product Logo" class="image" src="@/assets/branding/brand-product-logo.png">
      </a>
      <AxiosStatus/>
    </span>
    <div class="is-flex-grow-0 is-flex-shrink-0 is-flex is-flex-direction-column ml-4">
      <div class="is-flex mb-3 is-align-items-baseline">

        <div id="drop-down-menu">
          <o-field>
            <o-select v-model="selectedNetwork" class="h-is-navbar-item">
              <option v-for="network in networkRegistry.getEntries()" :key="network.name" :value="network.name">
                {{ network.displayName }}
              </option>

            </o-select>
          </o-field>
        </div>

        <div class="is-flex-grow-1 px-2"/>
        <a id="dashboard-menu-item"
            class="button is-ghost is-first h-is-navbar-item h-is-dense"
           :class="{'is-rimmed': isDashboardRoute}"
           @click="$router.push({name: 'MainDashboard'})">Dashboard</a>
        <a class="button is-ghost h-is-navbar-item h-is-dense"
           :class="{ 'is-rimmed': isTransactionRoute}"
           @click="$router.push({name: 'Transactions'})">Transactions</a>
        <a class="button is-ghost h-is-navbar-item h-is-dense"
           :class="{ 'is-rimmed': isTokenRoute}"
           @click="$router.push({name: 'Tokens'})">Tokens</a>
        <a class="button is-ghost h-is-navbar-item h-is-dense"
           :class="{ 'is-rimmed': isTopicRoute}"
           @click="$router.push({name: 'Topics'})">Topics</a>
        <a class="button is-ghost h-is-navbar-item h-is-dense"
           :class="{ 'is-rimmed': isContractRoute}"
           @click="$router.push({name: 'Contracts'})">Contracts</a>
        <a class="button is-ghost is-last h-is-navbar-item h-is-dense"
           :class="{ 'is-rimmed': isAccountRoute}"
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
import {networkRegistry} from "@/schemas/NetworkRegistry";
import ModalDialog from "@/components/ModalDialog.vue";

export default defineComponent({
  name: "TopNavBar",
  components: {ModalDialog, AxiosStatus, SearchBar},

  setup() {
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)
    const buildTime = inject('buildTime', "not available")

    const productName = process.env.VUE_APP_PRODUCT_NAME ?? "Hedera Mirror Node Explorer"

    const showErrorDialog = ref(false)

    const route = useRoute()
    const network = computed( () => { return route.params.network })
    const name = computed( () => { return route.name })

    const showTopRightLogo = inject('isLargeScreen', true)

    const isMobileMenuOpen = ref(false)

    watch(network, (value) => {
      updateSelectedNetworkSilently(value)
    })

    const selectedNetwork = ref(network.value)
    
    let selectedNetworkWatchHandle: WatchStopHandle|undefined
    const updateSelectedNetworkSilently = (newValue: string|string[]) => {
      if (selectedNetworkWatchHandle) {
        selectedNetworkWatchHandle()
      }
      selectedNetwork.value = newValue as string
      selectedNetworkWatchHandle = watch(selectedNetwork, (selection) => {
        router.push({
          name: "MainDashboard",
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
      buildTime,
      productName,
      showErrorDialog,
      name,
      showTopRightLogo,
      isMobileMenuOpen,
      networkRegistry,
      selectedNetwork,
      isDashboardRoute,
      isTransactionRoute,
      isTokenRoute,
      isTopicRoute,
      isContractRoute,
      isAccountRoute,
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