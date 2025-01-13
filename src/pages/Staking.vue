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

  <PageFrameV2 page-title="Staking">

    <ChangeStakingDialog v-model:show-dialog="changeStakingDialogVisible"
                         :account="account ?? undefined"
                         :currently-staked-to="stakedTo ?? undefined"
                         v-on:staking-changed="stakingChanged"/>

    <StopStakingDialog v-model:show-dialog="stopStakingDialogVisible"
                         :account="account ?? undefined"
                         v-on:staking-changed="stakingChanged"/>

    <ConfirmDialog v-model:show-dialog="stopConfirmDialogVisible" @onConfirm="handleStopStaking"
                   :main-message="'Do you want to stop staking to ' + stakedTo +'?'">
      <template v-slot:confirmTitle>
        <span class="h-is-primary-title">My Staking </span>
        <span v-if="accountId" class="h-is-tertiary-text"> for account </span>
        <span v-if="accountId" class="h-is-secondary-text has-text-weight-light mr-3">{{ accountId }}</span>
      </template>
    </ConfirmDialog>

    <ProgressDialog v-model:show-dialog="showProgressDialog"
                    :mode="progressDialogMode"
                    :main-message="progressMainMessage"
                    :extra-message="progressExtraMessage"
                    :extra-transaction-id="progressExtraTransactionId"
                    :show-spinner="showProgressSpinner"
    >
      <template v-slot:dialogTitle>
        <span class="h-is-primary-title">{{ progressDialogTitle }}</span>
      </template>
    </ProgressDialog>

    <ProgressDialog v-model:show-dialog="notWithMetamaskDialogVisible"
                    :mode="Mode.Error"
                    main-message="This operation cannot be done using Metamask"
                    extra-message="Use another wallet (Blade or Hashpack)"
    >
      <template v-slot:dialogTitle>
        <span class="h-is-primary-title">Unsupported Operation</span>
      </template>
    </ProgressDialog>

    <div class="page-container">

      <DashboardCardV2 v-if="enableWallet" collapsible-key="stakingDetails">
        <template #title>
          <span>My Staking </span>
          <template v-if="accountId">
            <span> for account </span>
            <AccountLink :account-id="accountId"/>
            <span class="checksum">-{{ accountChecksum }}</span>
          </template>
        </template>

        <template #content>

          <div class="my-staking-section">

            <template v-if="accountId">

              <div class="my-staking-dashboard">
                <NetworkDashboardItemV2
                    title="STAKED TO"
                    :value="stakedTo"
                    :extra="stakePeriodStart ? ('since ' + stakePeriodStart) : undefined"
                />
                <NetworkDashboardItemV2
                    title="MY STAKE"
                    :value="stakedAmount"
                    :unit="stakedAmount ? cryptoName : ''"
                />
                <NetworkDashboardItemV2
                    v-if="!ignoreReward && declineReward && !pendingReward"
                    title="REWARDS"
                    value="Declined"
                />
                <NetworkDashboardItemV2
                    v-else
                    title="PENDING REWARDS"
                    :value="pendingReward"
                    :unit="pendingReward ? cryptoName : ''"
                />
              </div>

              <div v-if="isHieroWallet" class="my-staking-buttons">
                <ButtonView
                    id="stopStakingButton"
                    :enabled="stakedTo !== null"
                    @action="showStopConfirmDialog"
                >
                  STOP STAKING
                </ButtonView>
                <ButtonView
                    id="showStakingDialog"
                    :is-default="true"
                    @action="showStakingDialog"
                >
                  CHANGE STAKING
                </ButtonView>
              </div>
              <p v-else class="connect-wallet-text">
                To change your staking options use Blade or HashPack.
              </p>

              <p class="staking-notice">
                <span>Please Note: Your full balance is automatically staked. </span>
                <span>Your funds are fully available for use while staked. You can unstake or switch nodes freely.</span>
              </p>
            </template>

            <template v-else>
              <p class="connect-wallet-text">
                To view or change your staking options first connect your wallet.
              </p>
            </template>
          </div>

        </template>
      </DashboardCardV2>

      <RecentRewardsSection/>

      <RewardsCalculator :amount-in-hbar="balanceInHbar" :node-id="stakedNode?.node_id"/>

    </div>

  </PageFrameV2>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, onBeforeUnmount, onMounted, ref} from 'vue';
