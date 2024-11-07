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

  <section :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}" class="section">

    <div v-if="temporaryBanner" class="hero is-small mb-5" style="background-color: var(--h-theme-highlight-color);">
      <div class="hero-body h-is-property-text p-3" v-html="temporaryBanner"/>
    </div>

    <DashboardCard collapsible-key="accountDetails">
      <template v-if="!isInactiveEvmAddress" v-slot:title>
        <figure
            v-if="isMyAccount"
            class="is-flex is-align-items-center"
            style="height: 40px;"
        >
          <img
              v-if="isMyAccount"
              :src="walletIconURL ?? undefined"
              style="height: 100%"
              alt="wallet logo"
              class="mr-3"
          >
          <span class="h-is-primary-title">My Account</span>
        </figure>
        <span v-else class="h-is-primary-title">Account</span>
      </template>
      <template v-else v-slot:title>
        <span class="h-is-primary-title">Inactive EVM Address</span>
      </template>

      <template v-if="!isInactiveEvmAddress" v-slot:subtitle>
        <div class="h-is-tertiary-text mt-3" id="entityId">
          <div class="is-inline-block h-is-property-text has-text-weight-light" style="min-width: 115px">Account ID:</div>
          <Copyable :content-to-copy="normalizedAccountId ?? ''">
            <template v-slot:content>
              <span :class="{'h-is-secondary-title': isMyAccount}">{{ normalizedAccountId ?? "" }}</span>
            </template>
          </Copyable>
          <span v-if="accountChecksum" class="has-text-grey h-is-smaller">-{{ accountChecksum }}</span>
        </div>
        <div v-if="operatorNodeRoute" id="nodeLink" class="h-is-tertiary-text mt-2">
          <div class="is-inline-block h-is-property-text has-text-weight-light" style="min-width: 115px">Node:</div>
          <router-link :to="operatorNodeRoute">
            <span>{{ nodeId }} - {{ accountDescription }}</span>
          </router-link>
        </div>
        <div v-else-if="ethereumAddress" id="evmAddress" class="h-is-tertiary-text mt-2" style="word-break: keep-all">
          <div class="is-inline-block h-is-property-text has-text-weight-light" style="min-width: 115px">EVM Address:</div>
          <div class="is-inline-block">
            <EVMAddress :show-id="false" :has-custom-font="true" :address="ethereumAddress"/>
          </div>
        </div>
        <div v-if="domainName" id="names" class="h-is-tertiary-text mt-2" style="word-break: keep-all">
          <div class="is-inline-block h-is-property-text has-text-weight-light" style="min-width: 115px">Domain:</div>
          <div class="is-inline-block h-is-property-text">
            <EntityIOL :label="domainName"/>
            <span class="ml-2">
              <InfoTooltip v-if="domainProviderName" :label="domainProviderName"/>
            </span>
          </div>
        </div>

        <div v-if="!isMediumScreen && showContractVisible && contractRoute" id="showContractLink"
             class="is-inline-block mt-2">
          <router-link :to="contractRoute">
            <span class="h-is-property-text">Show associated contract</span>
          </router-link>
        </div>
      </template>
      <template v-else v-slot:subtitle>
        <div class="h-is-tertiary-text mt-3" id="entityId">
          <div class="is-inline-block h-is-property-text has-text-weight-light" style="min-width: 115px">Account ID:
          </div>
          <span class="has-text-grey">Assigned upon activation</span>
        </div>
        <div id="evmAddress" class="h-is-tertiary-text mt-2" style="word-break: keep-all">
          <div class="is-inline-block h-is-property-text has-text-weight-light" style="min-width: 115px">EVM Address:
          </div>
          <div class="is-inline-block">
            <EVMAddress :show-id="false" :has-custom-font="true" :address="accountIdRef"/>
          </div>
        </div>

        <div v-if="!isMediumScreen && showContractVisible" id="showContractLink" class="is-inline-block mt-2">
          <router-link :to="contractRoute">
            <span class="h-is-property-text">Show associated contract</span>
          </router-link>
        </div>
      </template>

      <template v-slot:control>
        <button v-if="isAccountEditable" id="update-button" class="button is-white is-small"
                @click="onUpdateAccount">UPDATE ACCOUNT…
        </button>

        <div v-if="isMediumScreen && showContractVisible && contractRoute" id="showContractLink"
             class="is-inline-block ml-3">
          <router-link :to="contractRoute">
            <span class="h-is-property-text">Show associated contract</span>
          </router-link>
        </div>
      </template>

      <template v-slot:content>
        <NotificationBanner v-if="notification" :message="notification" :is-error="!isInactiveEvmAddress"/>

        <div class="h-is-property-text">
          <Property id="balance" :full-width="isMediumScreen">
            <template v-slot:name>
              <span class="h-is-tertiary-text">Balance</span>
            </template>
            <template v-slot:value>
              <InlineBalancesValue :balance-analyzer="balanceAnalyzer"/>
            </template>
          </Property>
        </div>
      </template>

      <template v-slot:leftContent>
        <EditableProperty
            v-if="enableStaking"
            id="stakedTo"
            :editable="isAccountEditable"
            @edit="onUpdateAccount"
        >
          <template v-slot:name>
            Staked to
          </template>
          <template v-slot:value>
            <div v-if="stakedAccountId">
              Account
              <div class="is-inline-block">
                <AccountLink :accountId="account?.staked_account_id" v-bind:show-extra="true"/>
              </div>
            </div>
            <div v-else-if="stakedNodeRoute">
              <router-link :to="stakedNodeRoute">
                <span class="icon is-small has-text-info mr-1">
                  <i :class="stakedNodeIcon"></i>
                </span>
                Node {{ account?.staked_node_id }} - {{ stakedNodeDescription }}
              </router-link>
            </div>
            <span v-else class="has-text-grey">None</span>
          </template>
        </EditableProperty>

        <Property v-if="enableStaking" id="pendingReward">
          <template v-slot:name>Pending Reward</template>
          <template v-slot:value>
            <HbarAmount :amount="account?.pending_reward" :show-extra="true" timestamp="0"/>
            <div v-if="stakePeriodStart" class="h-is-extra-text h-is-text-size-2">
              {{ "Period Started " + stakePeriodStart }}
            </div>
          </template>
        </Property>
        <Property v-if="enableStaking && account?.staked_node_id != null" id="declineReward">
          <template v-slot:name>Rewards</template>
          <template v-slot:value>
            <StringValue :string-value="account?.decline_reward ? 'Declined' : 'Accepted'"/>
          </template>
        </Property>
        <EditableProperty
            id="memo"
            :editable="isAccountEditable"
            @edit="onUpdateAccount"
        >
          <template v-slot:name>Memo</template>
          <template v-slot:value>
            <BlobValue v-bind:base64="true" v-bind:blob-value="account?.memo" v-bind:show-none="true"
                       :show-base64-as-extra="true"/>
          </template>
        </EditableProperty>

        <Property id="createTransaction">
          <template v-slot:name>Create Transaction</template>
          <template v-slot:value>
            <TransactionLink :transactionLoc="account?.created_timestamp ?? undefined"/>
          </template>
        </Property>

        <Property
            v-if="enableExpiry"
            id="expiresAt"
            tooltip="Account expiry is not turned on yet. This value is not taken into account for the time being."
        >
          <template v-slot:name>
            <span>Expires at</span>
          </template>
          <template v-slot:value>
            <TimestampValue v-bind:show-none="true" v-bind:timestamp="account?.expiry_timestamp"/>
          </template>
        </Property>
        <EditableProperty
            v-if="enableExpiry"
            id="autoRenewPeriod"
            tooltip="Account auto-renew is not turned on yet. This value is not taken into account for the time being."
            :editable="isAccountEditable"
            @edit="onUpdateAccount"
        >
          <template v-slot:name>
            <span>Auto Renew Period</span>
          </template>
          <template v-slot:value>
            <DurationValue v-bind:number-value="account?.auto_renew_period ?? undefined"/>
          </template>
        </EditableProperty>
        <EditableProperty
            id="maxAutoAssociation"
            tooltip="Max.Auto.Associations sets the amount of airdrops. Unlimited(-1), Limited(>0), No airdrop slots(0)."
            :editable="isAccountEditable"
            @edit="onUpdateAccount"
        >
          <template v-slot:name>Max. Auto. Associations</template>
          <template v-slot:value>
            <StringValue :string-value="maxAutoAssociationsValue"/>
          </template>
        </EditableProperty>
        <EditableProperty
            id="receiverSigRequired"
            :editable="isAccountEditable"
            @edit="onUpdateAccount"
        >
          <template v-slot:name>Receiver Sig. Required</template>
          <template v-slot:value>
            <StringValue :string-value="account?.receiver_sig_required?.toString()"/>
          </template>
        </EditableProperty>
      </template>

      <template v-slot:rightContent>
        <EditableProperty
            id="key"
            :editable="false"
            @edit="onUpdateAccount"
        >
          <template v-slot:name>Admin Key</template>
          <template v-slot:value>
            <KeyValue :account-id="normalizedAccountId ?? undefined" :key-bytes="account?.key?.key"
                      :key-type="account?.key?._type"
                      :show-none="true"/>
          </template>
        </EditableProperty>

        <Property v-if="account?.alias" id="alias" :class="{'mb-0':account?.alias}">
          <template v-slot:name>Key Alias</template>
          <template v-slot:value>
            <AliasValue :alias-value="account?.alias"/>
          </template>
        </Property>

        <Property id="ethereumNonce">
          <template v-slot:name>Ethereum Nonce</template>
          <template v-slot:value>
            <StringValue :string-value="account?.ethereum_nonce?.toString()"/>
          </template>
        </Property>
      </template>
    </DashboardCard>

    <TokensSection :account-id="normalizedAccountId" :full-page="false"/>

    <DashboardCard v-if="!isInactiveEvmAddress" collapsible-key="recentTransactions">
      <template v-slot:title>
        <p id="recentTransactions" class="h-is-secondary-title">Recent Operations</p>
      </template>
      <template v-slot:control>
        <div v-if="selectedTab === 'transactions'" class="is-flex is-align-items-flex-end">
          <PlayPauseButton v-if="timeSelection == 'LATEST'" :controller="transactionTableController"/>
          <DateTimePicker v-else :controller="transactionTableController" @dateCleared="onDateCleared"/>
          <o-field style="margin-bottom: 0">
            <o-select v-model="timeSelection" class="ml-2 h-is-text-size-1">
              <option value="LATEST">LATEST</option>
              <option value="JUMP">JUMP TO DATE</option>
            </o-select>
          </o-field>
          <DownloadButton @click="downloadController.visible.value = true"/>
          <TransactionFilterSelect v-model:selected-filter="transactionType" class="ml-2"/>
        </div>
        <div v-else-if="selectedTab === 'contracts'" class="is-flex is-justify-content-end is-align-items-center">
          <PlayPauseButton v-if="!filterVerified" :controller="contractCreateTableController"/>
          <PlayPauseButton v-else :controller="verifiedContractsController"/>
          <span class="ml-5 mr-2">All</span>
          <o-field>
            <o-switch v-model="filterVerified">Verified</o-switch>
          </o-field>
        </div>
      </template>
      <template v-slot:content>
        <Tabs
            :selected-tab="selectedTab"
            :tab-ids="tabIds"
            :tabLabels="tabLabels"
            @update:selected-tab="handleTabUpdate($event)"
        />

        <div v-if="selectedTab === 'transactions'" id="recentTransactionsTable">
          <TransactionTable v-if="account" :controller="transactionTableController" :narrowed="true"/>
        </div>

        <div v-else-if="selectedTab === 'contracts'" id="recentContractsTable">
          <AccountCreatedContractsTable v-if="account && !filterVerified" :controller="contractCreateTableController"/>
          <VerifiedContractsTable
              v-else-if="account"
              :controller="verifiedContractsController"
              :loaded="loaded"
              :overflow="overflow"/>
          <EmptyTable v-else/>
        </div>

        <div v-else id="recentRewardsTable">
          <StakingRewardsTable :controller="rewardsTableController"/>
        </div>
      </template>
    </DashboardCard>

    <AllowancesSection :account-id="normalizedAccountId ?? undefined"/>

    <MirrorLink :network="network" entityUrl="accounts" :loc="accountIdRef ?? undefined"/>

    <TransactionDownloadDialog :account-id="accountIdRef ?? undefined" :controller="downloadController"/>

  </section>

  <Footer/>

  <UpdateAccountDialog
      :account-info="account"
      :controller="updateDialogController"
      @updated="onUpdateCompleted"
  />

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, inject, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import KeyValue from "@/components/values/KeyValue.vue";
import PlayPauseButton from "@/components/PlayPauseButton.vue";
import TransactionTable from "@/components/transaction/TransactionTable.vue";
import DurationValue from "@/components/values/DurationValue.vue";
import TimestampValue from "@/components/values/TimestampValue.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";
import BlobValue from "@/components/values/BlobValue.vue";
import {BalanceAnalyzer} from "@/utils/analyzer/BalanceAnalyzer";
import Footer from "@/components/Footer.vue";
import Property from "@/components/Property.vue";
import NotificationBanner from "@/components/NotificationBanner.vue";
import StringValue from "@/components/values/StringValue.vue";
import {TransactionTableControllerXL} from "@/components/transaction/TransactionTableControllerXL";
import AccountLink from "@/components/values/link/AccountLink.vue";
import {AccountLocParser} from "@/utils/parser/AccountLocParser";
import {ContractByIdCache} from "@/utils/cache/ContractByIdCache";
import TransactionFilterSelect from "@/components/transaction/TransactionFilterSelect.vue";
import router, {routeManager, walletManager} from "@/router";
import TransactionLink from "@/components/values/TransactionLink.vue";
import {StakingRewardsTableController} from "@/components/staking/StakingRewardsTableController";
import StakingRewardsTable from "@/components/staking/StakingRewardsTable.vue";
import AliasValue from "@/components/values/AliasValue.vue";
import {NodeAnalyzer} from "@/utils/analyzer/NodeAnalyzer";
import EVMAddress from "@/components/values/EVMAddress.vue";
import AllowancesSection from "@/components/allowances/AllowancesSection.vue";
import Copyable from "@/components/Copyable.vue";
import InlineBalancesValue from "@/components/values/InlineBalancesValue.vue";
import MirrorLink from "@/components/MirrorLink.vue";
import {TransactionType} from "@/schemas/HederaSchemas";
import {TransactionTableController} from "@/components/transaction/TransactionTableController";
import EmptyTable from "@/components/EmptyTable.vue";
import VerifiedContractsTable from "@/components/account/VerifiedContractsTable.vue";
import {AppStorage} from "@/AppStorage";
import Tabs from "@/components/Tabs.vue";
import AccountCreatedContractsTable from "@/components/account/AccountCreatedContractsTable.vue";
import {VerifiedContractsByAccountIdCache} from "@/utils/cache/VerifiedContractsByAccountIdCache";
import {VerifiedContractsController} from "@/components/contract/VerifiedContractsController";
import DateTimePicker from "@/components/DateTimePicker.vue";
import DownloadButton from "@/components/DownloadButton.vue";
import {DialogController} from "@/components/dialog/DialogController";
import TransactionDownloadDialog from "@/components/download/TransactionDownloadDialog.vue";
import {NameQuery} from "@/utils/name_service/NameQuery";
import EntityIOL from "@/components/values/link/EntityIOL.vue";
import InfoTooltip from "@/components/InfoTooltip.vue";
import {labelForAutomaticTokenAssociation} from "@/schemas/HederaUtils";
import TokensSection from "@/components/token/TokensSection.vue";
import EditableProperty from "@/components/EditableProperty.vue";
import UpdateAccountDialog from "@/components/account/UpdateAccountDialog.vue";
import {CoreConfig} from "@/config/CoreConfig";

