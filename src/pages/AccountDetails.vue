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

  <section :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}" class="section">

    <DashboardCard>
      <template v-if="!isInactiveEvmAddress" v-slot:title>
        <span class="h-is-primary-title">Account </span>
        <div class="h-is-tertiary-text mt-3" id="entityId">
          <div class="is-inline-block h-is-property-text has-text-weight-light" style="min-width: 115px">Account ID:</div>
          <span>{{ normalizedAccountId ?? "" }}</span>
          <span v-if="accountChecksum" class="has-text-grey">-{{ accountChecksum }}</span>
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

        <div v-if="!isMediumScreen && showContractVisible" id="showContractLink" class="is-inline-block mt-2">
          <router-link :to="contractRoute">
            <span class="h-is-property-text">Show associated contract</span>
          </router-link>
        </div>
      </template>
      <template v-else v-slot:title>
        <span class="h-is-primary-title">Inactive EVM Address</span>
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
        <div v-if="showContractVisible" id="showContractLink" class="is-inline-block ml-3">
          <router-link :to="contractRoute">
            <span class="h-is-property-text">Show associated contract</span>
          </router-link>
        </div>
      </template>

      <template v-slot:content>

        <NotificationBanner v-if="notification" :message="notification" :is-error="!isInactiveEvmAddress"/>

        <div class="columns h-is-property-text">
          <div class="column">
            <Property id="balance">
              <template v-slot:name>{{ tokenBalances?.length ? 'Balances' : 'Balance' }}</template>
              <template v-slot:value>
                <div v-if="account" class="h-is-tertiary-text">
                  <HbarAmount v-bind:amount="hbarBalance ?? undefined" v-bind:show-extra="true" timestamp="0"/>
                </div>
                <div v-else-if="isInactiveEvmAddress" class="h-is-tertiary-text">
                  <HbarAmount v-bind:amount="0" v-bind:show-extra="true" timestamp="0"/>
                </div>
                <div v-if="displayAllTokenLinks">
                  <router-link :to="{name: 'AccountBalances', params: {accountId: accountId}}">
                    Show all token balances
                  </router-link>
                </div>
                <div v-else>
                  <div v-for="b in tokenBalances ?? []" :key="b.token_id" class="h-is-tertiary-text">
                    <TokenAmount v-bind:amount="b.balance" v-bind:show-extra="true" v-bind:token-id="b.token_id ?? undefined"/>
                  </div>
                </div>
                <div v-if="elapsed && !isSmallScreen" class="has-text-grey has-text-right"> {{ elapsed }} ago</div>
              </template>
            </Property>
          </div>
          <div class="column">
            <div v-if="isSmallScreen && elapsed" class="has-text-right has-text-grey mt-1">
              {{ elapsed }} ago
            </div>
          </div>
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
            <BlobValue v-bind:base64="true" v-bind:blob-value="account?.memo ?? undefined" v-bind:show-none="true"/>
          </template>
        </Property>

        <Property id="createTransaction">
          <template v-slot:name>Create Transaction</template>
          <template v-slot:value>
            <TransactionLink :transactionLoc="account?.created_timestamp ?? undefined"/>
          </template>
        </Property>

        <Property id="expiresAt">
          <template v-slot:name>Expires at</template>
          <template v-slot:value>
            <TimestampValue v-bind:show-none="true" v-bind:timestamp="account?.expiry_timestamp ?? undefined"/>
          </template>
        </Property>
        <Property id="autoRenewPeriod">
          <template v-slot:name>Auto Renew Period</template>
          <template v-slot:value>
            <DurationValue v-if="false" v-bind:number-value="account?.auto_renew_period ?? undefined"/>
            <span v-else class="has-text-grey">Not yet enabled</span>
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

    <DashboardCard v-if="!isInactiveEvmAddress">
      <template v-slot:title>
        <p id="recentTransactions" class="h-is-secondary-title">Recent Transactions</p>
      </template>
      <template v-slot:control>
        <div class="is-flex is-align-items-flex-end">
          <PlayPauseButton v-bind:controller="transactionTableController"/>
          <TransactionFilterSelect v-bind:controller="transactionTableController"/>
        </div>
      </template>
      <template v-slot:content>
        <div id="recentTransactionsTable">
          <TransactionTable
              v-if="account"
              v-bind:controller="transactionTableController"
              v-bind:narrowed="true"
          />
        </div>
      </template>
    </DashboardCard>

    <ApproveAllowanceSection :account-id="normalizedAccountId ?? undefined" :showApproveDialog="showApproveDialog"/>

    <DashboardCard v-if="normalizedAccountId && availableAPI">
      <template v-slot:title>
        <span class="h-is-secondary-title">Recent Staking Rewards</span>
      </template>
      <template v-slot:content>
        <div id="recentRewardsTable">
          <StakingRewardsTable :controller="rewardsTableController"/>
        </div>
      </template>
    </DashboardCard>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted, watch} from 'vue';
