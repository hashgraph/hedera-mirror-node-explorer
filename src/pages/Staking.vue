<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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

  <StakingDialog v-model:show-dialog="showStakingDialog"
                 :account="account ?? undefined"
                 :currently-staked-to="stakedTo ?? undefined"
                 v-on:change-staking="handleChangeStaking"/>

  <ConfirmDialog v-model:show-dialog="showStopConfirmDialog" @onConfirm="handleStopStaking"
                 :main-message="'Do you want to stop staking to ' + stakedTo +'?'">
    <template v-slot:dialogTitle>
            <span class="h-is-primary-title">My Staking </span>
            <span v-if="accountId" class="h-is-tertiary-text"> for account </span>
            <span v-if="accountId" class="h-is-secondary-text has-text-weight-light mr-3">{{ accountId }}</span>
    </template>
  </ConfirmDialog>

  <ProgressDialog v-model:show-dialog="showProgressDialog"
                  :mode="progressDialogMode"
                  :main-message="progressMainMessage ?? undefined"
                  :extra-message="progressExtraMessage ?? undefined"
                  :extra-transaction-id="progressExtraTransactionId ?? undefined"
                  :show-spinner="showProgressSpinner"
  >
    <template v-slot:dialogTitle>
      <span class="h-is-primary-title">{{ progressDialogTitle }}</span>
    </template>
  </ProgressDialog>

  <CSVDownloadDialog v-if="accountId"
                     v-model:show-dialog="showDownloadDialog"
                     :downloader="downloader"
                     :account-id="accountId"/>

  <WalletChooser v-model:show-dialog="showWalletChooser"
                 v-on:choose-wallet="handleChooseWallet"/>

  <section :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}" class="section">

    <DashboardCard>
      <template v-slot:title>
        <div>
          <span class="h-is-primary-title">My Staking </span>
          <span v-if="accountId" class="h-is-primary-title"> for account </span>
          <div v-if="accountId" class="h-is-secondary-text has-text-weight-light is-inline-block">
            <AccountLink :account-id="accountId">{{ accountId }}</AccountLink>
          </div>
          <span v-if="accountChecksum" class="has-text-grey mr-3" style="font-size: 28px">-{{ accountChecksum }}</span>
        </div>
        <div v-if="!isMediumScreen && accountId" id="showAccountLink" class="is-flex is-flex-direction-column mt-2">
          <router-link :to="accountRoute">
            <span class="h-is-property-text">Show my account</span>
          </router-link>
          <router-link :to="allowanceApprovalRoute">
            <span class="h-is-property-text">Approve an allowance…</span>
          </router-link>
        </div>
      </template>

      <template v-slot:control v-if="isMediumScreen">
        <div v-if="accountId" id="showAccountLink" class="is-flex is-flex-direction-column ml-3">
          <router-link :to="accountRoute">
            <span class="h-is-property-text">Show my account</span>
          </router-link>
          <router-link :to="allowanceApprovalRoute">
            <span class="h-is-property-text">Approve an allowance…</span>
          </router-link>
        </div>
      </template>

      <template v-slot:content>

        <template v-if="accountId">
          <div v-if="isSmallScreen">
            <div class="is-flex is-justify-content-space-between">
              <NetworkDashboardItem :name="stakePeriodStart ? ('since ' + stakePeriodStart) : undefined" title="Staked to">
                <template v-slot:value>
                  <div class="is-inline-block">
                    <span v-if="isStakedToNode"  class="icon has-text-info mr-2" style="font-size: 20px">
                      <i v-if="isCouncilNode" class="fas fa-building"></i>
                      <i v-else class="fas fa-users"></i>
                    </span>
                    <span v-if="stakedTo">{{ stakedTo }}</span>
                    <span v-else class="has-text-grey">None</span>
                  </div>
                </template>
              </NetworkDashboardItem>

              <NetworkDashboardItem class="ml-4"
                                    :name="stakedAmount ? 'HBAR' : ''"
                                    title="My Stake"
                                    :value="stakedAmount"/>

              <NetworkDashboardItem v-if="!ignoreReward && declineReward && !pendingReward"
                                    class="ml-4"
                                    title="Rewards"
                                    value="Declined"/>
              <NetworkDashboardItem v-else
                                    class="ml-4"
                                    title="Pending Reward"
                                    :name="pendingReward ? 'HBAR' : ''"
                                    :value="pendingReward"
                                    :class="{'h-has-opacity-40': ignoreReward && !pendingReward}"/>
            </div>
            <div class="is-flex is-justify-content-space-between mt-5">
              <div class="is-flex is-justify-content-flex-start">
                <button id="stopStakingButton" class="button is-white is-small"
                        :disabled="!stakedTo" @click="showStopConfirmDialog = true">STOP STAKING</button>
                <button id="showStakingDialog" class="button is-white is-small ml-4" @click="showStakingDialog = true">CHANGE STAKING</button>
              </div>
              <button id="disconnectWalletButton" class="button is-white is-small" @click="disconnectFromWallet">DISCONNECT {{ walletName.toLocaleUpperCase() }}</button>
            </div>
            <div class="mt-5 h-is-text-size-2 is-italic has-text-grey has-text-centered">
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
              <NetworkDashboardItem :name="stakedAmount ? 'HBAR' : ''" title="My Stake" :value="stakedAmount"/>
              <div class="mt-4"/>

              <NetworkDashboardItem v-if="!ignoreReward && declineReward && !pendingReward"
                                    title="Rewards"
                                    value="Declined"/>
              <NetworkDashboardItem v-else
                                    title="Pending Reward"
                                    name="HBAR"
                                    :value="undefined"
                                    :class="{'h-has-opacity-40': ignoreReward && !pendingReward}"/>

              <div class="mt-4"/>
            </div>
              <div class="is-flex is-justify-content-center">
                  <button id="stopStakingButtonSmall" class="button is-white is-small"
                          :disabled="!stakedTo" @click="showStopConfirmDialog = true">STOP STAKING</button>
                  <button id="showStakingDialogSmall" class="button is-white is-small ml-4" @click="showStakingDialog = true">CHANGE STAKED TO</button>
                </div>
            <div class="is-flex is-justify-content-center mt-4">
              <button id="disconnectWalletButtonSmall" class="button is-white is-small" @click="disconnectFromWallet">DISCONNECT WALLET</button>
            </div>
            <div class="mt-5 h-is-text-size-2 is-italic has-text-grey has-text-centered">
              <span class="has-text-grey-light">Please Note: </span>
              Your full balance is automatically staked.<br/>
              Your funds are fully available for use while staked.<br/>
              You can unstake or switch nodes freely.
            </div>
            <div class="mt-4"/>
          </div>
        </template>

        <template v-else-if="connecting">
          <section class="section has-text-centered" style="min-height: 450px">
            <p>Connecting your Wallet...</p>
            <p>You need to select which account you wish to connect.</p>
            <br/>
            <button id="abortConnectWalletButton" class="button is-white is-small" @click="disconnectFromWallet">ABORT CONNECTION</button>
          </section>
        </template>

        <template v-else>
          <section class="section has-text-centered pt-0" :class="{'pb-0': isSmallScreen}">
            <p class="h-is-tertiary-text" style="font-weight: 300">
              To view or change your staking options first connect your wallet.
            </p>
            <br/>
            <button id="connectWalletButton" class="button is-white is-small" @click="chooseWallet">CONNECT WALLET…</button>
          </section>
        </template>

      </template>
    </DashboardCard>

    <DashboardCard v-if="accountId" :class="{'h-has-opacity-40': !isStakedToNode}">
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

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted, ref} from 'vue';
import {useRouter} from "vue-router";
import Footer from "@/components/Footer.vue";
import {routeManager, walletManager} from "@/router";
import NetworkDashboardItem from "@/components/node/NetworkDashboardItem.vue";
import {Transaction} from "@/schemas/HederaSchemas";
import {waitFor} from "@/utils/TimerUtils";
import StakingRewardsTable from "@/components/staking/StakingRewardsTable.vue";
import StakingDialog from "@/components/staking/StakingDialog.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import ProgressDialog, {Mode} from "@/components/staking/ProgressDialog.vue";
import AccountLink from "@/components/values/AccountLink.vue";
import RewardsCalculator from "@/components/staking/RewardsCalculator.vue";
import WalletChooser from "@/components/staking/WalletChooser.vue";
import {WalletDriver} from "@/utils/wallet/WalletDriver";
import {WalletDriverError} from "@/utils/wallet/WalletDriverError";
import {normalizeTransactionId} from "@/utils/TransactionID";
import {StakingRewardsTableController} from "@/components/staking/StakingRewardsTableController";
import DownloadButton from "@/components/DownloadButton.vue";
import CSVDownloadDialog from "@/components/CSVDownloadDialog.vue";
import {RewardDownloader} from "@/utils/downloader/RewardDownloader";
import {NodeRegistry} from "@/components/node/NodeRegistry";
import {AccountLocParser} from "@/utils/parser/AccountLocParser";
import {TransactionByIdCache} from "@/utils/cache/TransactionByIdCache";

