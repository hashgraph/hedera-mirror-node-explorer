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

    <StakingDialog v-model:show-dialog="stakingDialogVisible"
                   :account="account ?? undefined"
                   :currently-staked-to="stakedTo ?? undefined"
                   v-on:change-staking="handleChangeStaking"/>

    <ConfirmDialog v-model:show-dialog="stopConfirmDialogVisible" @onConfirm="handleStopStaking"
                   :main-message="'Do you want to stop staking to ' + stakedTo +'?'">
      <template v-slot:dialogTitle>
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

    <CSVDownloadDialog v-if="accountId"
                       v-model:show-dialog="showDownloadDialog"
                       :downloader="downloader"
                       :account-id="accountId"/>


    <DashboardCard v-if="enableWallet" collapsible-key="stakingDetails">
      <template v-slot:title>
        <div>
          <span class="h-is-primary-title">My Staking </span>
          <span v-if="accountId" class="h-is-primary-title"> for account </span>
          <div v-if="accountId" class="h-is-secondary-text has-text-weight-light is-inline-block">
            <AccountLink :account-id="accountId"/>
          </div>
          <span v-if="accountChecksum" class="has-text-grey mr-3" style="font-size: 14px">-{{ accountChecksum }}</span>
        </div>
      </template>

      <template v-slot:content>

        <template v-if="accountId">
          <div v-if="isSmallScreen">
            <div class="is-flex is-justify-content-space-between">
              <NetworkDashboardItem :name="stakePeriodStart ? ('since ' + stakePeriodStart) : undefined"
                                    title="Staked to">
                <template v-slot:value>
                  <div class="is-inline-block">
                    <span v-if="isStakedToNode" class="icon has-text-info mr-2" style="font-size: 20px">
                      <i v-if="isCouncilNode" class="fas fa-building"></i>
                      <i v-else class="fas fa-users"></i>
                    </span>
                    <span v-if="stakedTo">{{ stakedTo }}</span>
                    <span v-else class="has-text-grey">None</span>
                  </div>
                </template>
              </NetworkDashboardItem>

              <NetworkDashboardItem class="ml-4"
                                    :name="stakedAmount ? cryptoName : ''"
                                    title="My Stake"
                                    :value="stakedAmount"/>

              <NetworkDashboardItem v-if="!ignoreReward && declineReward && !pendingReward"
                                    class="ml-4"
                                    title="Rewards"
                                    value="Declined"/>
              <NetworkDashboardItem v-else
                                    class="ml-4"
                                    title="Pending Reward"
                                    :name="pendingReward ? cryptoName : ''"
                                    :value="pendingReward"
                                    :class="{'h-has-opacity-40': ignoreReward && !pendingReward}"/>
            </div>
            <div class="is-flex is-justify-content-space-between mt-5">
              <div v-if="isHieroWallet" class="is-flex is-justify-content-flex-start">
                <button id="stopStakingButton" class="button is-white is-small"
                        :disabled="!stakedTo" @click="showStopConfirmDialog">STOP STAKING
                </button>
                <button id="showStakingDialog" class="button is-white is-small ml-4" @click="showStakingDialog">CHANGE
                  STAKING
                </button>
              </div>
              <div v-else>
                <p class="h-is-tertiary-text has-text-grey h-is-text-size-5">
                  To change your staking options use Blade or HashPack.
                </p>
              </div>
            </div>
            <div v-if="isHieroWallet" class="mt-5 h-is-text-size-2 is-italic has-text-grey has-text-centered">
              <span class="has-text-grey-light">Please Note: </span>
              Your full balance is automatically staked.<br/>
              Your funds are fully available for use while staked.<br/>
              You can unstake or switch nodes freely.
            </div>
          </div>
          <div v-else>
            <div class="is-flex-direction-column">
              <NetworkDashboardItem :name="stakePeriodStart ? ('since ' + stakePeriodStart) : undefined"
                                    title="Staked to" :value="stakedTo ?? undefined"/>
              <div class="mt-4"/>
              <NetworkDashboardItem :name="stakedAmount ? cryptoName : ''" title="My Stake" :value="stakedAmount"/>
              <div class="mt-4"/>

              <NetworkDashboardItem v-if="!ignoreReward && declineReward && !pendingReward"
                                    title="Rewards"
                                    value="Declined"/>
              <NetworkDashboardItem v-else
                                    title="Pending Reward"
                                    :name=cryptoName
                                    :value="undefined"
                                    :class="{'h-has-opacity-40': ignoreReward && !pendingReward}"/>

              <div class="mt-4"/>
            </div>
            <div v-if="isHieroWallet" class="is-flex is-justify-content-center">
              <button id="stopStakingButtonSmall" class="button is-white is-small"
                      :disabled="!stakedTo" @click="showStopConfirmDialog">STOP STAKING
              </button>
              <button id="showStakingDialogSmall" class="button is-white is-small ml-4" @click="showStakingDialog">
                CHANGE STAKED TO
              </button>
            </div>
            <div v-if="isHieroWallet" class="mt-5 h-is-text-size-2 is-italic has-text-grey has-text-centered">
              <span class="has-text-grey-light">Please Note: </span>
              Your full balance is automatically staked.<br/>
              Your funds are fully available for use while staked.<br/>
              You can unstake or switch nodes freely.
            </div>
            <div class="mt-4"/>
          </div>
        </template>

        <template v-else>
          <section class="section has-text-centered pt-0" :class="{'pb-0': isSmallScreen}">
            <p class="h-is-tertiary-text" style="font-weight: 300">
              To view or change your staking options first connect your wallet.
            </p>
            <br/>
          </section>
        </template>

      </template>
    </DashboardCard>

    <DashboardCard v-if="accountId" :class="{'h-has-opacity-40': !isStakedToNode}" collapsible-key="myRecentRewards">
      <template v-slot:title>
        <span class="h-is-secondary-title">Recent Staking Rewards</span>
      </template>
      <template v-slot:control>
        <DownloadButton @click="showDownloadDialog = true"/>
      </template>
      <template v-slot:content>
        <StakingRewardsTable
            :narrowed="true"
            :controller="transactionTableController"
        />
      </template>
    </DashboardCard>

    <RewardsCalculator :amount-in-hbar="balanceInHbar"
                       :node-id="stakedNode?.node_id"/>

  </PageFrameV2>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, inject, onBeforeUnmount, onMounted, ref} from 'vue';