import KeyValue from "@/components/values/KeyValue.vue";
import PlayPauseButton from "@/components/PlayPauseButton.vue";
import TransactionTable from "@/components/transaction/TransactionTable.vue";
import {Duration} from "@/utils/Duration";
import DurationValue from "@/components/values/DurationValue.vue";
import TimestampValue from "@/components/values/TimestampValue.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";
import TokenAmount from "@/components/values/TokenAmount.vue";
import BlobValue from "@/components/values/BlobValue.vue";
import {BalanceCache} from "@/components/account/BalanceCache";
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
import {NodeRegistry} from "@/components/node/NodeRegistry";
import EVMAddress from "@/components/values/EVMAddress.vue";
import ApproveAllowanceSection from "@/components/allowances/ApproveAllowanceSection.vue";

const MAX_TOKEN_BALANCES = 10

export default defineComponent({

  name: 'AccountDetails',

  components: {
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
    // TransactionTableController
    //
    const perPage = computed(() => isMediumScreen ? 10 : 5)
    const accountId = accountLocParser.accountId
    const transactionTableController = new TransactionTableControllerXL(
      router, accountId, perPage, true, "p1", "k1")

    /*
          vue   \   accountId |       null       |      not null     |
          state  \            |                  |                   |
          --------------------+------------------+-------------------+
          unmounted           |   ttc unmounted  |   ttc unmounted   |
          --------------------+------------------+-------------------+
          mounted             |   ttc unmounted  |    ttc mounted    |
          --------------------+------------------+-------------------+
     */

    let mounted = false
    onMounted(() => {
      mounted = true
      if (accountId.value !== null) {
        transactionTableController.mount()
      }
    })
    onBeforeUnmount(() => {
      mounted = false
      if (accountId.value !== null) {
        transactionTableController.unmount()
      }
    })
    watch(accountId, () => {
      if (mounted) {
        if (accountId.value !== null) {
          transactionTableController.mount()
        } else {
          transactionTableController.unmount()
        }
      }
    })

    //
    // balanceCache
    //

    const balanceCache = new BalanceCache(accountLocParser.accountId, 10000)
    onMounted(() => balanceCache.mounted.value = true)
    onBeforeUnmount(() => balanceCache.mounted.value = false)
    const displayAllTokenLinks = computed(() => {
      const tokenCount = balanceCache.tokenBalances.value?.length ?? 0
      return tokenCount > MAX_TOKEN_BALANCES
    })
    const elapsed = computed(() => {
          let result: string | null
          if (balanceCache.balanceTimeStamp.value) {
            const duration = Duration.decompose(new Date().getTime() / 1000 - Number.parseFloat(balanceCache.balanceTimeStamp.value))
            if (duration.minutes >= 2) {
              result = duration.minutes + "min"
            } else if (duration.minutes == 1) {
              result = "1min"
            } else {
              result = "just moments"
            }
          } else {
            result = null
          }
          return result
        }
    )

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
    const stakedNodeDescription = computed(() => NodeRegistry.getDescription(accountLocParser.stakedNodeId))

    const stakedNodeIcon = computed(() => {
      let result
      if (accountLocParser.stakedNodeId.value !== null) {
        result = NodeRegistry.isCouncilNode(accountLocParser.stakedNodeId) ? "fas fa-building" : "fas fa-users"
      } else {
        result = ""
      }
      return result
    })

    //
    // Rewards Table Controller
    //
    const rewardsTableController = new StakingRewardsTableController(
        router, accountLocParser.accountId, perPage, "p2", "k2")
    onMounted(() => rewardsTableController.mount())
    onBeforeUnmount(() => rewardsTableController.unmount())

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

    return {
      isSmallScreen,
      isMediumScreen,
      isTouchDevice,
      transactionTableController,
      notification: accountLocParser.errorNotification,
      isInactiveEvmAddress: accountLocParser.isInactiveEvmAddress,
      account: accountLocParser.accountInfo,
      normalizedAccountId: accountLocParser.accountId,
      accountChecksum: accountLocParser.accountChecksum,
      accountInfo: accountLocParser.accountDescription,
      nodeId: accountLocParser.nodeId,
      ethereumAddress: accountLocParser.ethereumAddress,
      balanceTimeStamp: balanceCache.balanceTimeStamp,
      hbarBalance: balanceCache.hbarBalance,
      tokenBalances: balanceCache.tokenBalances,
      balanceCache: balanceCache, // For testing purpose
      displayAllTokenLinks,
      elapsed,
      showContractVisible,
      stakePeriodStart: accountLocParser.stakePeriodStart,
      stakedNodeId: accountLocParser.stakedNodeId,
      stakedAccountId: accountLocParser.stakedAccountId,
      stakedNodeDescription,
      stakedNodeIcon,
      rewardsTableController,
      contractRoute,
      stakedNodeRoute,
      operatorNodeRoute,
      availableAPI: rewardsTableController.availableAPI
    }
  }
});

</script>

<style/>