export default defineComponent({
  name: 'Staking',

  props: {
    network: String,
    polling: { // For testing purpose
      type: Number,
      default: 3000 // Because a transaction emerges 3 or 4 seconds in mirror node after its completion in network
    }
  },

  components: {
    CSVDownloadDialog,
    DownloadButton,
    WalletChooser,
    RewardsCalculator,
    AccountLink,
    ConfirmDialog,
    ProgressDialog,
    DashboardCard,
    StakingDialog,
    StakingRewardsTable,
    NetworkDashboardItem,
    Footer,
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    const router = useRouter()

    const showStakingDialog = ref(false)
    const showStopConfirmDialog = ref(false)
    const showWalletChooser = ref(false)
    const showErrorDialog = ref(false)
    const showProgressDialog = ref(false)
    const progressDialogMode = ref(Mode.Busy)
    const progressDialogTitle = ref<string|null>(null)
    const progressMainMessage = ref<string|undefined>(undefined)
    const progressExtraMessage = ref<string|null>(null)
    const progressExtraTransactionId = ref<string|null>(null)
    const showProgressSpinner = ref(false)
    const showDownloadDialog = ref(false)

    const connecting = ref(false)

    const chooseWallet = () => {
      showWalletChooser.value = true
    }

    //
    // handleChooseWallet
    //
    const handleChooseWallet = (wallet: WalletDriver) => {
      walletManager.setActiveDriver(wallet)
      connecting.value = true
      walletManager
          .connect()
          .catch((reason) => {
            console.warn("Failed to connect wallet - reason:" + reason.toString())
            showProgressDialog.value = true
            progressDialogMode.value = Mode.Error
            progressDialogTitle.value = "Could not connect wallet"
            showProgressSpinner.value = false
            progressExtraTransactionId.value = null

            if (reason instanceof WalletDriverError) {
              progressMainMessage.value = reason.message
              progressExtraMessage.value = reason.extra
            } else {
              progressMainMessage.value = "Unexpected error"
              progressExtraMessage.value = JSON.stringify(reason)
            }
          })
          .finally(() => connecting.value = false)
    }

    //
    // disconnectFromWallet
    //

    const disconnectFromWallet = () => {
      walletManager
          .disconnect()
          .finally(() => connecting.value = false)
    }

    //
    // Account
    //
    const accountLocParser = new AccountLocParser(walletManager.accountId)
    onMounted(() => accountLocParser.mount())
    onBeforeUnmount(() => accountLocParser.unmount())

    const isStakedToNode = computed(() => accountLocParser.stakedNodeId.value !== null)
    const isStakedToAccount = computed(() => accountLocParser.stakedAccountId.value)
    const isStaked = computed(() => isStakedToNode.value || isStakedToAccount.value)

    const stakedTo = computed(() => {
      let result: string|null
      if (isStakedToAccount.value) {
        result = "Account " + accountLocParser.stakedAccountId.value
      } else if (isStakedToNode.value) {
        result = "Node " + accountLocParser.stakedNodeId.value + " - " + stakedNodeLoader.shortNodeDescription.value
      } else {
        result = null
      }
      return result
    })

    const accountRoute = computed(() => {
      return walletManager.accountId.value !== null
          ? routeManager.makeRouteToAccount(walletManager.accountId.value, false)
          : null
    })
    const allowanceApprovalRoute = computed(() => {
      return walletManager.accountId.value !== null
          ? routeManager.makeRouteToAccount(walletManager.accountId.value, true)
          : null
    })

    const balanceInHbar = computed(() => {
      const balance = accountLocParser.balance.value ?? 10000000000
      return balance / 100000000
    })

    const stakedAmount = computed(() => isStaked.value ? formatHbarAmount(accountLocParser.balance.value) : null)

    const formatHbarAmount = (amount: number | null) => {
      let result
      if (amount) {
        const amountFormatter = new Intl.NumberFormat("en-US", {maximumFractionDigits: 8})
        result = amountFormatter.format(amount / 100000000)
      }
      else {
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

    const stakedNodeLoader = NodeRegistry.getCursor(accountLocParser.stakedNodeId)

    //
    // handleStopStaking / handleChangeStaking
    //

    const handleStopStaking = () => {
      changeStaking(null, null, accountLocParser.accountInfo.value?.decline_reward ? false : null)
    }

    const handleChangeStaking = (nodeId: number|null, accountId: string|null, declineReward: boolean|null) => {
      changeStaking(nodeId, accountId, declineReward)
    }

    const changeStaking = async (nodeId: number|null, accountId: string|null, declineReward: boolean|null) => {

      try {

        showProgressDialog.value = true
        progressDialogMode.value = Mode.Busy
        progressDialogTitle.value = (nodeId == null && accountId == null && !declineReward) ? "Stopping staking" : "Updating staking"
        progressMainMessage.value = "Connecting to Hedera Network using your wallet…"
        progressExtraMessage.value = "Check your wallet for any approval request"
        progressExtraTransactionId.value = null
        showProgressSpinner.value = false
        const transactionId = normalizeTransactionId(await walletManager.changeStaking(nodeId, accountId, declineReward))
        progressMainMessage.value = "Completing operation…"
        progressExtraMessage.value = "This may take a few seconds"
        showProgressSpinner.value = true
        await waitForTransactionRefresh(transactionId)

        progressDialogMode.value = Mode.Success
        progressMainMessage.value = "Operation completed"
        showProgressSpinner.value = false
        progressExtraMessage.value = "with transaction ID:"
        progressExtraTransactionId.value = transactionId

      } catch(error) {

        progressDialogMode.value = Mode.Error
        if (error instanceof WalletDriverError) {
          progressMainMessage.value = error.message
          progressExtraMessage.value = error.extra
        } else {
          progressMainMessage.value = "Operation did not complete"
          progressExtraMessage.value = JSON.stringify(error.message)
        }
        progressExtraTransactionId.value = null
        showProgressSpinner.value = false

      } finally {
        accountLocParser.remount()
      }

    }

    const waitForTransactionRefresh = async (transactionId: string) => {
      let result: Promise<Transaction | string>

      try {
          let counter = 10
          let transaction: Transaction|null = null
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
    const pageSize = computed(() => isMediumScreen ? 10 : 5)
    const transactionTableController = new StakingRewardsTableController(router, walletManager.accountId, pageSize)
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

    return {
      isSmallScreen,
      isMediumScreen,
      isTouchDevice,
      connecting,
      connected: walletManager.connected,
      walletName: walletManager.walletName,
      walletIconURL: walletManager.getActiveDriver().iconURL,
      accountId: walletManager.accountId,
      accountChecksum: accountLocParser.accountChecksum,
      account: accountLocParser.accountInfo,
      accountRoute,
      allowanceApprovalRoute,
      stakePeriodStart: accountLocParser.stakePeriodStart,
      showStakingDialog,
      showStopConfirmDialog,
      showWalletChooser,
      showErrorDialog,
      showDownloadDialog,
      isStakedToNode,
      isStakedToAccount,
      stakedTo,
      stakedNode: stakedNodeLoader.node,
      isCouncilNode: stakedNodeLoader.isCouncilNode,
      balanceInHbar,
      stakedAmount,
      pendingReward,
      declineReward,
      ignoreReward,
      chooseWallet,
      handleChooseWallet,
      disconnectFromWallet,
      handleStopStaking,
      handleChangeStaking,
      showProgressDialog,
      progressDialogMode,
      progressDialogTitle,
      progressMainMessage,
      progressExtraMessage,
      progressExtraTransactionId,
      showProgressSpinner,
      transactionTableController,
      downloader,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>