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

    <DashboardCard collapsible-key="accountDetails">
      <template v-if="!isInactiveEvmAddress" v-slot:title>
        <span class="h-is-primary-title">Account </span>
      </template>
      <template v-else v-slot:title>
          <span class="h-is-primary-title">Inactive EVM Address</span>
      </template>

      <template v-if="!isInactiveEvmAddress" v-slot:subtitle>
        <div class="h-is-tertiary-text mt-3" id="entityId">
          <div class="is-inline-block h-is-property-text has-text-weight-light" style="min-width: 115px">Account ID:</div>
          <Copyable :content-to-copy="normalizedAccountId ?? ''">
            <template v-slot:content>
              <span>{{ normalizedAccountId ?? "" }}</span>
            </template>
          </Copyable>
          <span v-if="accountChecksum" class="has-text-grey h-is-smaller">-{{ accountChecksum }}</span>
        </div>
        <div v-if="operatorNodeRoute" id="nodeLink" class="h-is-tertiary-text mt-2">
          <div class="is-inline-block h-is-property-text has-text-weight-light" style="min-width: 115px">Node:</div>
          <router-link :to="operatorNodeRoute">
            <span>{{ nodeId }} - {{ accountInfo }}</span>
          </router-link>
        </div>
        <div v-else-if="ethereumAddress" id="evmAddress" class="h-is-tertiary-text mt-2" style="word-break: keep-all">
          <div class="is-inline-block h-is-property-text has-text-weight-light" style="min-width: 115px">EVM Address:</div>
          <div class="is-inline-block">
            <EVMAddress :show-id="false" :has-custom-font="true" :address="ethereumAddress"/>
          </div>
        </div>

        <div v-if="!isMediumScreen && showContractVisible && contractRoute" id="showContractLink" class="is-inline-block mt-2">
          <router-link :to="contractRoute">
            <span class="h-is-property-text">Show associated contract</span>
          </router-link>
        </div>
      </template>
      <template v-else v-slot:subtitle>
        <div class="h-is-tertiary-text mt-3" id="entityId">
          <div class="is-inline-block h-is-property-text has-text-weight-light" style="min-width: 115px">Account ID:</div>
          <span class="has-text-grey">Assigned upon activation</span>
        </div>
        <div id="evmAddress" class="h-is-tertiary-text mt-2" style="word-break: keep-all">
          <div class="is-inline-block h-is-property-text has-text-weight-light" style="min-width: 115px">EVM Address:</div>
          <div class="is-inline-block">
            <EVMAddress :show-id="false" :has-custom-font="true" :address="accountId"/>
          </div>
        </div>

        <div v-if="!isMediumScreen && showContractVisible" id="showContractLink" class="is-inline-block mt-2">
          <router-link :to="contractRoute">
            <span class="h-is-property-text">Show associated contract</span>
          </router-link>
        </div>
      </template>

      <template v-slot:control v-if="isMediumScreen">
        <div v-if="showContractVisible && contractRoute" id="showContractLink" class="is-inline-block ml-3">
          <router-link :to="contractRoute">
            <span class="h-is-property-text">Show associated contract</span>
          </router-link>
        </div>
      </template>

      <template v-slot:content>
        <NotificationBanner v-if="notification" :message="notification" :is-error="!isInactiveEvmAddress"/>

        <div class="h-is-property-text">
            <Property id="balance" :full-width="isMediumScreen">
              <template v-slot:name>{{ balanceAnalyzer.tokenBalances.value.length > 0 ? 'Balances' : 'Balance' }}</template>
              <template v-slot:value>
                  <InlineBalancesValue :balance-analyzer="balanceAnalyzer"/>
              </template>
            </Property>
        </div>
      </template>

      <template v-slot:leftContent>
        <Property id="stakedTo">
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
        </Property>

        <Property id="pendingReward">
          <template v-slot:name>Pending Reward</template>
          <template v-slot:value>
            <HbarAmount :amount="account?.pending_reward" :show-extra="true" timestamp="0"/>
            <div v-if="stakePeriodStart" class="h-is-extra-text h-is-text-size-2">
              {{ "Period Started " + stakePeriodStart }}
            </div>
          </template>
        </Property>
        <Property v-if="account?.staked_node_id != null" id="declineReward">
          <template v-slot:name>Rewards</template>
          <template v-slot:value>
            <StringValue :string-value="account?.decline_reward ? 'Declined' : 'Accepted'"/>
          </template>
        </Property>
        <Property id="memo">
          <template v-slot:name>Memo</template>
          <template v-slot:value>
            <BlobValue v-bind:base64="true" v-bind:blob-value="account?.memo" v-bind:show-none="true" :show-base64-as-extra="true"/>
          </template>
        </Property>

        <Property id="createTransaction">
          <template v-slot:name>Create Transaction</template>
          <template v-slot:value>
            <TransactionLink :transactionLoc="account?.created_timestamp ?? undefined"/>
          </template>
        </Property>

        <Property id="expiresAt">
          <template v-slot:name>
            <span>Expires at</span>
            <InfoTooltip label="Account expiry is not turned on yet. Value in this field is not relevant."/>
          </template>
          <template v-slot:value>
            <TimestampValue v-bind:show-none="true" v-bind:timestamp="account?.expiry_timestamp"/>
          </template>
        </Property>
        <Property id="autoRenewPeriod">
          <template v-slot:name>
            <span>Auto Renew Period</span>
            <InfoTooltip label="Account auto-renew is not turned on yet. Value in this field is not relevant."/>
          </template>
          <template v-slot:value>
            <DurationValue v-bind:number-value="account?.auto_renew_period ?? undefined"/>
          </template>
        </Property>
        <Property id="maxAutoAssociation">
          <template v-slot:name>Max. Auto. Association</template>
          <template v-slot:value>
            <StringValue :string-value="account?.max_automatic_token_associations?.toString()"/>
          </template>
        </Property>
        <Property id="receiverSigRequired">
          <template v-slot:name>Receiver Sig. Required</template>
          <template v-slot:value>
            <StringValue :string-value="account?.receiver_sig_required?.toString()"/>
          </template>
        </Property>
      </template>

      <template v-slot:rightContent>
        <Property id="key">
          <template v-slot:name>Admin Key</template>
          <template v-slot:value>
            <KeyValue :account-id="normalizedAccountId ?? undefined" :key-bytes="account?.key?.key" :key-type="account?.key?._type"
                      :show-none="true"/>
          </template>
        </Property>

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

    <DashboardCard v-if="!isInactiveEvmAddress" collapsible-key="recentTransactions">
      <template v-slot:title>
        <p id="recentTransactions" class="h-is-secondary-title">Recent Account Operations</p>
      </template>
      <template v-slot:control>
          <div v-if="selectedTab === 0" class="is-flex is-align-items-flex-end">
              <PlayPauseButton :controller="transactionTableController"/>
              <TransactionFilterSelect :controller="transactionTableController"/>
          </div>
          <div v-else-if="selectedTab === 1" class="is-flex is-justify-content-end is-align-items-center">
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
              :tabs="tabLabels"
              @update:selected-tab="handleTabUpdate($event)"
              css-id="operations-tab"
          />

          <div v-if="selectedTab === 0" id="recentTransactionsTable">
              <TransactionTable v-if="account" :controller="transactionTableController" :narrowed="true"/>
          </div>

          <div v-else-if="selectedTab === 1" id="recentContractsTable">
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

    <ApproveAllowanceSection :account-id="normalizedAccountId ?? undefined" :showApproveDialog="showApproveDialog"/>

    <MirrorLink :network="network" entityUrl="accounts" :loc="accountId"/>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted, ref} from 'vue';
