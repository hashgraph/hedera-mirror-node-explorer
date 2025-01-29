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

  <PageFrameV2 page-title="Account Details">

    <div class="page-container">

      <DashboardCardV2 collapsible-key="accountDetails">
        <template #title>
          <span v-if="isInactiveEvmAddress">
            Inactive EVM Address
          </span>
          <span v-else-if="isMyAccount" class="my-account">
            <img :src="walletIconURL ?? undefined" alt="wallet logo">
            <span>My Account</span>
          </span>
          <span v-else>
            Account
          </span>
        </template>

        <template #right-control>
          <template v-if="isAccountEditable">
            <ButtonView
                v-if="isAccountEditable"
                id="update-button"
                :is-default="true"
                :size="ButtonSize.small"
                @action="onUpdateAccount"
            >
              UPDATE ACCOUNT
            </ButtonView>
          </template>
          <template v-else-if="showContractVisible && contractRoute">
            <ArrowLink
                :route="contractRoute" id="showContractLink"
                text="Associated contract"
            />
          </template>
        </template>

        <template #content>
          <NotificationBanner v-if="notification" :message="notification" :is-error="!isInactiveEvmAddress"/>

          <Property id="entityId" full-width>
            <template #name>
              Account ID
            </template>
            <template #value>
              <span v-if="isInactiveEvmAddress">
                Assigned upon activation
              </span>
              <template v-else>
                <Copyable :content-to-copy="normalizedAccountId ?? ''">
                  <template #content>
                    <span>{{ normalizedAccountId ?? "" }}</span>
                  </template>
                </Copyable>
                <span v-if="accountChecksum">-{{ accountChecksum }}</span>
              </template>
            </template>
          </Property>
          <Property v-if="operatorNodeRoute" id="nodeLink" full-width>
            <template #name>
              Node
            </template>
            <template #value>
              <router-link :to="operatorNodeRoute">
                <span>{{ nodeId }} - {{ accountDescription }}</span>
              </router-link>
            </template>
          </Property>
          <Property v-else id="evmAddress" full-width>
            <template #name>
              EVM Address
            </template>
            <template #value>
              <EVMAddress
                  :show-id="false"
                  :has-custom-font="true"
                  :address="isInactiveEvmAddress ? accountIdRef : ethereumAddress"/>
            </template>
          </Property>
          <Property v-if="domainName" id="names" full-width>
            <template #name>
              Domain
            </template>
            <template #value>
              <EntityIOL :label="domainName"/>
              <InfoTooltip v-if="domainProviderName" :label="domainProviderName"/>
            </template>
          </Property>
        </template>

        <template #left-content>

          <Property id="balance">
            <template #name>
              Balance
            </template>
            <template #value>
              <InlineBalancesValue :balance-analyzer="balanceAnalyzer"/>
            </template>
          </Property>
          <EditableProperty
              v-if="enableStaking"
              id="stakedTo"
              :editable="isAccountEditable"
              @edit="onUpdateAccount"
          >
            <template #name>
              Staked to
            </template>
            <template #value>
              <div v-if="stakedAccountId">
                Account
                <AccountLink :accountId="account?.staked_account_id" v-bind:show-extra="true"/>
              </div>
              <div v-else-if="stakedNodeRoute">
                <router-link :to="stakedNodeRoute">
                  Node {{ account?.staked_node_id }} - {{ stakedNodeDescription }}
                </router-link>
              </div>
              <span v-else>None</span>
            </template>
          </EditableProperty>
          <Property v-if="enableStaking" id="pendingReward">
            <template #name>Pending Reward</template>
            <template #value>
              <HbarAmount :amount="account?.pending_reward" :show-extra="true" timestamp="0"/>
              <div v-if="stakePeriodStart" class="text-secondary">
                {{ "Period Started " + stakePeriodStart }}
              </div>
            </template>
          </Property>
          <Property v-if="enableStaking && account?.staked_node_id != null" id="declineReward">
            <template #name>Rewards</template>
            <template #value>
              <StringValue :string-value="account?.decline_reward ? 'Declined' : 'Accepted'"/>
            </template>
          </Property>
          <EditableProperty
              id="memo"
              :editable="isAccountEditable"
              @edit="onUpdateAccount"
          >
            <template #name>Memo</template>
            <template #value>
              <BlobValue v-bind:base64="true" v-bind:blob-value="account?.memo" v-bind:show-none="true"
                         :show-base64-as-extra="true"/>
            </template>
          </EditableProperty>
          <Property id="createTransaction">
            <template #name>Create Transaction</template>
            <template #value>
              <TransactionLink :transactionLoc="account?.created_timestamp ?? undefined"/>
            </template>
          </Property>
          <Property
              v-if="enableExpiry"
              id="expiresAt"
              tooltip="Account expiry is not turned on yet. This value is not taken into account for the time being."
          >
            <template #name>
              <span>Expires at</span>
            </template>
            <template #value>
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
            <template #name>
              <span>Auto Renew Period</span>
            </template>
            <template #value>
              <DurationValue v-bind:number-value="account?.auto_renew_period ?? undefined"/>
            </template>
          </EditableProperty>
          <EditableProperty
              id="maxAutoAssociation"
              tooltip="Max.Auto.Associations sets the amount of airdrops. Unlimited(-1), Limited(>0), No airdrop slots(0)."
              :editable="isAccountEditable"
              @edit="onUpdateAccount"
          >
            <template #name>Max. Auto. Associations</template>
            <template #value>
              <StringValue :string-value="maxAutoAssociationsValue"/>
            </template>
          </EditableProperty>
          <EditableProperty
              id="receiverSigRequired"
              :editable="isAccountEditable"
              @edit="onUpdateAccount"
          >
            <template #name>Receiver Sig. Required</template>
            <template #value>
              <StringValue :string-value="account?.receiver_sig_required?.toString()"/>
            </template>
          </EditableProperty>
        </template>

        <template #right-content>
          <EditableProperty
              id="key"
              :editable="false"
              @edit="onUpdateAccount"
          >
            <template #name>Admin Key</template>
            <template #value>
              <KeyValue :account-id="normalizedAccountId ?? undefined" :key-bytes="account?.key?.key"
                        :key-type="account?.key?._type"
                        :show-none="true"/>
            </template>
          </EditableProperty>
          <Property id="ethereumNonce">
            <template #name>Ethereum Nonce</template>
            <template #value>
              <StringValue :string-value="account?.ethereum_nonce?.toString()"/>
            </template>
          </Property>
        </template>
      </DashboardCardV2>

      <TokensSection :account-id="normalizedAccountId" :full-page="false"/>

      <DashboardCardV2 v-if="!isInactiveEvmAddress" collapsible-key="recentTransactions">
        <template #title>
          <p id="recentTransactions">Recent Operations</p>
        </template>

        <template #left-control>
          <template v-if="selectedTab === 'transactions' && timeSelection === 'LATEST'">
            <PlayPauseButton :controller="transactionTableController"/>
          </template>
          <template v-else-if="selectedTab === 'contracts'">
            <PlayPauseButton v-if="!filterVerified" :controller="contractCreateTableController"/>
            <PlayPauseButton v-else :controller="verifiedContractsController"/>
          </template>
        </template>

        <template #right-control>
          <template v-if="selectedTab === 'transactions'">
            <DateTimePicker
                v-if="timeSelection !== 'LATEST'"
                :controller="transactionTableController"
                @dateCleared="onDateCleared"
            />
            <SelectView v-model="timeSelection" :small="true">
              <option value="LATEST">LATEST</option>
              <option value="JUMP">JUMP TO DATE</option>
            </SelectView>
            <DownloadButton @click="transactionDownloadDialogVisible = true"/>
            <TransactionFilterSelect v-model:selected-filter="transactionType"/>
          </template>
          <template v-else-if="selectedTab === 'contracts'">
            <span>All</span>
            <SwitchView v-model="filterVerified"/>
            <span>Verified</span>
          </template>
        </template>

        <template #content>
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
            <AccountCreatedContractsTable
                v-if="account && !filterVerified"
                :controller="contractCreateTableController"
            />
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
      </DashboardCardV2>

      <AllowancesSection :account-id="normalizedAccountId ?? undefined"/>

      <MirrorLink :network="network" entityUrl="accounts" :loc="accountIdRef ?? undefined"/>

    </div>

    <TransactionDownloadDialog
        v-if="accountIdRef"
        v-model:show-dialog="transactionDownloadDialogVisible"
        :account-id="accountIdRef"/>

    <UpdateAccountDialog
        v-model:show-dialog="showUpdateAccountDialog"
        @updated="onUpdateCompleted"
     />

  </PageFrameV2>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, inject, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import KeyValue from "@/components/values/KeyValue.vue";
