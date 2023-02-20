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
      <template v-slot:title>
        <span class="h-is-primary-title">Account </span>
        <span class="h-is-secondary-text">{{ normalizedAccountId ?? "" }}</span>
        <span v-if="accountChecksum" class="has-text-grey" style="font-size: 28px">-{{ accountChecksum }}</span>
        <span v-if="showContractVisible" id="showContractLink" class="is-inline-block ml-3">
          <router-link :to="contractRoute">
            <span class="h-is-property-text">Show associated contract</span>
          </router-link>
        </span>
        <div v-if="operatorNodeRoute" id="nodeLink" >
          <router-link :to="operatorNodeRoute">
            <span class="h-is-tertiary-text"> {{ 'Node ' + nodeId }} </span>
            <span class="h-is-tertiary-text has-text-grey"> {{ ' (' + accountInfo + ')' }} </span>
          </router-link>
        </div>
        <div v-else-if="ethereumAddress">
          <span class="has-text-grey h-is-tertiary-text"> {{ ethereumAddress }} </span>
        </div>
      </template>

      <template v-slot:content>

        <NotificationBanner v-if="notification" :message="notification"/>

        <div class="columns h-is-property-text">
          <div class="column">
            <Property id="balance">
              <template v-slot:name>{{ tokenBalances?.length ? 'Balances' : 'Balance' }}</template>
              <template v-slot:value>
                <div v-if="account" class="h-is-tertiary-text">
                  <HbarAmount v-bind:amount="hbarBalance" v-bind:show-extra="true" timestamp="0"/>
                </div>
                <div v-if="displayAllTokenLinks">
                  <router-link :to="{name: 'AccountBalances', params: {accountId: accountId}}">
                    Show all token balances
                  </router-link>
                </div>
                <div v-else>
                  <div v-for="b in tokenBalances ?? []" :key="b.token_id" class="h-is-tertiary-text">
                    <TokenAmount v-bind:amount="b.balance" v-bind:show-extra="true" v-bind:token-id="b.token_id"/>
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
            <span v-if="stakedAccountId">Staked to Account</span>
            <span v-else-if="stakedNodeId">Staked to Node</span>
            <span v-else>Staked to</span>
          </template>
          <template v-slot:value>
            <AccountLink v-if="stakedAccountId" :accountId="account.staked_account_id" v-bind:show-extra="true"/>
            <router-link v-else-if="stakedNodeRoute" :to="stakedNodeRoute">
              {{ account?.staked_node_id }} - {{ stakedNodeDescription }}
            </router-link>
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
            <BlobValue class="should-wrap" v-bind:base64="true" v-bind:blob-value="account?.memo"
                       v-bind:show-none="true"/>
          </template>
        </Property>

        <Property id="createTransaction">
          <template v-slot:name>Create Transaction</template>
          <template v-slot:value>
            <TransactionLink :transactionLoc="account?.created_timestamp"/>
          </template>
        </Property>

        <Property id="expiresAt">
          <template v-slot:name>Expires at</template>
          <template v-slot:value>
            <TimestampValue v-bind:show-none="true" v-bind:timestamp="account?.expiry_timestamp"/>
          </template>
        </Property>
        <Property id="autoRenewPeriod">
          <template v-slot:name>Auto Renew Period</template>
          <template v-slot:value>
            <DurationValue v-bind:number-value="account?.auto_renew_period"/>
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
            <KeyValue :account-id="normalizedAccountId" :key-bytes="account?.key?.key" :key-type="account?.key?._type"
                      :show-none="true"/>
          </template>
        </Property>

        <Property id="alias" :class="{'mb-0':account?.alias}">
          <template v-slot:name>Public-key-format Alias</template>
          <template v-slot:value>
            <AliasValue :alias-value="account?.alias"/>
          </template>
        </Property>

        <Property id="evmAddress">
          <template v-slot:name>Ethereum-format Alias</template>
          <template v-slot:value>
            <EthAddress v-if="ethereumAddress"
                        :address="ethereumAddress"
                        :show-none="true"/>
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

    <DashboardCard>
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
        <TransactionTable
            v-if="account"
            v-bind:controller="transactionTableController"
            v-bind:narrowed="true"
        />
      </template>
    </DashboardCard>

    <DashboardCard v-if="normalizedAccountId && availableAPI">
      <template v-slot:title>
        <span class="h-is-secondary-title">Recent Staking Rewards</span>
      </template>
      <template v-slot:content>
        <StakingRewardsTable :controller="rewardsTableController"/>
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
import {PathParam} from "@/utils/PathParam";
import Property from "@/components/Property.vue";
import NotificationBanner from "@/components/NotificationBanner.vue";
import EthAddress from "@/components/values/EthAddress.vue";
import StringValue from "@/components/values/StringValue.vue";
import {TransactionTableControllerXL} from "@/components/transaction/TransactionTableControllerXL";
import AccountLink from "@/components/values/AccountLink.vue";
import {AccountLoader} from "@/components/account/AccountLoader";
import {ContractLoader} from "@/components/contract/ContractLoader";
import TransactionFilterSelect from "@/components/transaction/TransactionFilterSelect.vue";
import router, {routeManager} from "@/router";
import TransactionLink from "@/components/values/TransactionLink.vue";
import {StakingRewardsTableController} from "@/components/staking/StakingRewardsTableController";
import StakingRewardsTable from "@/components/staking/StakingRewardsTable.vue";
import AliasValue from "@/components/values/AliasValue.vue";
import {NodeRegistry} from "@/components/node/NodeRegistry";

