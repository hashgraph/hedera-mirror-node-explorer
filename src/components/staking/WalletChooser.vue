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

        <div class="is-flex is-justify-content-left">
          <div v-for="d in walletManager.getDrivers()" :key="d.name">
            <button class="button is-white is-small mr-4" @click="handleChoose(d)">{{ d.name }}</button>
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

import {defineComponent, onMounted} from "vue";
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

  setup(props, context) {

    onMounted(() => {
      for (const d of walletManager.getDrivers()) {
      }
    })

    const handleChoose = (wallet: WalletDriver) => {
      walletManager.setActiveDriver(wallet)
      walletManager.connect()
      context.emit('update:showDialog', false)
    }

    const handleCancel = () => {
      context.emit('update:showDialog', false)
    }

    return {
      walletManager,
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

