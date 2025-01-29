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

  <WalletChooserDialog v-model:show-dialog="showWalletChooser" @choose-wallet="handleChooseWallet"/>

  <AlertDialog v-model:visible="showConnectErrorDialog">
    <template #alertMessage>
      <div>{{ mainMessage }}</div>
      <div>{{ extraMessage }}</div>
    </template>
  </AlertDialog>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, ref} from "vue";
import router, {routeManager, walletManager} from "@/router.ts";
import {WalletManagerStatus} from "@/utils/wallet/WalletManagerV4.ts";
import {WalletClientError, WalletClientRejectError} from "@/utils/wallet/client/WalletClient.ts";
import WalletChooserDialog, {WalletItem} from "@/dialogs/WalletChooserDialog.vue";
import AlertDialog from "@/dialogs/AlertDialog.vue";
import ButtonView from "@/dialogs/core/ButtonView.vue";
import {ButtonSize} from "@/dialogs/core/DialogUtils.ts";
import {gtagWalletConnect, gtagWalletConnectionFailure} from "@/gtag.ts";

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
          showConnectErrorDialog.value = true
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
// Error alert
//

const mainMessage = computed(
    () => connectError.value instanceof WalletClientError
        ? connectError.value.message
        : "Unexpected error"
)
const extraMessage = computed(
    () => connectError.value instanceof WalletClientError
        ? connectError.value.extra
        : JSON.stringify(connectError.value)
)

const showConnectErrorDialog = ref(false)
const connectError = ref<unknown>()


</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>
</style>