import {useRouter} from "vue-router";
import PageFrameV2 from "@/components/page/PageFrameV2.vue";
import {routeManager, walletManager} from "@/router";
import NetworkDashboardItem from "@/components/node/NetworkDashboardItem.vue";
import {Transaction} from "@/schemas/MirrorNodeSchemas";
import {waitFor} from "@/utils/TimerUtils";
import StakingRewardsTable from "@/components/staking/StakingRewardsTable.vue";
import StakingDialog from "@/components/staking/StakingDialog.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import ProgressDialog, {Mode} from "@/components/staking/ProgressDialog.vue";
import AccountLink from "@/components/values/link/AccountLink.vue";
import RewardsCalculator from "@/components/staking/RewardsCalculator.vue";
import {WalletClientError, WalletClientRejectError} from "@/utils/wallet/client/WalletClient";
import {TransactionID} from "@/utils/TransactionID";
import {StakingRewardsTableController} from "@/components/staking/StakingRewardsTableController";
import DownloadButton from "@/components/DownloadButton.vue";
import CSVDownloadDialog from "@/components/CSVDownloadDialog.vue";
import {RewardDownloader} from "@/utils/downloader/RewardDownloader";
import {NodeAnalyzer} from "@/utils/analyzer/NodeAnalyzer";
import {AccountLocParser} from "@/utils/parser/AccountLocParser";
import {TransactionByIdCache} from "@/utils/cache/TransactionByIdCache";
import {gtagTransaction} from "@/gtag";
import {AppStorage} from "@/AppStorage";
import {NetworkConfig} from "@/config/NetworkConfig";
import {CoreConfig} from "@/config/CoreConfig.ts";

const props = defineProps({
  network: String,
  polling: { // For testing purpose
    type: Number,
    default: 3000 // Because a transaction emerges 3 or 4 seconds in mirror node after its completion in network
  }
})

const isSmallScreen = inject('isSmallScreen', true)
const isMediumScreen = inject('isMediumScreen', true)
const cryptoName = CoreConfig.inject().cryptoName
const networkConfig = NetworkConfig.inject()