import TransactionTable from "@/components/transaction/TransactionTable.vue";
import DurationValue from "@/components/values/DurationValue.vue";
import TimestampValue from "@/components/values/TimestampValue.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";
import BlobValue from "@/components/values/BlobValue.vue";
import {BalanceAnalyzer} from "@/utils/analyzer/BalanceAnalyzer";
import PageFrameV2 from "@/components/page/PageFrameV2.vue";
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
import {NodeAnalyzer} from "@/utils/analyzer/NodeAnalyzer";
import EVMAddress from "@/components/values/EVMAddress.vue";
import AllowancesSection from "@/components/allowances/AllowancesSection.vue";
import Copyable from "@/components/Copyable.vue";
import InlineBalancesValue from "@/components/values/InlineBalancesValue.vue";
import MirrorLink from "@/components/MirrorLink.vue";
import {TransactionType} from "@/schemas/MirrorNodeSchemas";
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
import TransactionDownloadDialog from "@/dialogs/download/TransactionDownloadDialog.vue";
import {NameQuery} from "@/utils/name_service/NameQuery";
import EntityIOL from "@/components/values/link/EntityIOL.vue";
import InfoTooltip from "@/components/InfoTooltip.vue";
import {labelForAutomaticTokenAssociation} from "@/schemas/MirrorNodeUtils.ts";
import TokensSection from "@/components/token/TokensSection.vue";
import EditableProperty from "@/components/EditableProperty.vue";
import UpdateAccountDialog from "@/dialogs/UpdateAccountDialog.vue";
import {NetworkConfig} from "@/config/NetworkConfig";
import SwitchView from "@/components/SwitchView.vue";
import SelectView from "@/components/SelectView.vue";
import DashboardCardV2 from "@/components/DashboardCardV2.vue";
import ButtonView from "@/dialogs/core/ButtonView.vue";
import PlayPauseButton from "@/components/PlayPauseButton.vue";
import ArrowLink from "@/components/ArrowLink.vue";
import {ButtonSize} from "@/dialogs/core/DialogUtils.ts";

