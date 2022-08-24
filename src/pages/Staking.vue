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

  <StakingDialog v-model:show-dialog="showStakingDialog"
                 :account="account"
                 :currently-staked-to="stakedTo"
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
                  :main-message="progressMainMessage"
                  :extra-message="progressExtraMessage"
                  :extra-transaction="progressExtraTransaction"
                  :show-spinner="showProgressSpinner"
  >
    <template v-slot:dialogTitle>
      <span class="h-is-primary-title">{{ progressDialogTitle }}</span>
    </template>
  </ProgressDialog>

  <WalletChooser v-model:show-dialog="showWalletChooser"
                 v-on:choose-wallet="handleChooseWallet"/>

  <section :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}" class="section">

    <DashboardCard>
      <template v-slot:title>
          <span class="h-is-primary-title">My Staking </span>
          <span v-if="accountId" class="h-is-tertiary-text"> for account </span>
          <div v-if="accountId" class="h-is-secondary-text has-text-weight-light mr-3 is-inline-block">
            <AccountLink :account-id="accountId">{{ accountId }}</AccountLink>
          </div>
      </template>

      <template v-slot:table>

        <template v-if="accountId">
          <div v-if="isSmallScreen">
            <div class="is-flex is-justify-content-space-between">
              <NetworkDashboardItem :name="stakedSince" :title="'Staked to'" :value="stakedTo"/>
              <NetworkDashboardItem :name="stakedAmount ? 'HBAR' : ''" :title="'My Stake'" :value="stakedAmount"/>
              <NetworkDashboardItem :title="'Rewards'" :value="declineReward" :class="{'h-has-opacity-40': ignoreReward}"/>
            </div>
            <br/>
            <div class="is-flex is-justify-content-space-between">
              <div class="is-flex is-justify-content-flex-start">
                <button id="stopStakingButton" class="button is-white is-small"
                        :disabled="!stakedTo" @click="showStopConfirmDialog = true">STOP STAKING</button>
                <button id="showStakingDialog" class="button is-white is-small ml-4" @click="showStakingDialog = true">CHANGE STAKING</button>
              </div>
              <button id="disconnectWalletButton" class="button is-white is-small" @click="disconnectFromWallet">DISCONNECT {{ walletName.toLocaleUpperCase() }}</button>
            </div>
            <div class="mt-5 h-is-text-size-2 is-italic has-text-grey has-text-centered">
              <span class="has-text-grey-light">Please Note: </span>
              Staking is in Phase 1 and will not pay out rewards until Phase 3.<br/>
              Your full balance is automatically staked.<br/>
              Your funds are fully available for use while staked.<br/>
              You can unstake or switch nodes freely.
            </div>
          </div>
          <div v-else>
            <div class="is-flex-direction-column">
              <NetworkDashboardItem :name="stakedSince" :title="'Staked to'" :value="stakedTo"/>
              <div class="mt-4"/>
              <NetworkDashboardItem :name="stakedAmount ? 'HBAR' : ''" :title="'My Stake'" :value="stakedAmount"/>
              <div class="mt-4"/>
              <NetworkDashboardItem :title="'Rewards'" :value="declineReward" :class="{'h-has-opacity-40': ignoreReward}"/>
              <div class="mt-4"/>
            </div>
              <div class="is-flex is-justify-content-center">
                  <button id="stopStakingButton" class="button is-white is-small"
                          :disabled="!stakedTo" @click="showStopConfirmDialog = true">STOP STAKING</button>
                  <button id="showStakingDialog" class="button is-white is-small ml-4" @click="showStakingDialog = true">CHANGE STAKED TO</button>
                </div>
            <div class="is-flex is-justify-content-center mt-4">
              <button id="disconnectWalletButton" class="button is-white is-small" @click="disconnectFromWallet">DISCONNECT WALLET</button>
            </div>
            <div class="mt-5 h-is-text-size-2 is-italic has-text-grey has-text-centered">
              <span class="has-text-grey-light">Please Note: </span>
              Staking is in Phase 1 and will not pay out rewards until Phase 3.<br/>
              Your full balance is automatically staked.<br/>
              Your funds are fully available for use while staked.<br/>
              You can unstake or switch nodes freely.
            </div>
            <div class="mt-6"/>
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
              To view or change your staking you first need to connect your wallet.
            </p>
            <br/>
            <button id="connectWalletButton" class="button is-white is-small" @click="chooseWallet">CONNECT WALLET…</button>
          </section>
        </template>

      </template>
    </DashboardCard>

    <DashboardCard v-if="accountId" :class="{'h-has-opacity-40': isIndirectStaking}">
      <template v-slot:title>
        <span class="h-is-primary-title">Recent Staking Rewards Transactions</span>
      </template>
      <template v-slot:control>
        <div class="is-flex is-align-items-flex-end">
          <PlayPauseButtonV2 v-model:state="transactionCacheState"/>
        </div>
      </template>
      <template v-slot:table>
        <RewardsTransactionTable
            :narrowed="true"
            :nb-items="10"
            :transactions="transactions"
            :account-id="accountId"
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