const router = useRouter()

const stakingDialogVisible = ref(false)
const stopConfirmDialogVisible = ref(false)
const showProgressDialog = ref(false)
const progressDialogMode = ref(Mode.Busy)
const progressDialogTitle = ref<string | null>(null)
const progressMainMessage = ref<string | null>(null)
const progressExtraMessage = ref<string | null>(null)
const progressExtraTransactionId = ref<string | null>(null)
const showProgressSpinner = ref(false)
const showDownloadDialog = ref(false)

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
  changeStaking(null, null, accountLocParser.accountInfo.value?.decline_reward ? false : null)
}

const showStakingDialog = () => {
  if (walletManager.isHieroWallet.value) {
    stakingDialogVisible.value = true
  } else {
    notWithMetamaskDialogVisible.value = true
  }
}

const handleChangeStaking = (nodeId: number | null, accountId: string | null, declineReward: boolean | null) => {
  changeStaking(nodeId, accountId, declineReward)
}

const changeStaking = async (nodeId: number | null, accountId: string | null, declineReward: boolean | null) => {

  try {

    showProgressDialog.value = true
    progressDialogMode.value = Mode.Busy
    progressDialogTitle.value = (nodeId == null && accountId == null && !declineReward) ? "Stopping staking" : "Updating staking"
    progressMainMessage.value = "Connecting to Hedera Network using your wallet…"
    progressExtraMessage.value = "Check your wallet for any approval request"
    progressExtraTransactionId.value = null
    showProgressSpinner.value = false
    const transactionId = TransactionID.normalize(await walletManager.changeStaking(nodeId, accountId, declineReward))
    progressMainMessage.value = "Completing operation…"
    progressExtraMessage.value = "This may take a few seconds"
    showProgressSpinner.value = true
    await waitForTransactionRefresh(transactionId)

    progressDialogMode.value = Mode.Success
    progressMainMessage.value = "Operation completed"
    showProgressSpinner.value = false
    progressExtraMessage.value = "with transaction ID:"
    progressExtraTransactionId.value = transactionId

  } catch (error) {

    if (error instanceof WalletClientRejectError) {
      showProgressDialog.value = false
    } else {
      progressDialogMode.value = Mode.Error
      if (error instanceof WalletClientError) {
        progressMainMessage.value = error.message
        progressExtraMessage.value = error.extra
      } else {
        progressMainMessage.value = "Operation did not complete"
        progressExtraMessage.value = JSON.stringify(error)
      }
      progressExtraTransactionId.value = null
      showProgressSpinner.value = false
    }

  } finally {
    accountLocParser.remount()
    gtagTransaction("change_staking")
  }

}

const waitForTransactionRefresh = async (transactionId: string) => {
  let result: Promise<Transaction | string>

  try {
    let counter = 10
    let transaction: Transaction | null = null
    while (counter > 0 && transaction === null) {
      await waitFor(props.polling)
      transaction = await TransactionByIdCache.instance.lookup(transactionId, true)
      counter -= 1
    }
    result = Promise.resolve(transaction ?? transactionId)
  } catch {
    result = Promise.resolve(transactionId)
  }

  return result
}

//
// Rewards Transactions Table Controller
//
const pageSize = ref(isMediumScreen ? 10 : 5)
const transactionTableController = new StakingRewardsTableController(router, walletManager.accountId, pageSize, AppStorage.STAKING_TABLE_PAGE_SIZE_KEY)
onMounted(() => transactionTableController.mount())
onBeforeUnmount(() => transactionTableController.unmount())

//
// Rewards transaction downloader
//
const downloader = new RewardDownloader(
    walletManager.accountId,
    ref(null),
    ref(null),
    1000)

const enableWallet = routeManager.enableWallet
const accountId = walletManager.accountId
const isHieroWallet = walletManager.isHieroWallet
const accountChecksum = accountLocParser.accountChecksum
const account = accountLocParser.accountInfo
const stakePeriodStart = accountLocParser.stakePeriodStart
const stakedNode = stakedNodeAnalyzer.node
const isCouncilNode = stakedNodeAnalyzer.isCouncilNode

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
