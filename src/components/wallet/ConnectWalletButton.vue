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


  <div>
    <button v-if="!connected" :disabled="connecting" id="connectWalletButton" class="button is-white is-small"
            @click="chooseWallet" style="outline: none; height: 40px; width: 100%; font-size: 0.8rem;">
      {{ connecting ? "Connecting…" : "CONNECT WALLET…" }}
    </button>

    <div v-else @click="showWalletInfo = !showWalletInfo" id="walletInfoBanner"
         class="is-flex is-align-items-center is-justify-content-space-between"
         style="outline: none; height: 40px; width: 100%; font-size: 0.9rem; border: 0.5px solid white; cursor: pointer;">

      <div class="is-flex is-align-items-center is-justify-content-flex-start">
        <figure class="is-flex is-align-items-center mx-1" style="height: 40px;">
          <img :src="walletIconURL ?? undefined" alt="wallet logo"
               style="object-fit: contain; aspect-ratio: 3/2; height: 60%;">
        </figure>
        {{ accountId !== null ? accountId : "No account" }}
      </div>
      <div class="is-flex is-align-items-center is-justify-content-center" style="width: 30px;">
        <i v-if="!showWalletInfo" class="fas fa-solid fa-angle-down is-flex is-align-items-center"/>
        <i v-else class="fas fa-solid fa-angle-up is-flex is-align-items-center"/>
      </div>

    </div>
  </div>

  <WalletChooser v-model:show-dialog="showWalletChooser" v-on:choose-wallet="handleChooseWallet"/>
  <ConnectWalletDialog :error="connectError" :controller="connectDialogController"/>
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

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import WalletChooser, {WalletItem} from "@/components/staking/WalletChooser.vue";
import ConnectWalletDialog from "@/components/wallet/ConnectWalletDialog.vue";
import WalletInfo from "@/components/wallet/WalletInfo.vue";
import router, {routeManager, walletManager} from "@/router";
import {computed, ref} from "vue";
import {WalletManagerStatus} from "@/utils/wallet/WalletManagerV4";
import {DialogController} from "@/dialogs/core/dialog/DialogController.ts";
import {gtagWalletConnect, gtagWalletConnectionFailure} from "@/gtag";
import {WalletClientRejectError} from "@/utils/wallet/client/WalletClient";

//
// Wallet manager
//

const connected = computed(() => walletManager.status.value == WalletManagerStatus.connected)
const connecting = computed(() => {
  return walletManager.status.value == WalletManagerStatus.initializing
      || walletManager.status.value == WalletManagerStatus.restoring
      || walletManager.status.value == WalletManagerStatus.connecting

})
const accountId = walletManager.accountId
const accountIds = walletManager.accountIds
const walletIconURL = walletManager.walletIconURL

//
// ConnectDialog
//

const connectDialogController = new DialogController()
const connectError = ref<unknown>()


//
// Wallet chooser
//

const showWalletChooser = ref(false)
const chooseWallet = () => {
  showWalletChooser.value = true
}

const handleChooseWallet = (walletItem: WalletItem) => {
  walletManager
      .connect(walletItem.uuid)
      .catch((reason) => {
        if (!(reason instanceof WalletClientRejectError)) {
          console.warn("Failed to connect wallet - reason:" + reason.toString())
          connectError.value = reason
          connectDialogController.visible.value = true
          gtagWalletConnectionFailure(walletItem.name)
        }
      })
      .finally(() => {
        navigateToMyAccount()
      })
  // walletIconURL.value = walletManager.getActiveDriver().iconURL || ""
  gtagWalletConnect(walletItem.name)
}

const navigateToMyAccount = () => {
  if (walletManager.accountId.value) {
    router.push(routeManager.makeRouteToAccount(walletManager.accountId.value))
  }
}


//
// Connect / disconnect
//

const handleChangeAccount = (chosenAccountId: string) => {
  walletManager.selectAccountId(chosenAccountId)
  navigateToMyAccount()
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

</style>
