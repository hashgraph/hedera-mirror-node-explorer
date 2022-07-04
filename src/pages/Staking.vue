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

  <section :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}" class="section">

    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">My Staking</span>
      </template>
      <template v-slot:table>

        <section class="section has-text-centered" style="min-height: 450px">
          <p class="h-is-tertiary-text" style="font-weight: 300">
            To view or change your staking you first need to connect to your wallet.
          </p>
          <br/>
          <template v-if="connected">
            <p>Connected to {{ walletName ?? "?" }}</p>
            <p>Network: {{ connectedNetwork }}</p>
            <template v-if="accountId">
              <p>Account ID: {{ accountId }}</p>
            </template>
            <template v-else>
              <p>No account found</p>
            </template>
            <br/>
            <button class="button" @click="disconnectFromWallet">Disconnect from Wallet</button>
          </template>
          <template v-else>
            <button class="button" @click="connectToWallet">Connect to Wallet…</button>
          </template>
        </section>

      </template>
    </DashboardCard>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";
import Footer from "@/components/Footer.vue";
import {hashConnectManager} from "@/router";

export default defineComponent({
  name: 'Staking',

  props: {
    network: String
  },

  components: {
    Footer,
    DashboardCard
  },

  setup() {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    const connectToWallet = (event: MouseEvent) => {
      if (event.altKey) {
        hashConnectManager.reset()
        console.log("HashConnectManager has been reset")
      } else {
        hashConnectManager.connect()
      }
      if (event.target instanceof HTMLButtonElement) {
        event.target.blur()
      }
    }

    const disconnectFromWallet = () => {
      hashConnectManager.disconnect()
    }

    return {
      isSmallScreen,
      isTouchDevice,
      connectToWallet,
      disconnectFromWallet,
      connected: hashConnectManager.connected,
      connectedNetwork: hashConnectManager.connectedNetwork,
      walletName: hashConnectManager.walletName,
      walletIconURL: hashConnectManager.walletIconURL,
      accountId: hashConnectManager.accountId
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>