const props = defineProps({
  accountId: String,
  network: String,
})

const temporaryBanner = import.meta.env.VITE_APP_TEMPORARY_BANNER ?? null

const isSmallScreen = inject('isSmallScreen', true)
const isMediumScreen = inject('isMediumScreen', true)
const isTouchDevice = inject('isTouchDevice', false)

const coreConfig = CoreConfig.inject()
const enableExpiry = coreConfig.enableExpiry
const enableStaking = routeManager.enableStaking

const timeSelection = ref("LATEST")
watch(timeSelection, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    if (timeSelection.value == "LATEST") {
      transactionTableController.startAutoRefresh() // (1)
    } else {
      transactionTableController.stopAutoRefresh()
    }
  }
})

function onDateCleared() {
  timeSelection.value = "LATEST"
  // (1) will restart auto-refresh
}

//
// account
//
const accountLocParser = new AccountLocParser(computed(() => props.accountId ?? null))
onMounted(() => accountLocParser.mount())
onBeforeUnmount(() => accountLocParser.unmount())

const maxAutoAssociationsValue = computed(() =>
    labelForAutomaticTokenAssociation(
        accountLocParser.accountInfo.value?.max_automatic_token_associations ?? 0
    ))

//
// BalanceAnalyzer
//
const balanceAnalyzer = new BalanceAnalyzer(accountLocParser.accountId, 10000)
onMounted(() => balanceAnalyzer.mount())
onBeforeUnmount(() => balanceAnalyzer.unmount())

