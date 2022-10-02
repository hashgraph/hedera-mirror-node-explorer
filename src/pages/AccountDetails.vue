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

  <section class="section" :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}">

    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Account </span>
        <span class="h-is-secondary-text">{{ account?.account ?? "" }}</span>
        <span v-if="accountChecksum" class="has-text-grey" style="font-size: 28px">-{{ accountChecksum }}</span>
        <span v-if="showContractVisible" class="is-inline-block ml-3" id="showContractLink">
          <router-link :to="{name: 'ContractDetails', params: {contractId: accountId}}">
            <span class="h-is-property-text">Show associated contract</span>
          </router-link>
        </span>
        <template v-if="accountInfo">
          <router-link v-if="nodeId" :to="{name: 'NodeDetails', params: {nodeId: nodeId}}">
            <p class="h-is-tertiary-text"> {{ accountInfo }} </p>
          </router-link>
          <p v-else class="h-is-tertiary-text"> {{ accountInfo }} </p>
        </template>
      </template>

      <template v-slot:content>

        <NotificationBanner v-if="notification" :message="notification"/>

        <div class="columns h-is-property-text">
          <div class="column">
            <Property id="balance">
              <template v-slot:name>{{ tokenBalances?.length ? 'Balances' : 'Balance' }}</template>
              <template v-slot:value>
                <div v-if="account" class="h-is-tertiary-text"><HbarAmount v-bind:amount="hbarBalance" v-bind:show-extra="true"/></div>
                <div v-if="displayAllTokenLinks">
                  <router-link :to="{name: 'AccountBalances', params: {accountId: accountId}}">
                    Show all token balances
                  </router-link>
                </div>
                <div v-else>
                  <div v-for="b in tokenBalances ?? []" :key="b.token_id" class="h-is-tertiary-text">
                    <TokenAmount v-bind:amount="b.balance" v-bind:token-id="b.token_id" v-bind:show-extra="true"/>
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
        <div class="columns h-is-property-text">
          <div class="column">
            <Property id="alias" :class="{'mb-0':account?.alias}" :full-width="true">
              <template v-slot:name>Alias</template>
              <template v-slot:value>
                <AliasValue :alias-value="account?.alias"/>
              </template>
            </Property>
          </div>
        </div>
      </template>

      <template v-slot:leftContent>
              <Property v-if="account?.staked_account_id" id="stakedAccount">
                <template v-slot:name>Staked to Account</template>
                <template v-slot:value>
                  <AccountLink :accountId="account.staked_account_id" v-bind:show-extra="true"/>
                </template>
              </Property>
              <Property v-else id="stakedNode">
                <template v-slot:name>Staked to</template>
                <template v-slot:value>
                  <div v-if="account?.staked_node_id != null">
                    <router-link :to="{name: 'NodeDetails', params: {nodeId: account?.staked_node_id}}">
                      {{ stakedNodeDescription ?? "Node " +  account?.staked_node_id}}
                    </router-link>
                  </div>
                  <span v-else class="has-text-grey">None</span>
                </template>
              </Property>
              <Property id="stakePeriodStart">
                <template v-slot:name>Stake Period Started</template>
                <template v-slot:value>
                  <TimestampValue :timestamp="account?.stake_period_start" :show-none="true"/>
                </template>
              </Property>
              <Property id="declineReward" v-if="account?.staked_node_id != null">
                <template v-slot:name>Rewards</template>
                <template v-slot:value>
                  <StringValue :string-value="account?.decline_reward ? 'Declined' : 'Accepted'"/>
                </template>
              </Property>
            <Property id="memo">
              <template v-slot:name>Memo</template>
              <template v-slot:value>
                <BlobValue v-bind:blob-value="account?.memo" v-bind:show-none="true" v-bind:base64="true" class="should-wrap"/>
              </template>
            </Property>
            <Property id="createdAt">
              <template v-slot:name>Created at</template>
              <template v-slot:value>
                <TimestampValue v-bind:timestamp="account?.created_timestamp" v-bind:show-none="true" />
              </template>
            </Property>
            <Property id="expiresAt">
              <template v-slot:name>Expires at</template>
              <template v-slot:value>
                <TimestampValue v-bind:timestamp="account?.expiry_timestamp" v-bind:show-none="true" />
              </template>
            </Property>
            <Property id="autoRenewPeriod">
              <template v-slot:name>Auto Renew Period</template>
              <template v-slot:value>
                <DurationValue v-bind:number-value="account?.auto_renew_period"/>
              </template>
            </Property>
      </template>

      <template v-slot:rightContent>
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
            <Property id="key">
              <template v-slot:name>Key</template>
              <template v-slot:value>
                <KeyValue :key-bytes="account?.key?.key" :key-type="account?.key?._type" :show-none="true"/>
              </template>
            </Property>
            <Property id="ethereumAddress">
              <template v-slot:name>Ethereum Address</template>
              <template v-slot:value>
                <EthAddress v-if="ethereumAddress"
                            :address="ethereumAddress"
                            :show-none="true"/>
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
            v-bind:narrowed="true"
            v-bind:controller="transactionTableController"
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