import KeyValue from "@/components/values/KeyValue.vue";
import PlayPauseButton from "@/components/PlayPauseButton.vue";
import TransactionTable from "@/components/transaction/TransactionTable.vue";
import DurationValue from "@/components/values/DurationValue.vue";
import TimestampValue from "@/components/values/TimestampValue.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";
import TokenAmount from "@/components/values/TokenAmount.vue";
import BlobValue from "@/components/values/BlobValue.vue";
import {BalanceAnalyzer} from "@/utils/analyzer/BalanceAnalyzer";
import Footer from "@/components/Footer.vue";
import Property from "@/components/Property.vue";
import NotificationBanner from "@/components/NotificationBanner.vue";
import StringValue from "@/components/values/StringValue.vue";
import {TransactionTableControllerXL} from "@/components/transaction/TransactionTableControllerXL";
import AccountLink from "@/components/values/AccountLink.vue";
import {AccountLocParser} from "@/utils/parser/AccountLocParser";
import {ContractByIdCache} from "@/utils/cache/ContractByIdCache";
import TransactionFilterSelect from "@/components/transaction/TransactionFilterSelect.vue";
import router, {routeManager} from "@/router";
import TransactionLink from "@/components/values/TransactionLink.vue";
import {StakingRewardsTableController} from "@/components/staking/StakingRewardsTableController";
import StakingRewardsTable from "@/components/staking/StakingRewardsTable.vue";
import AliasValue from "@/components/values/AliasValue.vue";
import {NodeAnalyzer} from "@/utils/analyzer/NodeAnalyzer";
import EVMAddress from "@/components/values/EVMAddress.vue";
import ApproveAllowanceSection from "@/components/allowances/ApproveAllowanceSection.vue";
import InfoTooltip from "@/components/InfoTooltip.vue";
import Copyable from "@/components/Copyable.vue";
import InlineBalancesValue from "@/components/values/InlineBalancesValue.vue";
import MirrorLink from "@/components/MirrorLink.vue";
import {TransactionType} from "@/schemas/HederaSchemas";
import {TransactionTableController} from "@/components/transaction/TransactionTableController";
import EmptyTable from "@/components/EmptyTable.vue";
import VerifiedContractsTable from "@/components/account/VerifiedContractsTable.vue";
import {AppStorage} from "@/AppStorage";
import Tabs from "@/components/Tabs.vue";
import {AccountVerifiedContractsController} from "@/components/contract/AccountVerifiedContractsController";
import AccountCreatedContractsTable from "@/components/account/AccountCreatedContractsTable.vue";

