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

  <DropdownPanel v-model:deployed="showWalletInfo" :right-aligned="true">
    <template #button>
      <ButtonView
          id="walletInfoBanner"
          :is-transparent="true"
          :is-default="true"
          :is-small="true"
          @action="showWalletInfo = !showWalletInfo"
      >
        <div class="left">
          <img :src="walletIconURL ?? undefined" alt="wallet logo">
          {{ accountId !== null ? accountId : "No account" }}
        </div>
        <div class="right">
          <i v-if="!showWalletInfo" class="fas fa-solid fa-angle-down"/>
          <i v-else class="fas fa-solid fa-angle-up"/>
        </div>
      </ButtonView>
    </template>
    <template #panel>
      <WalletInfo
          :connected="connected"
          :accountIds="accountIds"
          v-model:show-wallet-info="showWalletInfo"
          :accountId="accountId ?? undefined"
          :walletIconURL="walletIconURL ?? undefined"
          @wallet-disconnect="disconnectFromWallet"
          @wallet-reconnect="reconnectToWallet"
          @change-account="handleChangeAccount"/>
    </template>
  </DropdownPanel>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import WalletInfo from "@/components/wallet/WalletInfo.vue";
import {computed, ref} from "vue";
import router, {routeManager, walletManager} from "@/router.ts";
import {WalletManagerStatus} from "@/utils/wallet/WalletManagerV4.ts";
import DropdownPanel from "@/components/DropdownPanel.vue";
import ButtonView from "@/dialogs/core/dialog/ButtonView.vue";


//
// Wallet manager
//

const connected = computed(() => walletManager.status.value == WalletManagerStatus.connected)
const accountId = walletManager.accountId
const accountIds = walletManager.accountIds
const walletIconURL = walletManager.walletIconURL

//
// Connect / disconnect
//

const handleChangeAccount = (chosenAccountId: string) => {
  walletManager.selectAccountId(chosenAccountId)
  if (walletManager.accountId.value) {
    router.push(routeManager.makeRouteToAccount(walletManager.accountId.value))
  }
}

const disconnectFromWallet = async () => {
  await walletManager.disconnect()
}

const reconnectToWallet = async () => {
  const walletUUID = walletManager.walletUUID.value
  await walletManager.disconnect()
  await walletManager.connect(walletUUID)
}


//
// Wallet Info
//

const showWalletInfo = ref(false)

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.left {
  align-items: center;
  column-gap: 10px;
  display: flex;
  font-family: "Styrene A Web", sans-serif;
  justify-content: space-between;
}

div.right {
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding-left: 4px;
}

img {
  max-height: 24px;
}

figure {
  display: flex;
  align-items: center;
}

</style>