//
// contract
//
const contractLookup = ContractByIdCache.instance.makeLookup(accountLocParser.accountId)
onMounted(() => contractLookup.mount())
onBeforeUnmount(() => contractLookup.unmount())
const showContractVisible = computed(() => {
  return contractLookup.entity.value != null
})

//
// staking
//
const stakedNodeAnalyzer = new NodeAnalyzer(accountLocParser.stakedNodeId)
onMounted(() => stakedNodeAnalyzer.mount())
onBeforeUnmount(() => stakedNodeAnalyzer.unmount())

const stakedNodeIcon = computed(() => {
  let result
  if (accountLocParser.stakedNodeId.value !== null) {
    result = stakedNodeAnalyzer.isCouncilNode.value ? "fas fa-building" : "fas fa-users"
  } else {
    result = ""
  }
  return result
})

const contractRoute = computed(() => {
  const accountId = accountLocParser.accountId.value
  return accountId ? routeManager.makeRouteToContract(accountId) : ''
})

const stakedNodeRoute = computed(() => {
  const stakedNodeId = accountLocParser.stakedNodeId.value
  return stakedNodeId !== null ? routeManager.makeRouteToNode(stakedNodeId) : ''
})

const operatorNodeRoute = computed(() => {
  const operatorNodeId = accountLocParser.nodeId.value
  return operatorNodeId != null ? routeManager.makeRouteToNode(operatorNodeId) : ''
})

