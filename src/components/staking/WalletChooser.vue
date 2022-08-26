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

  <OptOutDialog v-model:show-dialog="showDisclaimerDialog"
                @onClose="handleCancelDisclaimer" @onAgree="handleAgreeDisclaimer">
    <template v-slot:dialogMessage>
      <span>Disclaimer</span>
    </template>
    <template v-slot:dialogDetails>
      <div v-html="disclaimer"/>
    </template>
  </OptOutDialog>

  <div :class="{'is-active': showDialog}" class="modal has-text-white">
    <div class="modal-background"/>
    <div class="modal-content" style="width: 768px; border-radius: 16px">
      <div class="box">
        <div class="is-flex is-justify-content-space-between is-align-items-self-end">
            <span class="h-is-primary-title">Choose Wallet</span>
          <a @click="handleCancel">
            <img alt="" src="@/assets/close-icon.png" style="max-height: 20px;">
          </a>
        </div>
        <hr class="h-card-separator"/>

        <div class="is-flex is-justify-content-left is-align-items-center">
          <div v-for="d in drivers" :key="d.name">
              <a :id="d.name" @click="handleChoose(d)">
                <figure class="h-chooser-figure my-4 mr-6">
                  <img class="h-chooser-img" alt="wallet logo" :src="d.iconURL">
                </figure>
              </a>
          </div>
        </div>

      </div>
    </div>
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, ref} from "vue";
import {walletManager} from "@/router";
import {WalletDriver} from "@/utils/wallet/WalletDriver";
import OptOutDialog from "@/components/staking/OptOutDialog.vue";

export default defineComponent({
  name: "WalletChooser",
  components: {OptOutDialog},
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
  },

  emits: [ "chooseWallet", "update:showDialog"],

  setup(props, context) {
    let chosenWallet: WalletDriver
    const showDisclaimerDialog = ref(false)
    const disclaimer = process.env.VUE_APP_WALLET_CHOOSER_DISCLAIMER_POPUP ?? ""

    const handleChoose = (wallet: WalletDriver) => {
      context.emit('update:showDialog', false)
      chosenWallet = wallet
      if (disclaimer) {
        showDisclaimerDialog.value = true
      } else {
        context.emit('chooseWallet', chosenWallet)
      }
    }

    const handleCancel = () => {
      context.emit('update:showDialog', false)
    }

    const handleCancelDisclaimer = () => {
      showDisclaimerDialog.value = false
    }

    const handleAgreeDisclaimer = () => {
      showDisclaimerDialog.value = false
      context.emit('chooseWallet', chosenWallet)
    }

    return {
      showDisclaimerDialog,
      disclaimer,
      handleCancelDisclaimer,
      handleAgreeDisclaimer,
      walletManager,
      drivers:walletManager.getDrivers(),
      handleChoose,
      handleCancel
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
