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
  <div v-if="connected">
    <!-- header -->
    <div class="is-flex is-align-items-center">
      <!-- logo icon -->
      <figure class="is-flex is-align-items-center" style="width: 50px; height: 50px;">
        <img :src="walletIconURL ?? undefined" alt="wallet logo"
             style="object-fit: contain; aspect-ratio: 3/2; height: 90%;">
      </figure>

      <!-- accountID-checksum -->
      <div @click="hideWalletInfo" class="is-flex is-align-items-baseline ml-3" style="font-size: 1.35rem;">
        <template v-if="accountId">
          <AccountLink :account-id="accountId"/>
          <span class="has-text-grey h-is-smaller">
                    -{{ accountChecksum }}
                </span>
        </template>
        <template v-else>
          <div>No accounts</div>
        </template>
      </div>
    </div>

    <template v-if="accountId">

      <!-- EVM address -->
      <div class="p-2" style="border: 0.5px solid white;">
        <p class="has-text-grey h-is-smaller">EVM ADDRESS</p>

        <Copyable @copy-made="hideWalletInfo" :content-to-copy="accountEthereumAddress ?? ''">
          <template v-slot:content>
            <div class="is-flex is-align-items-center" style="gap: 0.5rem">
              <p v-if="accountEthereumAddress">
                {{ accountEthereumAddress.slice(0, 15) }}...{{ accountEthereumAddress.slice(-12) }}
              </p>

              <p v-else>N/A</p>
            </div>
          </template>
        </Copyable>
      </div>

      <!-- balance -->
      <div class="p-2" style="border: 0.5px solid white;">
        <p class="has-text-grey h-is-smaller">BALANCE</p>
        <p class="has-text-white" style="font-size: 1.2rem">{{ formattedAmount }} ℏ</p>

        <span>
              <HbarExtra :hide-zero="false" :tbar-amount="tbarBalance ?? 0"/>
            </span>
      </div>


    </template>
    <template v-else>
      <div>Reconnect to your wallet and make sure to select {{ currentNetwork.toUpperCase() }} accounts</div>
    </template>

    <!-- Footer -->
    <div class="is-flex is-justify-content-space-between" style="position: relative;">
      <template v-if="accountId">
        <button  @click="showAccountIdsModal = !showAccountIdsModal" class="button is-white is-small"
                style="outline: none; height: 40px">
          CHANGE ACCOUNT
        </button>

        <button @click="disconnectFromWallet" id="disconnectWalletButton" class="button is-white is-small"
                style="outline: none; height: 40px">
          DISCONNECT WALLET
        </button>
      </template>
      <template v-else>
        <button @click="reconnectToWallet" id="reconnectToWallet" class="button is-white is-small"
                style="outline: none; height: 40px">
          RECONNECT WALLET
        </button>
      </template>

      <div v-if="showAccountIdsModal"
           :class="{'box': !isTouchDevice && isSmallScreen, 'h-box-border': !isTouchDevice && isSmallScreen}"
           style="position: absolute; z-index: 10; padding: 0.6rem; width: 44%; top: 120%; display: flex; flex-direction: column; gap: 0.3rem; max-height: 120px; overflow-y: auto;"
      >
        <div
            v-for="account in accountIds" :key="account"
            class="is-flex is-align-items-center is-justify-content-space-between is-hover"
            style="cursor: pointer;"
            @click="changeAccount(account)"
        >
          <p>{{ account }}</p>
          <i v-if="account === accountId" class="fas fa-solid fa-check is-flex is-align-items-center"
             style="font-size: 0.7rem;"/>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">
import Copyable from "@/components/Copyable.vue";
import {routeManager, walletManager} from "@/router";
import HbarExtra from "@/components/values/HbarExtra.vue";
import {AccountLocParser} from '@/utils/parser/AccountLocParser';
import {BalanceAnalyzer} from '@/utils/analyzer/BalanceAnalyzer';
import {computed, defineComponent, inject, onBeforeUnmount, onMounted, ref} from 'vue';
import AccountLink from "@/components/values/link/AccountLink.vue";
import {NetworkConfig} from "@/config/NetworkConfig";


export default defineComponent({
  name: "WalletInfo",
  components: {AccountLink, HbarExtra, Copyable},
  props: {
    connected: {
      type: Boolean,
      default: false,
    },
    showWalletInfo: {
      type: Boolean,
      default: false,
    },
    walletIconURL: {
      type: String,
      default: undefined,
    },
    accountId: {
      type: String,
      default: undefined,
    },
    accountIds: {
      type: Array<string>,
      default: undefined,
    },
  },
  emit: ['walletDisconnect', 'walletReconnect', 'changeAccount', 'update:showWalletInfo'],

  setup(props, ctx) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)
    const chosenAccountId = computed(() => props.accountId)
    const showAccountIdsModal = ref(false)
    const networkConfig = NetworkConfig.inject()

    //
    // Account
    //
    const accountLocParser = new AccountLocParser(walletManager.accountId, networkConfig)
    onMounted(() => accountLocParser.mount())
    onBeforeUnmount(() => accountLocParser.unmount())

    const accountRoute = computed(() => {
      return walletManager.accountId.value !== null
          ? routeManager.makeRouteToAccount(walletManager.accountId.value)
          : null
    })

    const accountEthereumAddress = accountLocParser.ethereumAddress

    //
    // Balance
    //
    const balanceAnalyzer = new BalanceAnalyzer(accountLocParser.accountId, 10000)
    onMounted(() => balanceAnalyzer.mount())
    onBeforeUnmount(() => balanceAnalyzer.unmount())

    const hbarBalance = computed(() => {
      return (balanceAnalyzer.hbarBalance.value ?? 0) / 100000000
    })

    const formattedAmount = computed(() => {
      const amountFormatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 8
      })
      return amountFormatter.format(hbarBalance.value)
    })

    //
    // Change account
    //
    const changeAccount = (accountId: string) => {
      ctx.emit('changeAccount', accountId)
      showAccountIdsModal.value = false;
      hideWalletInfo()
    }

    //
    // disconnect from wallet
    //
    const disconnectFromWallet = () => {
      ctx.emit('walletDisconnect', true)
      showAccountIdsModal.value = false;
      hideWalletInfo()
    }

    //
    // reconnect to wallet
    //
    const reconnectToWallet = () => {
      ctx.emit('walletReconnect', true)
      showAccountIdsModal.value = false
      hideWalletInfo()
    }

    const hideWalletInfo = () => {
      ctx.emit('update:showWalletInfo', false)
    }

    return {
      accountRoute,
      isTouchDevice,
      changeAccount,
      isSmallScreen,
      isMediumScreen,
      formattedAmount,
      chosenAccountId,
      showAccountIdsModal,
      disconnectFromWallet,
      reconnectToWallet,
      hideWalletInfo,
      accountEthereumAddress,
      tbarBalance: balanceAnalyzer.hbarBalance,
      accountChecksum: accountLocParser.accountChecksum,
      currentNetwork: routeManager.currentNetwork,
    }
  },
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>
.is-hover:hover {
  color: grey;
}
</style>