import {computed, defineComponent, inject, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import Footer from "@/components/Footer.vue";
import {walletManager} from "@/router";
import NetworkDashboardItem from "@/components/node/NetworkDashboardItem.vue";
import axios from "axios";
import {
  AccountBalanceTransactions,
  NetworkNode,
  NetworkNodesResponse,
  Transaction,
  TransactionByIdResponse
} from "@/schemas/HederaSchemas";
import {HMSF} from "@/utils/HMSF";
import {waitFor} from "@/utils/TimerUtils";
import {operatorRegistry} from "@/schemas/OperatorRegistry";
import RewardsTransactionTable from "@/components/staking/RewardsTransactionTable.vue";
import StakingDialog from "@/components/staking/StakingDialog.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import ProgressDialog, {Mode} from "@/components/staking/ProgressDialog.vue";
import AccountLink from "@/components/values/AccountLink.vue";
import {EntityCacheStateV2} from "@/utils/EntityCacheV2";
import PlayPauseButtonV2 from "@/components/PlayPauseButtonV2.vue";
import RewardsCalculator from "@/components/staking/RewardsCalculator.vue";
import WalletChooser from "@/components/staking/WalletChooser.vue";
import {WalletDriver} from "@/utils/wallet/WalletDriver";
import {WalletDriverError} from "@/utils/wallet/WalletDriverError";
import {RewardsTransactionCache} from '@/components/staking/RewardsTransactionCache';
import {normalizeTransactionId} from "@/utils/TransactionID";

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
    WalletChooser,
    RewardsCalculator,
    PlayPauseButtonV2,
    AccountLink,
    ConfirmDialog,
    ProgressDialog,
    DashboardCard,
    StakingDialog,
    RewardsTransactionTable,
    NetworkDashboardItem,
    Footer,
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    const showStakingDialog = ref(false)
    const showStopConfirmDialog = ref(false)
    const showWalletChooser = ref(false)
    const showErrorDialog = ref(false)
    const showProgressDialog = ref(false)
    const progressDialogMode = ref(Mode.Busy)
    const progressDialogTitle = ref<string|null>(null)
    const progressMainMessage = ref<string|null>(null)
    const progressExtraMessage = ref<string|null>(null)
    const progressExtraTransaction = ref<string|null>(null)
    const showProgressSpinner = ref(false)

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
            progressExtraTransaction.value = null

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
    const account = ref<AccountBalanceTransactions | null>(null)
    const accountError = ref<unknown>(null)

    const isStaked = computed(() => account?.value?.staked_node_id || account?.value?.staked_account_id)
    const isIndirectStaking = computed(() => account?.value?.staked_account_id)

    const stakedTo = computed(() => {
      let result
      if (account.value?.staked_account_id) {
        result = "Account " + account.value.staked_account_id
      } else if (account.value?.staked_node_id) {
        result = stakedNodeDescription.value
      } else {
        result = null
      }
      return result
    })

    const balanceInHbar = computed(() => {
      const balance = account.value?.balance?.balance ?? 10000000000
      return balance / 100000000
    })

    const stakedAmount = computed(() => {
      let result
      if ( isStaked.value && account.value?.balance?.balance != null) {
        const amountFormatter = new Intl.NumberFormat("en-US", {
          maximumFractionDigits: 8
        })
        result = amountFormatter.format(account.value.balance.balance / 100000000)
      }
      else {
        result = null
      }
      return result
    })

    const locale = "en-US"
    const dateOptions = {
      weekDay: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: HMSF.forceUTC ? "UTC" : undefined
    }
    const dateFormat = new Intl.DateTimeFormat(locale, dateOptions)

    const stakedSince = computed(() => {
      let result
      if (isStaked.value && account.value?.stake_period_start) {
        const seconds = Number.parseFloat(account.value.stake_period_start);
        result = "since " + dateFormat.format(seconds * 1000)
      } else {
        result = null
      }
      return result
    })

    const declineReward = computed(() => {
      let result: string | null
      if (account.value && account.value.decline_reward !== null) {
        result = account.value.decline_reward === true ? 'Declined' : 'Accepted'
      } else {
        result = null
      }
      return result
    })

    const ignoreReward = computed(() => account.value === null || account.value.staked_node_id === null)

    const fetchAccount = () => {
      const params = {} as {
        limit: 1
      }
      if (walletManager.accountId.value) {
        axios
            .get<AccountBalanceTransactions>("api/v1/accounts/" + walletManager.accountId.value, {params: params})
            .then(response => {
              account.value = response.data
              if (account.value.staked_node_id !== null) {
                fetchNode(account.value.staked_node_id)
              }
            })
            .catch(reason => accountError.value = reason)
      }
    }

    onMounted(() => fetchAccount())
    watch(walletManager.accountId, () => fetchAccount())

    //
    // stakedNode
    //
    const stakedNode = ref<NetworkNode | null>(null)

    const stakedNodeDescription = computed(() => {
      let description
      if (stakedNode.value?.description) {
        description = stakedNode.value?.description
      } else {
        description = stakedNode.value?.node_account_id ? operatorRegistry.makeDescription(stakedNode.value?.node_account_id) : null
      }
      return description
    })

    const fetchNode = (nodeId: number) => {
      const url = "api/v1/network/nodes"
      const queryParams = {params: {'node.id': nodeId}}
      axios
          .get<NetworkNodesResponse>(url, queryParams)
          .then(result => {
            if (result.data.nodes && result.data.nodes.length > 0) {
              stakedNode.value = result.data.nodes[0]
            } else {
              stakedNode.value = null
            }
          })
    }

    //
    // handleStopStaking / handleChangeStaking
    //

    const handleStopStaking = () => {
      changeStaking(null, null, account.value?.decline_reward ? false : null)
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
        progressExtraTransaction.value = null
        showProgressSpinner.value = false
        const transactionID = normalizeTransactionId(await walletManager.changeStaking(nodeId, accountId, declineReward))
        progressMainMessage.value = "Completing operation…"
        progressExtraMessage.value = "This may take a few seconds"
        showProgressSpinner.value = true
        await waitForTransactionRefresh(transactionID, 10)

        progressDialogMode.value = Mode.Success
        progressMainMessage.value = "Operation completed"
        showProgressSpinner.value = false
        progressExtraMessage.value = "with transaction ID:"
        progressExtraTransaction.value = transactionID

      } catch(error) {

        progressDialogMode.value = Mode.Error
        if (error instanceof WalletDriverError) {
          progressMainMessage.value = error.message
          progressExtraMessage.value = error.extra
        } else {
          progressMainMessage.value = "Operation did not complete"
          progressExtraMessage.value = JSON.stringify(error.message)
        }
        progressExtraTransaction.value = null
        showProgressSpinner.value = false

      } finally {

        fetchAccount()
      }

    }

    const waitForTransactionRefresh = async (transactionID: string, attemptIndex: number) => {
      let result: Promise<Transaction | string>

      if (attemptIndex >= 0) {
        await waitFor(props.polling)
        try {
          const response = await axios.get<TransactionByIdResponse>("api/v1/transactions/" + transactionID )
          const transactions = response.data.transactions ?? []
          result = Promise.resolve(transactions.length >= 1 ? transactions[0] : transactionID)
        } catch {
          result = waitForTransactionRefresh(transactionID, attemptIndex - 1)
        }
      } else {
        result = Promise.resolve(transactionID)
      }

      return result
    }

    //
    // Rewards Transactions Cache
    //
    const transactionCache = new RewardsTransactionCache()
    const setupTransactionCache = () => {
      if(walletManager.accountId.value) {
        transactionCache.accountId.value = walletManager.accountId.value
        transactionCache.state.value = EntityCacheStateV2.Started
      }
    }
    onMounted(() => setupTransactionCache())
    watch(walletManager.accountId, () => setupTransactionCache())
    onBeforeUnmount(() => {
      transactionCache.state.value = EntityCacheStateV2.Stopped
    })

    return {
      isSmallScreen,
      isTouchDevice,
      connecting,
      connected: walletManager.connected,
      walletName: walletManager.walletName,
      walletIconURL: walletManager.getActiveDriver().iconURL,
      accountId: walletManager.accountId,
      account,
      isStaked,
      showStakingDialog,
      showStopConfirmDialog,
      showWalletChooser,
      showErrorDialog,
      isIndirectStaking,
      stakedTo,
      stakedNode,
      balanceInHbar,
      stakedAmount,
      stakedSince,
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
      progressExtraTransaction,
      showProgressSpinner,
      transactions: transactionCache.filteredTransactions,
      transactionCacheState: transactionCache.state,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>