const tabIds = enableStaking ? ['transactions', 'contracts', 'rewards'] : ['transactions', 'contracts']
const tabLabels = enableStaking ? ['Transactions', 'Created Contracts', 'Staking Rewards'] : ['Transactions', 'Created Contracts']
const selectedTab = ref<string | null>(AppStorage.getAccountOperationTab() ?? tabIds[0])
const handleTabUpdate = (tab: string | null) => {
  selectedTab.value = tab
  AppStorage.setAccountOperationTab(tab)
}
const filterVerified = ref(false)

//
// Table controllers and cache for Recent Account Operations
// These are mounted only when their respective table is mounted, i.e. when the corresponding tab is selected
//
const perPage = ref(isMediumScreen ? 10 : 5)
const accountIdRef = accountLocParser.accountId

const transactionTableController = new TransactionTableControllerXL(
    router,
    accountIdRef,
    perPage,
    true,
    AppStorage.ACCOUNT_OPERATION_TABLE_PAGE_SIZE_KEY,
    "p1", "k1")

const contractCreateTableController = new TransactionTableController(
    router,
    perPage,
    TransactionType.CONTRACTCREATEINSTANCE,
    "success",
    AppStorage.ACCOUNT_OPERATION_TABLE_PAGE_SIZE_KEY,
    "p3", "k3",
    accountIdRef)