import {computed, defineComponent, inject, onBeforeUnmount, onMounted, watch} from 'vue';
import KeyValue from "@/components/values/KeyValue.vue";
import PlayPauseButton from "@/utils/table/PlayPauseButton.vue";
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
import {TransactionTableController} from "@/components/transaction/TransactionTableController";
import AccountLink from "@/components/values/AccountLink.vue";
import {AccountLoader} from "@/components/account/AccountLoader";
import {ContractLoader} from "@/components/contract/ContractLoader";
import {NodeLoader} from "@/components/node/NodeLoader";
import AliasValue from "@/components/values/AliasValue.vue";
import TransactionFilterSelect from "@/components/transaction/TransactionFilterSelect.vue";
import {networkRegistry} from "@/schemas/NetworkRegistry";
import router from "@/router";

const MAX_TOKEN_BALANCES = 10

export default defineComponent({

  name: 'AccountDetails',

  components: {
    AliasValue,
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
    StringValue
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

    const accountChecksum = computed(() =>
        accountLoader.accountId.value ? networkRegistry.computeChecksum(
            accountLoader.accountId.value,
            router.currentRoute.value.params.network as string
        ) : null)

    const notification = computed(() => {
      let result
      if (accountLoader.accountLocator.value === null) {
        result =  "Invalid account ID: " + props.accountId
      } else if (accountLoader.got404.value) {
        result =  "Account with ID " + accountLoader.accountLocator.value + " was not found"
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
    const transactionTableController = new TransactionTableController(accountId, perPage, true)
    onMounted(() => transactionTableController.mounted.value = true)
    onBeforeUnmount(() => transactionTableController.mounted.value = false)

    //
    // transaction filter selection
    //

    const updateQuery = () => {
      router.replace({
        query: {type: transactionTableController.transactionType.value.toLowerCase()}
      })
    }
    watch(transactionTableController.transactionType, () => {
      updateQuery()
    })
    const transactionFilterFromRoute = computed(() => {
      return (router.currentRoute.value.query?.type as string ?? "").toUpperCase()
    })
    watch(transactionFilterFromRoute, () => {
      transactionTableController.transactionType.value = transactionFilterFromRoute.value
    })
    transactionTableController.transactionType.value = transactionFilterFromRoute.value

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
          let result: string|null
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
    const stakeNodeLoader = new NodeLoader(accountLoader.stakedNodeId)

    return {
      isSmallScreen,
      isTouchDevice,
      transactionTableController,
      notification,
      account: accountLoader.entity,
      normalizedAccountI: accountLoader.accountId,
      accountChecksum,
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
      stakedNodeDescription: stakeNodeLoader.nodeDescription
    }
  }
});

</script>

<style/>