const props = defineProps({
  accountId: String,
  network: String,
})

const isMediumScreen = inject('isMediumScreen', true)
const networkConfig = NetworkConfig.inject()

const enableExpiry = routeManager.enableExpiry
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
const accountLocParser = new AccountLocParser(computed(() => props.accountId ?? null), networkConfig)
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

const transactionDownloadDialogVisible = ref(false)

//
// Naming
//

const nameQuery = new NameQuery(computed(() => props.accountId ?? null))
onMounted(() => nameQuery.mount())
onBeforeUnmount(() => nameQuery.unmount())

//
// Account Update
//

const showUpdateAccountDialog = ref(false)

const onUpdateAccount = () => showUpdateAccountDialog.value = true

const onUpdateCompleted = () => accountLocParser.remount()

const isMyAccount = computed(() => walletManager.accountId.value === props.accountId)
const walletIconURL = computed(() => (isMyAccount.value) ? walletManager.walletIconURL.value || "" : "")
const isHieroWallet = computed(() => walletManager.isHieroWallet.value)
const isAccountEditable = computed(() => isMyAccount.value && isHieroWallet.value
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

<style scoped>

div.page-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-left: 32px;
  margin-right: 32px;
}

span.my-account {
  display: flex;
  align-items: center;
  gap: 8px;
}

.my-account img {
  height: 32px;
}

div.text-secondary {
  color: var(--text-secondary);
}

</style>

