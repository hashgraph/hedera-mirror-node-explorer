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

  <div class="root">

    <!--  First line of page header-->
    <div class="l1">
      <template v-if="isLargeScreen">
        <div class="left">
          <ProductLogo/>
          <AxiosStatus/>
          <TabBar/>
        </div>
        <div class="right">
          <NetworkSelector/>
          <ConnectWalletButton v-if="!connected"/>
          <WalletStatusButton v-else/>
          <ThemeSwitch/>
        </div>
      </template>
      <template v-else>
        <div class="left">
          <MobileMenuButton/>
          <ProductLogo/>
          <AxiosStatus/>
        </div>
        <div class="right">
          <ConnectWalletButton v-if="!connected"/>
          <WalletStatusButton v-else/>
        </div>
      </template>
    </div>

    <!--  Second line of page header-->
    <div class="l2">
      <template v-if="isMediumScreen">
        <div class="title">{{ props.pageTitle }}</div>
        <SearchBar/>
      </template>
      <template v-else>
        <template v-if="showSearchBar">
          <SearchBar @search="onSearch" style="flex-grow: 1"/>
        </template>
        <template v-else>
          <div class="title">{{ props.pageTitle }}</div>
          <button class="search-button" @click="onClick">
            <Search :size="18" class="search-icon"/>
          </button>
        </template>
      </template>
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
import {computed, inject, ref} from "vue";
import {walletManager} from "@/router.ts";
import {WalletManagerStatus} from "@/utils/wallet/WalletManagerV4.ts";
import WalletStatusButton from "@/components/page/header/wallet/WalletStatusButton.vue";
import MobileMenuButton from "@/components/page/header/MobileMenuButton.vue";
import {Search} from "lucide-vue-next";

const props = defineProps({
  pageTitle: {
    type: String,
    required: true,
  }
})

const isLargeScreen = inject('isLargeScreen', true)
const isMediumScreen = inject('isMediumScreen', true)
const connected = computed(() => walletManager.status.value == WalletManagerStatus.connected)
const showSearchBar = ref(false)

const onClick = () => showSearchBar.value = true
const onSearch = () => showSearchBar.value = false

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.root {
  background: var(--background-secondary);
  border-bottom-left-radius: 32px;
  border-bottom-right-radius: 32px;
  margin-bottom: 16px;
  padding: 0 16px ;
}
@media (min-width: 1080px) {
  div.root {
    background: url('@/assets/header-background.svg') top left no-repeat, var(--background-tertiary);
    padding: 0 32px 24px;
  }
}

div.l1 {
  align-items: center;
  column-gap: 16px;
  display: flex;
  height: 72px;
  justify-content: space-between;
}

div.left {
  align-items: center;
  column-gap: 16px;
  display: flex;
  justify-content: space-between;
}

div.right {
  align-items: center;
  column-gap: 16px;
  display: flex;
  justify-content: space-between;
}

div.l2 {
  align-items: center;
  display: flex;
  height: 72px;
  justify-content: space-between;
}

div.title {
  color: var(--text-primary);
  font-family: 'Styrene A Web', serif;
  font-size: 18px;
  font-weight: 500;
  line-height: 20px;
  margin: 0;
}
@media (min-width: 1080px) {
  div.title {
    font-size: 32px;
    font-weight: 400;
    height: 42px;
    line-height: 36px;
  }
}

button.search-button {
  height: 48px;
  width: 66px;
  background-color: var(--network-theme-color);
  border-radius: 24px;
  border-style: solid;
  border-width: 0;
  margin: 6px;
}

.search-icon {
  color: var(--network-button-text-color);
  margin-top: 4px;
}

</style>
