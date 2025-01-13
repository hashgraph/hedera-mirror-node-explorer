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

  <ButtonView
      id="connectWalletButton"
      :size="ButtonSize.medium"
      :is-default="true"
      :enabled="!connecting"
      @action="chooseWallet"
  >
    {{ connecting ? "Connecting…" : "CONNECT WALLET" }}
  </ButtonView>

  <WalletChooser v-model:show-dialog="showWalletChooser" v-on:choose-wallet="handleChooseWallet"/>
  <ConnectWalletDialog :error="connectError" :controller="connectDialogController"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, ref} from "vue";
import router, {routeManager, walletManager} from "@/router.ts";
import {WalletManagerStatus} from "@/utils/wallet/WalletManagerV4.ts";
import {WalletClientRejectError} from "@/utils/wallet/client/WalletClient.ts";
import {gtagWalletConnect, gtagWalletConnectionFailure} from "@/gtag.ts";
import WalletChooser, {WalletItem} from "@/components/staking/WalletChooser.vue";
import {DialogController} from "@/dialogs/core/dialog/DialogController.ts";
import ConnectWalletDialog from "@/components/wallet/ConnectWalletDialog.vue";
import ButtonView, {ButtonSize} from "@/dialogs/core/dialog/ButtonView.vue";

//
// Connection state
//

const connecting = computed(() => {
  return walletManager.status.value == WalletManagerStatus.initializing
      || walletManager.status.value == WalletManagerStatus.restoring
      || walletManager.status.value == WalletManagerStatus.connecting

})


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
// ConnectDialog
//

const connectDialogController = new DialogController()
const connectError = ref<unknown>()


</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>
</style>
