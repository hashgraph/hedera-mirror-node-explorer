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
              <NetworkDashboardItem :title="'Decline Reward'" :value="declineReward"/>
            </div>
            <br/>
            <div class="is-flex is-justify-content-space-between">
              <div class="is-flex is-justify-content-flex-start">
                <button class="button is-white is-small"
                        :disabled="!stakedTo" @click="showStopConfirmDialog = true">STOP STAKING</button>
                <button class="button is-white is-small ml-4" @click="showStakingDialog = true">CHANGE STAKING</button>
              </div>
              <button class="button is-white is-small" @click="disconnectFromWallet">DISCONNECT WALLET</button>
            </div>
          </div>
          <div v-else>
            <div class="is-flex-direction-column">
              <NetworkDashboardItem :name="stakedSince" :title="'Staked to'" :value="stakedTo"/>
              <div class="mt-4"/>
              <NetworkDashboardItem :name="stakedAmount ? 'HBAR' : ''" :title="'My Stake'" :value="stakedAmount"/>
              <div class="mt-4"/>
              <NetworkDashboardItem :title="'Decline Reward'" :value="declineReward"/>
              <div class="mt-4"/>
            </div>
              <div class="is-flex is-justify-content-center">
                  <button class="button is-white is-small"
                          :disabled="!stakedTo" @click="showStopConfirmDialog = true">STOP STAKING</button>
                  <button class="button is-white is-small ml-4" @click="showStakingDialog = true">CHANGE STAKED TO</button>
                </div>
            <div class="is-flex is-justify-content-center mt-4">
              <button class="button is-white is-small" @click="disconnectFromWallet">DISCONNECT WALLET</button>
            </div>
            <div class="mt-6"/>
          </div>
        </template>

        <template v-else-if="connected">
          <section class="section has-text-centered" style="min-height: 450px">
            <p>Connecting your Wallet...</p>
            <p>You need to select which account you wish to connect.</p>
            <br/>
            <button class="button is-white is-small" @click="disconnectFromWallet">ABORT CONNEXION</button>
          </section>
        </template>

        <template v-else>
          <section class="section has-text-centered" style="min-height: 450px">
            <p class="h-is-tertiary-text" style="font-weight: 300">
              To view or change your staking you first need to connect your wallet.
            </p>
            <br/>
            <button class="button is-white is-small" @click="connectToWallet">CONNECT WALLET…</button>
          </section>
        </template>

      </template>
    </DashboardCard>

    <DashboardCard v-if="accountId" :class="{'h-has-opacity-20': isIndirectStaking}">
      <template v-slot:title>
        <p class="h-is-primary-title">Transactions That Payed Reward</p>
      </template>
      <template v-slot:table>
        <TransactionTableV2
            :narrowed="true"
            :nb-items="10"
            :transactions="[]"
        />
      </template>
    </DashboardCard>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeMount, ref, watch} from 'vue';
import Footer from "@/components/Footer.vue";
import {hashConnectManager} from "@/router";
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
import TransactionTableV2 from "@/components/transaction/TransactionTableV2.vue";
import StakingDialog from "@/components/StakingDialog.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import {TransactionResponse} from "@hashgraph/sdk";
import {TransactionID} from "@/utils/TransactionID";
import ProgressDialog, {Mode} from "@/components/ProgressDialog.vue";
import AccountLink from "@/components/values/AccountLink.vue";

