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

  <div :class="{'is-active': showDialog}" class="modal has-text-white">
    <div class="modal-background"/>
    <div class="modal-content" style="width: 634px; border-radius: 16px">
      <div class="box">
        <div class="is-flex is-justify-content-space-between is-align-items-self-end">
          <span class="h-is-primary-title">Connect Wallet</span>
          <a @click="handleCancel">
            <img alt="" src="@/assets/close-icon.png" style="max-height: 20px;">
          </a>
        </div>
        <hr class="h-card-separator"/>

        <div class="is-flex is-justify-content-space-evenly is-align-items-center is-flex-wrap-wrap">
          <div v-for="d in walletItems" :key="d.name">
            <a :id="d.name" @click="chosenWallet=d" @dblclick="handleConnect">
              <div class="is-flex is-flex-direction-row is-align-items-center h-chooser-figure" :class="{'selected':isSelected(d)}">
                <img :src="d.iconURL ?? undefined" alt="wallet logo" class="h-chooser-img">
                <div class="ml-3">{{ d.name }}</div>
              </div>
            </a>
          </div>
        </div>

        <div class="is-flex is-justify-content-flex-end mt-4">
          <button id="cancelButton" class="button is-white is-small" @click="handleCancel">CANCEL</button>
          <button id="connectButton" :disabled="!chosenWallet" class="button is-info is-small ml-4"
                  @click="handleConnect">CONNECT
          </button>
        </div>
      </div>
    </div>
  </div>


  <OptOutDialog v-model:show-dialog="showDisclaimerDialog"
                @onClose="handleCancelDisclaimer" @onAgree="handleAgreeDisclaimer">
    <template v-slot:dialogMessage>
      <span>Disclaimer</span>
    </template>
    <template v-slot:dialogDetails>
      <div v-html="disclaimer"/>
    </template>
  </OptOutDialog>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, ref} from "vue";
import OptOutDialog from "@/dialogs/OptOutDialog.vue";
import {AppStorage} from "@/AppStorage";
import {CoreConfig} from "@/config/CoreConfig";
import {EIP6963Agent} from "@/utils/wallet/EIP6963Agent";

const showDialog = defineModel("showDialog", {
    type: Boolean,
    default: false
})
const chosenWallet =ref<WalletItem|null>(null)
const showDisclaimerDialog = ref(false)
    const disclaimer = CoreConfig.inject().walletChooserDisclaimerPopup ?? ""

const emit = defineEmits(["chooseWallet"])


//
// Wallet items
//

export interface WalletItem {
  name: string
  iconURL: string
  uuid: string|null
}

const walletConnectID = CoreConfig.inject().walletConnectID
const walletItems = computed<WalletItem[]>(() => {
  const result: WalletItem[] = []
  if (walletConnectID !== null) {
    result.push({ name: "Wallet Connect", iconURL: WALLECT_CONNECT_LOGO, uuid: null})
  }
  for (const d of EIP6963Agent.instance.providers.value) {
    result.push({ name: d.info.name, iconURL: d.info.icon, uuid: d.info.uuid })
  }
  return result
})

const isSelected = (wallet: WalletItem) => {
  return chosenWallet.value !== null && (chosenWallet.value.name === wallet.name)
}

const handleConnect = () => {
  showDialog.value = false
  if (disclaimer && !AppStorage.getSkipDisclaimer()) {
    showDisclaimerDialog.value = true
  } else if (chosenWallet.value !== null) {
    emit('chooseWallet', chosenWallet.value)
  }
}

const handleCancel = () => {
  showDialog.value = false
}


//
// Disclaimer
//

const handleCancelDisclaimer = () => {
  showDisclaimerDialog.value = false
}

const handleAgreeDisclaimer = () => {
  showDisclaimerDialog.value = false
  emit('chooseWallet', chosenWallet.value)
}



const WALLECT_CONNECT_LOGO =
    "data:image/svg+xml,%3Csvg fill='none' height='400' viewBox='0 0 400 400' width='400' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3CclipPath id='a'%3E%3Cpath d='m0 0h400v400h-400z'/%3E%3C/clipPath%3E%3Cg clip-path='url(%23a)'%3E%3Ccircle cx='200' cy='200' fill='%233396ff' r='199.5' stroke='%2366b1ff'/%3E%3Cpath d='m122.519 148.965c42.791-41.729 112.171-41.729 154.962 0l5.15 5.022c2.14 2.086 2.14 5.469 0 7.555l-17.617 17.18c-1.07 1.043-2.804 1.043-3.874 0l-7.087-6.911c-29.853-29.111-78.253-29.111-108.106 0l-7.59 7.401c-1.07 1.043-2.804 1.043-3.874 0l-17.617-17.18c-2.14-2.086-2.14-5.469 0-7.555zm191.397 35.529 15.679 15.29c2.14 2.086 2.14 5.469 0 7.555l-70.7 68.944c-2.139 2.087-5.608 2.087-7.748 0l-50.178-48.931c-.535-.522-1.402-.522-1.937 0l-50.178 48.931c-2.139 2.087-5.608 2.087-7.748 0l-70.7015-68.945c-2.1396-2.086-2.1396-5.469 0-7.555l15.6795-15.29c2.1396-2.086 5.6085-2.086 7.7481 0l50.1789 48.932c.535.522 1.402.522 1.937 0l50.177-48.932c2.139-2.087 5.608-2.087 7.748 0l50.179 48.932c.535.522 1.402.522 1.937 0l50.179-48.931c2.139-2.087 5.608-2.087 7.748 0z' fill='%23fff'/%3E%3C/g%3E%3C/svg%3E"

// const HEDERA_LOGO =
//     'data:image/svg+xml;utf8,<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">' +
//     '<path d="M20 0a20 20 0 1 0 20 20A20 20 0 0 0 20 0" fill="black"></path>' +
//     '<path d="M28.13 28.65h-2.54v-5.4H14.41v5.4h-2.54V11.14h2.54v5.27h11.18v-5.27h2.54zm-13.6-7.42h11.18v-2.79H14.53z" fill="white"></path>' +
//     '</svg>'



</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
