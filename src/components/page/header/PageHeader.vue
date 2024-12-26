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
    <div class="l1">
      <div class="left">
        <HeaderLogo/>
        <AxiosStatus/>
        <TabBar/>
      </div>
      <div class="right">
        <NetworkSelector/>
        <ConnectWalletButton v-if="!connected"/>
        <WalletStatusButton v-else/>
        <ThemeSwitch/>
      </div>
    </div>
    <div class="l2">
      Breadcrumb
    </div>
    <div class="l3">
      <div class="title">{{ props.pageTitle }}</div>
      <SearchBarV2/>
    </div>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import HeaderLogo from "@/components/page/header/ProductLogo.vue";
import NetworkSelector from "@/components/page/header/NetworkSelector.vue";
import ThemeSwitch from "@/components/ThemeSwitch.vue";
import AxiosStatus from "@/components/AxiosStatus.vue";
import TabBar from "@/components/page/header/TabBar.vue";
import SearchBarV2 from "@/components/search/SearchBarV2.vue";
import ConnectWalletButton from "@/components/page/header/wallet/ConnectWalletButton.vue";
import {computed} from "vue";
import {walletManager} from "@/router.ts";
import {WalletManagerStatus} from "@/utils/wallet/WalletManagerV4.ts";
import WalletStatusButton from "@/components/page/header/wallet/WalletStatusButton.vue";

const props = defineProps({
  pageTitle: {
    type: String,
    required: true,
  }
})

const connected = computed(() => walletManager.status.value == WalletManagerStatus.connected)

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.root {
  background-color: var(--background-tertiary);
  border-bottom-left-radius: 32px;
  border-bottom-right-radius: 32px;
  margin-bottom: 16px;
  padding: 16px 32px;
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

div.l3 {
  align-items: center;
  display: flex;
  height: 72px;
  justify-content: space-between;
}

div.title {
  color: var(--text-primary);
  font-family: 'Styrene A Web',serif;
  font-size: 32px;
  font-weight: 400;
  height: 42px;
  margin: 0;
}

</style>
