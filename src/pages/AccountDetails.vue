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

  <hr class="h-top-banner" style="margin: 0; height: 4px"/>

  <section class="section">

    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Account </span>
        <span class="h-is-secondary-text">{{ accountId }}</span>
        <span v-if="showContractVisible" class="ml-4" id="showContractLink">
          <router-link :to="{name: 'ContractDetails', params: {contractId: accountId}}">
            <span class="h-is-property-text has-text-grey">Associated contract</span>
          </router-link>
        </span>
        <p class="h-is-tertiary-text" v-if="accountInfo != null"> {{ accountInfo }} </p>
      </template>
      <template v-slot:table>

        <div class="columns h-is-property-text">
          <div class="column">

            <div class="columns">
              <div v-if="tokenBalances?.length" class="column is-one-third has-text-weight-light">
                Balances
              </div>
              <div v-else class="column is-one-third has-text-weight-light">
                Balance
              </div>
              <div class="column" id="balance">
                <div class="has-flex-direction-column h-is-tertiary-text">
                  <HbarAmount v-bind:amount="balance" v-bind:show-extra="true"/>

                  <div v-if="displayAllTokenLinks">
                    <router-link :to="{name: 'AccountBalances', params: {accountId: accountId}}">
                      See all token balances
                    </router-link>
                  </div>

                  <div v-else>
                    <div v-for="b in tokenBalances ?? []" :key="b.token_id">
                      <TokenAmount v-bind:amount="b.balance" v-bind:token-id="b.token_id"/>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
          <div v-if="!isTouchDevice && isSmallScreen" class="column">
            <div class="has-text-right  has-text-grey">
              <span v-if="elapsed">Balance information obtained {{ elapsed }} ago</span>
            </div>
          </div>
        </div>
        <br/>

        <div class="columns h-is-property-text">

          <div class="column">

            <div class="columns">
              <div class="column is-one-third has-text-weight-light">
                Key
              </div>
              <div v-if="account?.key != null" class="column" id="key">
                <KeyValue v-bind:key-bytes="account?.key?.key" v-bind:key-type="account?.key?._type"/>
              </div>
              <div v-else class="column has-text-grey">
                None
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-third has-text-weight-light">
                Memo
              </div>
              <div class="column should-wrap" id="memo">
                <BlobValue v-bind:blob-value="account?.memo" v-bind:show-none="true" v-bind:base64="true"/>
              </div>
            </div>

          </div>

          <div class="column has-text-left">

            <div class="columns">
              <div class="column is-one-third has-text-weight-light">
                Expires at
              </div>
              <div class="column" id="expiresAt">
                <TimestampValue v-bind:timestamp="account?.expiry_timestamp" v-bind:show-none="true" />
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-third has-text-weight-light">
                Auto Renew Period
              </div>
              <div class="column" id="autoRenewPeriod">
                {{ formatSeconds(account?.auto_renew_period) }}
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-third has-text-weight-light">
                Max. Auto. Association
              </div>
              <div class="column" id="maxAutoAssociation">
                {{ account?.max_automatic_token_associations ?? "" }}
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-third has-text-weight-light">
                Receiver Sig. Required
              </div>
              <div class="column" id="receiverSigRequired">
                {{ account?.receiver_sig_required ?? ""}}
              </div>
            </div>

          </div>

        </div>
        <br/>

        <div class="is-flex is-justify-content-space-between is-align-items-baseline" id="recentTransactions">
          <p class="h-is-tertiary-text">Recent Transactions</p>
          <PlayPauseButton v-model="cacheState"/>
        </div>

        <TransactionTable
            v-bind:narrowed="true"
            v-bind:nb-items="10"
            v-bind:accountIdFilter="accountId"
            v-model:cacheState="cacheState"
        />
      </template>
    </DashboardCard>

  </section>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeMount, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import axios from "axios";
import {AccountBalanceTransactions, BalancesResponse, ContractResponse} from "@/schemas/HederaSchemas";
import {operatorRegistry} from "@/schemas/OperatorRegistry";
import KeyValue from "@/components/values/KeyValue.vue";
import PlayPauseButton, {PlayPauseState} from "@/components/PlayPauseButton.vue";
import TransactionTable from "@/components/transaction/TransactionTable.vue";
import {Duration, formatSeconds} from "@/utils/Duration";
import TimestampValue from "@/components/values/TimestampValue.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";
import TokenAmount from "@/components/values/TokenAmount.vue";
import BlobValue from "@/components/values/BlobValue.vue";
import {BalanceCache} from "@/components/account/BalanceCache";

const MAX_TOKEN_BALANCES = 10

export default defineComponent({

  name: 'AccountDetails',

  components: {
    BlobValue,
    TokenAmount,
    HbarAmount,
    DashboardCard,
    TransactionTable,
    PlayPauseButton,
    TimestampValue,
    KeyValue
  },

  props: {
    accountId: String,
    network: String
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    const cacheState = ref<PlayPauseState>(PlayPauseState.Play)
    const account = ref<AccountBalanceTransactions|null>(null)

    let balanceResponse = ref<BalancesResponse|null>(null)

    const cache = new BalanceCache(props.accountId, 1, 60000)
    cache.responseDidChangeCB = () => {
      balanceResponse.value = cache.getEntity()
    }

    onBeforeMount(() => {
      fetchAccount()
      fetchContract()
    })

    watch(() => props.accountId, () => {
      fetchAccount()
      fetchContract()
      cache.setAccountId(props.accountId)
      cache.start()
    });

    onMounted(() => {
      cache.start()
    })

    onBeforeUnmount(() => {
      cache.stop()
    })

    const balanceTimeStamp = computed(() => {
      return balanceResponse.value?.timestamp ?? null
    })

    const balance = computed(() => {
      const balances = balanceResponse.value?.balances
      return (balances && balances.length > 0) ? balances[0].balance : null
    })

    const tokenBalances = computed(() => {
      const balances = balanceResponse.value?.balances
      return (balances && balances.length > 0) ? balances[0].tokens : null
    })

    const accountInfo = computed(() => {
      const entry = props.accountId ? operatorRegistry.lookup(props.accountId) : null
      return entry != null ? entry.getDescription() : null
    })

    const displayAllTokenLinks = computed(() => {
      const tokenCount = account.value?.balance?.tokens?.length ?? 0
      return tokenCount > MAX_TOKEN_BALANCES
    })

    const elapsed = computed(() => {
          let result
          if (balanceTimeStamp.value) {
            const duration = Duration.decompose(new Date().getTime() / 1000 - Number.parseFloat(balanceTimeStamp.value))
            if (duration.minutes >= 2) {
              result = duration.minutes + " minutes"
            } else if (duration.minutes == 1) {
              result = "1 minute"
            } else {
              result = "just moments"
            }
          } else {
            result = null
          }
          return result
        }
    )

    const fetchAccount = () => {
      const params = {} as {
        limit: 1
      }
      axios
          .get<AccountBalanceTransactions>("api/v1/accounts/" + props.accountId, { params: params})
          .then(response => account.value = response.data)
    }

    const showContractVisible = ref(false)
    const fetchContract = () => {
      showContractVisible.value = false
      axios
          .get<ContractResponse>("api/v1/contracts/" + props.accountId)
          .then(() => showContractVisible.value = true)
          .catch(() => null)
    }

    return {
      isSmallScreen,
      isTouchDevice,
      cacheState,
      account,
      balanceTimeStamp,
      balance,
      tokenBalances,
      accountInfo,
      displayAllTokenLinks,
      elapsed,
      showContractVisible,

      // From TimeUtils
      formatSeconds
    }
  }
});

</script>

<style/>