import PageFrameV2 from "@/components/page/PageFrameV2.vue";
import {routeManager, walletManager} from "@/router";
import ChangeStakingDialog from "@/dialogs/ChangeStakingDialog.vue";
import StopStakingDialog from "@/dialogs/StopStakingDialog.vue";
import ConfirmDialog from "@/dialogs/ConfirmDialog.vue";
import ProgressDialog, {Mode} from "@/components/staking/ProgressDialog.vue";
import AccountLink from "@/components/values/link/AccountLink.vue";
import RewardsCalculator from "@/components/staking/RewardsCalculator.vue";
import {NodeAnalyzer} from "@/utils/analyzer/NodeAnalyzer";
import {AccountLocParser} from "@/utils/parser/AccountLocParser";
import {gtagTransaction} from "@/gtag";
import {NetworkConfig} from "@/config/NetworkConfig";
import {CoreConfig} from "@/config/CoreConfig.ts";
import DashboardCardV2 from "@/components/DashboardCardV2.vue";
import NetworkDashboardItemV2 from "@/components/node/NetworkDashboardItemV2.vue";
import RecentRewardsSection from "@/components/staking/RecentRewardsSection.vue";
import ButtonView from "@/dialogs/core/dialog/ButtonView.vue";

defineProps({
  network: String
})

const cryptoName = CoreConfig.inject().cryptoName
const networkConfig = NetworkConfig.inject()

const changeStakingDialogVisible = ref(false)
const stopStakingDialogVisible = ref(false)
const stopConfirmDialogVisible = ref(false)
const showProgressDialog = ref(false)
const progressDialogMode = ref(Mode.Busy)
const progressDialogTitle = ref<string | null>(null)
const progressMainMessage = ref<string | null>(null)
const progressExtraMessage = ref<string | null>(null)
const progressExtraTransactionId = ref<string | null>(null)
const showProgressSpinner = ref(false)

//
// Account
//
const accountLocParser = new AccountLocParser(walletManager.accountId, networkConfig)
onMounted(() => accountLocParser.mount())
onBeforeUnmount(() => accountLocParser.unmount())

const isStakedToNode = computed(() => accountLocParser.stakedNodeId.value !== null)
const isStakedToAccount = computed(() => accountLocParser.stakedAccountId.value)
const isStaked = computed(() => isStakedToNode.value || isStakedToAccount.value)

const stakedTo = computed(() => {
  let result: string | null
  if (isStakedToAccount.value) {
    result = "Account " + accountLocParser.stakedAccountId.value
  } else if (isStakedToNode.value) {
    result = "Node " + accountLocParser.stakedNodeId.value + " - " + stakedNodeAnalyzer.shortNodeDescription.value
  } else {
    result = null
  }
  return result
})

const balanceInHbar = computed(() => {
  const balance = accountLocParser.balance.value ?? 10000000000
  return balance / 100000000
})

const stakedAmount = computed(() => isStaked.value ? formatHbarAmount(accountLocParser.balance.value) : null)

const formatHbarAmount = (amount: number | null) => {
  let result: string | null
  if (amount) {
    const amountFormatter = new Intl.NumberFormat("en-US", {maximumFractionDigits: 8})
    result = amountFormatter.format(amount / 100000000)
  } else {
    result = null
  }
  return result
}

const pendingReward = computed(() => formatHbarAmount(accountLocParser.pendingReward.value ?? null))
const declineReward = computed(() => accountLocParser.accountInfo.value?.decline_reward ?? false)
const ignoreReward = computed(() => accountLocParser.stakedNodeId.value === null)

//
// stakedNode
//

const stakedNodeAnalyzer = new NodeAnalyzer(accountLocParser.stakedNodeId)
onMounted(() => stakedNodeAnalyzer.mount())
onBeforeUnmount(() => stakedNodeAnalyzer.unmount())

//
// handleStopStaking / handleChangeStaking
//

const notWithMetamaskDialogVisible = ref(false)

const showStopConfirmDialog = () => {
  if (walletManager.isHieroWallet.value) {
    stopConfirmDialogVisible.value = true
  } else {
    notWithMetamaskDialogVisible.value = true
  }
}

const handleStopStaking = () => {
  stopStakingDialogVisible.value = true
}

const showStakingDialog = () => {
  if (walletManager.isHieroWallet.value) {
    changeStakingDialogVisible.value = true
  } else {
    notWithMetamaskDialogVisible.value = true
  }
}

const stakingChanged = () => {
  accountLocParser.remount()
  gtagTransaction("change_staking")
}

const enableWallet = routeManager.enableWallet
const accountId = walletManager.accountId
const isHieroWallet = walletManager.isHieroWallet
const accountChecksum = accountLocParser.accountChecksum
const account = accountLocParser.accountInfo
const stakePeriodStart = accountLocParser.stakePeriodStart
const stakedNode = stakedNodeAnalyzer.node

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.page-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-left: 32px;
  margin-right: 32px;
}

div.my-staking-dashboard {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: space-between;
  min-height: 128px;
}

div.my-staking-buttons {
  display: flex;
  flex-direction: row;
  margin-top: 24px;
  margin-bottom: 24px;
  gap: 8px;
}

p.staking-notice {
  color: var(--text-secondary);
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  font-weight: 400;
  height: 13px;
}

span.checksum {
  color: var(--text-secondary);
}

p.connect-wallet-text {
  color: var(--text-disabled);
  font-family: "Styrene A Web", sans-serif;
  font-size: 20px;
  font-weight: 500;
  height: 26px;
  text-align: center;
}

</style>
