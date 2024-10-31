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

        <div class="is-flex is-justify-content-left is-align-items-center is-flex-wrap-wrap">
          <div v-for="d in drivers" :key="d.name">
            <a :id="d.name" @click="chosenWallet=d" @dblclick="handleConnect">
              <figure :class="{'selected':isSelected(d)}" class="h-chooser-figure my-4 mr-6">
                <img :src="d.logoURL ?? undefined" alt="wallet logo" class="h-chooser-img">
              </figure>
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

<script lang="ts">

import {defineComponent, ref} from "vue";
import {walletManager} from "@/router";
import {WalletDriver} from "@/utils/wallet/WalletDriver";
import OptOutDialog from "@/components/staking/OptOutDialog.vue";
import {AppStorage} from "@/AppStorage";
import {CoreConfig} from "@/config/CoreConfig";

export default defineComponent({
  name: "WalletChooser",
  components: {OptOutDialog},
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
  },

  emits: ["chooseWallet", "update:showDialog"],

  setup(props, context) {
    const chosenWallet = ref<WalletDriver | null>(null)
    const showDisclaimerDialog = ref(false)
    const disclaimer = CoreConfig.inject().walletChooserDisclaimerPopup ?? ""

    const handleConnect = () => {
      context.emit('update:showDialog', false)
      if (disclaimer && !AppStorage.getSkipDisclaimer()) {
        showDisclaimerDialog.value = true
      } else {
        context.emit('chooseWallet', chosenWallet.value)
      }
    }

    const isSelected = (wallet: WalletDriver) => {
      return chosenWallet.value && (chosenWallet.value.name === wallet.name)
    }

    const handleCancel = () => {
      context.emit('update:showDialog', false)
    }

    const handleCancelDisclaimer = () => {
      showDisclaimerDialog.value = false
    }

    const handleAgreeDisclaimer = () => {
      showDisclaimerDialog.value = false
      context.emit('chooseWallet', chosenWallet.value)
    }

    return {
      showDisclaimerDialog,
      disclaimer,
      handleCancelDisclaimer,
      handleAgreeDisclaimer,
      isSelected,
      chosenWallet,
      walletManager,
      drivers: walletManager.getDrivers(),
      handleConnect,
      handleCancel
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
