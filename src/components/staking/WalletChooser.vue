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

import {defineComponent} from "vue";
import {walletManager} from "@/router";
import {WalletDriver} from "@/utils/wallet/WalletDriver";

export default defineComponent({
  name: "WalletChooser",
  components: {},
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
  },

  emits: [ "chooseWallet", "update:showDialog"],

  setup(props, context) {

    const handleChoose = (wallet: WalletDriver) => {
      context.emit('chooseWallet', wallet)
      context.emit('update:showDialog', false)
    }

    const handleCancel = () => {
      context.emit('update:showDialog', false)
    }

    return {
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