export default defineComponent({

  name: 'AccountDetails',

  components: {
    AccountCreatedContractsTable,
    VerifiedContractsTable,
    EmptyTable,
    Tabs,
    MirrorLink,
    InlineBalancesValue,
    Copyable,
    InfoTooltip,
    ApproveAllowanceSection,
    EVMAddress,
    AliasValue,
    TransactionLink,
    AccountLink,
    NotificationBanner,
    Property,
    TransactionFilterSelect,
    Footer,
    BlobValue,
    TokenAmount,
    HbarAmount,
    DashboardCard,
    TransactionTable,
    PlayPauseButton,
    TimestampValue,
    KeyValue,
    DurationValue,
    StringValue,
    StakingRewardsTable
  },

  props: {
    accountId: String,
    showApproveDialog: String,
    network: String,
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    //
    // account
    //
    const accountLocParser = new AccountLocParser(computed(() => props.accountId ?? null))
    onMounted(() => accountLocParser.mount())
    onBeforeUnmount(() => accountLocParser.unmount())

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
      return accountId ? routeManager.makeRouteToContract(accountId) : null
    })

    const stakedNodeRoute = computed(() => {
      const stakedNodeId = accountLocParser.stakedNodeId.value
      return stakedNodeId !== null ? routeManager.makeRouteToNode(stakedNodeId) : null
    })

    const operatorNodeRoute = computed(() => {
      const operatorNodeId = accountLocParser.nodeId.value
      return operatorNodeId != null ? routeManager.makeRouteToNode(operatorNodeId) : null
    })

    const selectedTab = ref(AppStorage.getAccountOperationTab() ?? 0)
    const tabLabels = ['Transactions', 'Created Contracts', 'Staking Rewards']
    const handleTabUpdate = (tab: number) => {
      selectedTab.value = tab
      AppStorage.setAccountOperationTab(tab)
    }
    const filterVerified = ref(false)

    //
    // Table controllers and cache for Recent Account Operations
    // These are mounted only when their respective table is mounted, i.e. when the corresponding tab is selected
    //
    const perPage = computed(() => isMediumScreen ? 10 : 5)
    const accountId = accountLocParser.accountId

    const transactionTableController = new TransactionTableControllerXL(
        router, accountId, perPage, true, "p1", "k1")

    const contractCreateTableController = new TransactionTableController(
        router, perPage, TransactionType.CONTRACTCREATEINSTANCE, "success", "p3", "k3", accountId)

    const verifiedContractsController = new AccountVerifiedContractsController(accountId)

    const rewardsTableController = new StakingRewardsTableController(
        router, accountLocParser.accountId, perPage, "p2", "k2")

    return {
      isSmallScreen,
      isMediumScreen,
      isTouchDevice,
      transactionTableController,
      contractCreateTableController,
      verifiedContractsController,
      loaded: verifiedContractsController.loaded,
      overflow: verifiedContractsController.overflow,
      notification: accountLocParser.errorNotification,
      isInactiveEvmAddress: accountLocParser.isInactiveEvmAddress,
      account: accountLocParser.accountInfo,
      normalizedAccountId: accountLocParser.accountId,
      accountChecksum: accountLocParser.accountChecksum,
      accountInfo: accountLocParser.accountDescription,
      nodeId: accountLocParser.nodeId,
      ethereumAddress: accountLocParser.ethereumAddress,
      balanceAnalyzer,
      showContractVisible,
      stakePeriodStart: accountLocParser.stakePeriodStart,
      stakedNodeId: accountLocParser.stakedNodeId,
      stakedAccountId: accountLocParser.stakedAccountId,
      stakedNodeDescription: stakedNodeAnalyzer.nodeDescription,
      stakedNodeIcon,
      rewardsTableController,
      contractRoute,
      stakedNodeRoute,
      operatorNodeRoute,
      availableAPI: rewardsTableController.availableAPI,
      selectedTab,
      tabLabels,
      handleTabUpdate,
      filterVerified,
    }
  }
});

</script>

<style/>