export default defineComponent({
  name: 'Staking',

  props: {
    network: String
  },

  components: {
    AccountLink,
    ConfirmDialog,
    ProgressDialog,
    DashboardCard,
    StakingDialog,
    TransactionTableV2,
    NetworkDashboardItem,
    Footer,
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

    //
    // Account
    //
    const account = ref<AccountBalanceTransactions | null>(null)
    const accountError = ref<unknown>(null)

    const showStakingDialog = ref(false)
    const showStopConfirmDialog = ref(false)

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

    const stakedAmount = computed(() => {
      let result
      if ( isStaked.value && account.value?.balance?.balance != null) {
        result = (account.value.balance.balance / 100000000).toString()
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
      return account.value?.decline_reward?.toString() ?? null
    })

    const fetchAccount = () => {
      console.log("fetch account: " + hashConnectManager.accountId.value)
      const params = {} as {
        limit: 1
      }
      if (hashConnectManager.accountId.value) {
        axios
            .get<AccountBalanceTransactions>("api/v1/accounts/" + hashConnectManager.accountId.value, {params: params})
            .then(response => {
              account.value = response.data
              if (account.value.staked_node_id !== null) {
                fetchNode(account.value.staked_node_id)
              }
            })
            .catch(reason => accountError.value = reason)
      }
    }

    onBeforeMount(() => fetchAccount())
    watch(hashConnectManager.accountId, () => fetchAccount())

    //
    // Node
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
      console.log("fetch node: " + nodeId)
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

    const changeStaking = (nodeId: number|null, accountId: string|null, declineReward: boolean|null) => {

      showProgressDialog.value = true
      progressDialogMode.value = Mode.Busy
      progressDialogTitle.value = (nodeId == null && accountId == null && !declineReward) ? "Stopping staking" : "Updating staking"
      progressMainMessage.value = "Connecting to Hedera Network using your wallet…"
      progressExtraMessage.value = "Check your wallet for any approval request"
      progressExtraTransaction.value = null
      showProgressSpinner.value = false

      hashConnectManager.changeStaking(nodeId, accountId, declineReward)
          .then((response: TransactionResponse) => {
            progressMainMessage.value = "Completing operation…"
            progressExtraMessage.value = "This may take a few seconds"
            showProgressSpinner.value = true
            const transactionID = TransactionID.normalize(response.transactionId.toString(), false)
            return waitForTransactionRefresh(transactionID, 10)
          })
          .then((response: Transaction | string) => {
            progressDialogMode.value = Mode.Success
            progressMainMessage.value = "Operation completed"
            showProgressSpinner.value = false
            progressExtraMessage.value = "with transaction ID:"
            const transactionID = typeof response == "string" ? response : response.transaction_id
            progressExtraTransaction.value = transactionID ?? null
            fetchAccount()
          })
          .catch(() => {
            progressDialogMode.value = Mode.Error
            progressMainMessage.value = "Operation did not complete"
            progressExtraMessage.value = "Your wallet rejected this operation"
            progressExtraTransaction.value = null
            showProgressSpinner.value = false
            fetchAccount()
          })
    }

    const waitForTransactionRefresh = async (transactionID: string, attemptIndex: number) => {
      let result: Promise<Transaction | string>

      if (attemptIndex >= 0) {
        await waitFor(3000)
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

    const showProgressDialog = ref(false)
    const progressDialogMode = ref(Mode.Busy)
    const progressDialogTitle = ref<string|null>(null)
    const progressMainMessage = ref<string|null>(null)
    const progressExtraMessage = ref<string|null>(null)
    const progressExtraTransaction = ref<string|null>(null)
    const showProgressSpinner = ref(false)

    return {
      isSmallScreen,
      isTouchDevice,
      connected: hashConnectManager.connected,
      connectedNetwork: hashConnectManager.connectedNetwork,
      walletName: hashConnectManager.walletName,
      walletIconURL: hashConnectManager.walletIconURL,
      accountId: hashConnectManager.accountId,
      account,
      isStaked,
      showStakingDialog,
      showStopConfirmDialog,
      isIndirectStaking,
      stakedTo,
      stakedNode,
      stakedAmount,
      stakedSince,
      declineReward,
      connectToWallet,
      disconnectFromWallet,
      handleStopStaking,
      handleChangeStaking,
      showProgressDialog,
      progressDialogMode,
      progressDialogTitle,
      progressMainMessage,
      progressExtraMessage,
      progressExtraTransaction,
      showProgressSpinner
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>