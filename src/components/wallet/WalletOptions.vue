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
  <div class="wallet-options">

    <!-- header -->
    <div class="wallet-options-title">
      <div style="height: 40px">
        <EntityLink :route="accountRoute">
          <LabelView :icon-url="walletIconURL">
            <div style="display: flex; align-items: center; justify-content: center;">
              {{ accountId }}
              <span style="color: var(--text-secondary)">-{{ accountChecksum }}</span>
            </div>
          </LabelView>
        </EntityLink>
      </div>
    </div>

    <!-- content -->

    <template v-if="accountId">

      <div class="wallet-options-content">

        <!-- EVM Address -->
        <GroupBoxView>
          <template #groupBoxTitle>EVM Address</template>
          <template #default>
            <EVMAddress :address="accountEthereumAddress" :show-id="false"/>
          </template>
        </GroupBoxView>

        <!-- Balance -->
        <GroupBoxView>
          <template #groupBoxTitle>Balance</template>
          <template #default>
            {{ formattedAmount}} ℏ
            <div style="color: var(--text-secondary)">
              <HbarExtra :hide-zero="false" :tbar-amount="tbarBalance ?? 0"/>
            </div>
          </template>
        </GroupBoxView>

      </div>

    </template>

    <template v-else>
      Reconnect to your wallet and make sure to select {{ currentNetwork.toUpperCase() }} accounts
    </template>

    <!-- footer -->
    <div class="wallet-options-footer">
      <template v-if="accountId">
        <ButtonView @action="handleDisconnect">DISCONNECT WALLET</ButtonView>
<!--        <template v-if="accountCount >= 2">-->
<!--          <ButtonView @action="handleChangeAccount">CHANGE ACCOUNT</ButtonView>-->
<!--        </template>-->
      </template>
      <template v-else>
        <ButtonView @action="handleReconnect">RECONNECT WALLET</ButtonView>
      </template>
    </div>

  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, onBeforeUnmount, onMounted} from "vue";
import {routeManager, walletManager} from "@/router.ts";
import GroupBoxView from "@/elements/GroupBoxView.vue";
import ButtonView from "@/dialogs/core/ButtonView.vue";
import LabelView from "@/elements/LabelView.vue";
import {AccountLocParser} from "@/utils/parser/AccountLocParser.ts";
import {NetworkConfig} from "@/config/NetworkConfig.ts";
import {BalanceAnalyzer} from "@/utils/analyzer/BalanceAnalyzer.ts";
import HbarExtra from "@/components/values/HbarExtra.vue";
import EntityLink from "@/components/values/link/EntityLink.vue";
import EVMAddress from "@/components/values/EVMAddress.vue";

const showWalletOptions = defineModel("showWalletOptions", {
  type: Boolean,
  required: true
})

const networkConfig = NetworkConfig.inject()
const accountLocParser = new AccountLocParser(walletManager.accountId, networkConfig)
onMounted(() => accountLocParser.mount())
onBeforeUnmount(() => accountLocParser.unmount())

const balanceAnalyzer = new BalanceAnalyzer(accountLocParser.accountId, 10000)
onMounted(() => balanceAnalyzer.mount())
onBeforeUnmount(() => balanceAnalyzer.unmount())

const formattedAmount = computed(() => {
  const amountFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8
  })
  return amountFormatter.format(hbarBalance.value)
})

const accountRoute = computed(() => {
  const accountId = walletManager.accountId.value
  return accountId !== null ? routeManager.makeRouteToAccount(accountId) : null
})


const walletIconURL = computed(() => walletManager.walletIconURL.value ?? undefined)
const accountId = computed(() => walletManager.accountId.value ?? "No account ID")
const accountChecksum = accountLocParser.accountChecksum ?? ""
// const accountCount = computed(() => walletManager.accountIds.value.length)
const accountEthereumAddress = accountLocParser.ethereumAddress
const hbarBalance = computed(() => (balanceAnalyzer.hbarBalance.value ?? 0) / 100000000)
const tbarBalance = balanceAnalyzer.hbarBalance
const currentNetwork = routeManager.currentNetwork


const handleDisconnect = async () => {
  showWalletOptions.value = false
  await walletManager.disconnect()
}

const handleReconnect = async () => {
  showWalletOptions.value = false
  const walletUUID = walletManager.walletUUID.value
  await walletManager.disconnect()
  await walletManager.connect(walletUUID)
}
//
// const handleChangeAccount = () => {
//   showWalletOptions.value = false
// }

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.wallet-options {
  align-items: stretch;
  display: flex;
  flex-direction: column;
  row-gap: 24px;
}

div.wallet-options-title {
  align-items: center;
  border-bottom-color: var(--network-theme-color);
  border-bottom-style: solid;
  border-bottom-width: 1px;
  color: var(--text-primary);
  display: flex;
  padding-bottom: 16px;
}

div.wallet-options-content {
  align-items: stretch;
  display: flex;
  flex-direction: column;
  row-gap: 8px;
}

div.wallet-options-footer {
  align-items: center;
  column-gap: 8px;
  display: flex;
  flex-direction: row-reverse;
}


</style>