const MAX_TOKEN_BALANCES = 10

export default defineComponent({

  name: 'AccountDetails',

  components: {
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
    EthAddress,
    DurationValue,
    StringValue,
    StakingRewardsTable
  },

  props: {
    accountId: String,
    network: String
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    //
    // account
    //

    const accountLocator = computed(() => PathParam.parseAccountIdOrAliasOrEvmAddress(props.accountId))
    const accountLoader = new AccountLoader(accountLocator)
    onMounted(() => accountLoader.requestLoad())

    const notification = computed(() => {
      let result
      if (accountLoader.accountLocator.value === null) {
        result = "Invalid account ID: " + props.accountId
      } else if (accountLoader.got404.value) {
        result = "Account with ID " + accountLoader.accountLocator.value + " was not found"
      } else if (accountLoader.entity.value?.deleted === true) {
        result = "Account is deleted"
      } else {
        result = null
      }
      return result
    })

    //
    // TransactionTableController
    //
    const perPage = computed(() => isMediumScreen ? 10 : 5)
    const accountId = computed(() => accountLoader.entity.value?.account ?? null)
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

    const balanceCache = new BalanceCache(accountLoader.accountId, 10000)
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
    const contractLoader = new ContractLoader(accountLoader.accountId)
    onMounted(() => contractLoader.requestLoad())
    const showContractVisible = computed(() => {
      return contractLoader.entity.value != null
    })

    //
    // staking
    //
    const stakedNodeDescription = computed(() => NodeRegistry.getDescription(accountLoader.stakedNodeId))

    //
    // Rewards Table Controller
    //
    const rewardsTableController = new StakingRewardsTableController(
        router, accountLoader.accountId, perPage, "p2", "k2")
    onMounted(() => rewardsTableController.mount())
    onBeforeUnmount(() => rewardsTableController.unmount())

    const contractRoute = computed(() => {
      const accountId = accountLoader.accountId.value
      return accountId ? routeManager.makeRouteToContract(accountId) : null
    })

    const stakedNodeRoute = computed(() => {
      const stakedNodeId = accountLoader.stakedNodeId.value
      return stakedNodeId !== null ? routeManager.makeRouteToNode(stakedNodeId) : null
    })

    const operatorNodeRoute = computed(() => {
      const operatorNodeId = accountLoader.nodeId.value
      return operatorNodeId != null ? routeManager.makeRouteToNode(operatorNodeId) : null
    })

    return {
      isSmallScreen,
      isTouchDevice,
      transactionTableController,
      notification,
      account: accountLoader.entity,
      normalizedAccountId: accountLoader.accountId,
      accountChecksum: accountLoader.accountChecksum,
      accountInfo: accountLoader.accountInfo,
      nodeId: accountLoader.nodeId,
      ethereumAddress: accountLoader.ethereumAddress,
      balanceTimeStamp: balanceCache.balanceTimeStamp,
      hbarBalance: balanceCache.hbarBalance,
      tokenBalances: balanceCache.tokenBalances,
      balanceCache: balanceCache, // For testing purpose
      displayAllTokenLinks,
      elapsed,
      showContractVisible,
      stakePeriodStart: accountLoader.stakePeriodStart,
      stakedNodeId: accountLoader.stakedNodeId,
      stakedAccountId: accountLoader.stakedAccountId,
      stakedNodeDescription,
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