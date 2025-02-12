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

  <div class="header">

    <!--  First line of header-->
    <div class="header-top">
      <template v-if="isLargeScreen">
        <div class="top-side">
          <ProductLogo/>
          <AxiosStatus/>
          <TabBar/>
        </div>
        <div class="top-side">
          <NetworkSelector/>
          <ConnectWalletButton v-if="!connected"/>
          <WalletStatusButton v-else/>
          <ThemeSwitch/>
        </div>
      </template>
      <template v-else>
        <div class="top-side">
          <MobileMenuButton/>
          <ProductLogo/>
          <AxiosStatus/>
        </div>
        <div class="top-side">
          <ConnectWalletButton v-if="!connected"/>
          <WalletStatusButton v-else/>
        </div>
      </template>
    </div>

    <!--  Central part of header-->
    <div class="title">Explore Hedera Blockchain</div>
    <SearchBar :size="90" class="search-bar"/>

    <!--  Market dashboard part of header-->
    <div class="market-dashboard">
      <MarketDashboard/>
    </div>
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import ProductLogo from "@/components/page/header/ProductLogo.vue";
import NetworkSelector from "@/components/page/header/NetworkSelector.vue";
import ThemeSwitch from "@/components/ThemeSwitch.vue";
import AxiosStatus from "@/components/AxiosStatus.vue";
import TabBar from "@/components/page/header/TabBar.vue";
import SearchBar from "@/components/search/SearchBar.vue";
import ConnectWalletButton from "@/components/page/header/wallet/ConnectWalletButton.vue";
import {computed, inject} from "vue";
import {walletManager} from "@/router.ts";
import {WalletManagerStatus} from "@/utils/wallet/WalletManagerV4.ts";
import WalletStatusButton from "@/components/page/header/wallet/WalletStatusButton.vue";
import MobileMenuButton from "@/components/page/header/MobileMenuButton.vue";
import MarketDashboard from "@/components/dashboard/MarketDashboard.vue";

const isLargeScreen = inject('isLargeScreen', true)
const connected = computed(() => walletManager.status.value == WalletManagerStatus.connected)

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.header {
  align-items: center;
  background: url('@/assets/main-header-background-mobile.svg') top 114px left no-repeat, var(--background-secondary);
  border-bottom-left-radius: 32px;
  border-bottom-right-radius: 32px;
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  padding: 0 16px 24px 16px;
}

@media (min-width: 768px) {
  div.header {
    background: url('@/assets/main-header-background.svg') top 114px left no-repeat, var(--background-secondary);
  }
}

@media (min-width: 1080px) {
  div.header {
    background: url('@/assets/main-header-background.svg') top 114px left no-repeat, var(--background-secondary);
    padding: 0 32px 32px 32px;
  }
}

div.header-top {
  align-items: center;
  column-gap: 16px;
  display: flex;
  height: 72px;
  justify-content: space-between;
  width: 100%;
}

div.top-side {
  align-items: center;
  column-gap: 16px;
  display: flex;
  justify-content: space-between;
}

div.title {
  color: var(--text-primary);
  font-family: 'Styrene A Web', serif;
  font-size: 32px;
  font-weight: 400;
  line-height: 42px;
  margin-top: 34px;
  text-align: center;
}

@media (min-width: 1080px) {
  div.title {
    font-size: 56px;
    font-weight: 500;
    line-height: 74px;
    margin-top: 48px;
  }
}

@media (min-width: 1280px) {
  div.title {
    margin-top: 80px;
  }
}

.search-bar {
  margin-top: 38px;
  max-width: 912px;
  width: 100%;
}

@media (min-width: 1080px) {
  .search-bar {
    margin-top: 16px;
  }
}

.market-dashboard {
  margin-top: 36px;
}

@media (min-width: 768px) {
  .market-dashboard {
    margin-top: 94px;
  }
}

@media (min-width: 1280px) {
  .market-dashboard {
    margin-top: 120px;
  }
}

</style>