const verifiedContractsController = new VerifiedContractsController(
    VerifiedContractsByAccountIdCache.instance.makeLookup(accountIdRef),
    perPage,
    AppStorage.ACCOUNT_OPERATION_TABLE_PAGE_SIZE_KEY
)

const rewardsTableController = new StakingRewardsTableController(
    router,
    accountLocParser.accountId,
    perPage,
    AppStorage.ACCOUNT_OPERATION_TABLE_PAGE_SIZE_KEY,
    "p2", "k2")

//
// Transactions download
//

const downloadController = new DialogController()

//
// Naming
//

const nameQuery = new NameQuery(computed(() => props.accountId ?? null))
onMounted(() => nameQuery.mount())
onBeforeUnmount(() => nameQuery.unmount())

//
// Account Update
//

const updateDialogController = new DialogController()

const onUpdateAccount = () => updateDialogController.visible.value = true

const onUpdateCompleted = () => accountLocParser.remount()

const isMyAccount = computed(() => walletManager.connected.value && walletManager.accountId.value === props.accountId)
const walletIconURL = computed(() => (isMyAccount.value) ? walletManager.getActiveDriver().iconURL || "" : "")
const isHederaWallet = computed(() => walletManager.isHederaWallet.value)
const airdropsEnabled = import.meta.env.VITE_APP_ENABLE_AIRDROP === 'true'
const isAccountEditable = computed(() => isMyAccount.value && isHederaWallet.value && airdropsEnabled
)

const transactionType = transactionTableController.transactionType
const loaded = verifiedContractsController.loaded
const overflow = verifiedContractsController.overflow
const notification = accountLocParser.errorNotification
const isInactiveEvmAddress = accountLocParser.isInactiveEvmAddress
const account = accountLocParser.accountInfo
const normalizedAccountId = accountLocParser.accountId
const accountChecksum = accountLocParser.accountChecksum
const accountDescription = accountLocParser.accountDescription
const nodeId = accountLocParser.nodeId
const ethereumAddress = accountLocParser.ethereumAddress
const stakePeriodStart = accountLocParser.stakePeriodStart
const stakedAccountId = accountLocParser.stakedAccountId
const stakedNodeDescription = stakedNodeAnalyzer.nodeDescription
const domainName = nameQuery.name
const domainProviderName = nameQuery.providerName

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
