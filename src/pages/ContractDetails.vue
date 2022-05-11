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

  <section class="section" :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}">

    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Contract </span>
        <span class="h-is-secondary-text is-numeric mr-3">{{ contractId }}</span>
        <span class="is-inline-block">
          <router-link :to="{name: 'AccountDetails', params: {accountId: contractId}}">
            <span class="h-is-property-text has-text-grey">Associated account</span>
          </router-link>
        </span>
      </template>
      <template v-slot:table>

        <NotificationBanner v-if="notification" :message="notification"/>

        <div class="columns h-is-property-text">

          <div class="column">

            <div class="columns">
              <div class="column is-one-third has-text-weight-light">
                Balance
              </div>
              <div class="column" id="balance">
                <div class="has-flex-direction-column">
                  <HbarAmount v-bind:amount="account?.balance?.balance" v-bind:show-extra="true"/>

                  <div v-if="displayAllTokenLinks">
                    <router-link :to="{name: 'AccountBalances', params: {accountId: contractId}}">
                      See all token balances
                    </router-link>
                  </div>

                  <div v-else>
                    <div v-for="b in balances" :key="b.symbol">
                      <TokenAmount v-bind:amount="b.balance"/>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <div class="columns">
              <div class="column is-one-third has-text-weight-light">
                Key
              </div>
              <div class="column" id="key">
                <KeyValue
                    v-bind:key-bytes="contract?.admin_key?.key"
                    v-bind:key-type="contract?.admin_key?._type"
                    v-bind:show-none="true"/>
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-third has-text-weight-light">
                Memo
              </div>
              <div class="column should-wrap" id="memo">
                <BlobValue v-bind:blob-value="contract?.memo" v-bind:show-none="true" v-bind:base64="true"/>
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-third has-text-weight-light">
                Expires at
              </div>
              <div class="column" id="expiresAt">
                <TimestampValue v-bind:timestamp="contract?.expiration_timestamp" v-bind:show-none="true"/>
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-third has-text-weight-light">
                Auto Renew Period
              </div>
              <div class="column" id="autoRenewPeriod">
                {{ formatSeconds(contract?.auto_renew_period) }}
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-third has-text-weight-light">
                Code
              </div>
              <div  id="code">
                <div v-if="contract?.bytecode != null" class="column">
                <textarea v-model="contract.bytecode" readonly rows="4"
                          style="width:100%; font-family: novamonoregular,monospace"></textarea>
                </div>
                <div v-else class="column has-text-grey">
                  None
                </div>
              </div>
            </div>

          </div>

          <div class="column">

            <div class="columns">
              <div class="column is-one-third has-text-weight-light">
                Obtainer
              </div>
              <div class="column" id="obtainer">
                <AccountLink v-bind:account-id="obtainerId" v-bind:show-none="true"/>
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-third has-text-weight-light">
                Proxy Account
              </div>
              <div class="column" id="proxyAccount">
                <AccountLink v-bind:account-id="proxyAccountId" v-bind:show-none="true"/>
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-third has-text-weight-light">
                Valid from
              </div>
              <div class="column" id="validFrom">
                <TimestampValue v-bind:timestamp="contract?.timestamp?.from" v-bind:show-none="true"/>
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-third has-text-weight-light">
                Valid until
              </div>
              <div class="column" id="validUntil">
                <TimestampValue v-bind:timestamp="contract?.timestamp?.to" v-bind:show-none="true"/>
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-third has-text-weight-light">
                File
              </div>
              <div class="column" id="file">
                {{ contract?.file_id ?? "None" }}
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-third has-text-weight-light">
                Solidity
              </div>
              <div class="column" id="solidity">
                <HexaValue v-bind:byteString="formattedSolidity" v-bind:show-none="true"/>
              </div>
            </div>

          </div>

        </div>
        <br/>

        <div class="is-flex is-justify-content-space-between is-align-items-baseline">
          <p class="h-is-tertiary-text">Recent Transactions</p>
          <PlayPauseButton v-model="cacheState"/>
        </div>

        <ContractTransactionTable
            v-model:cacheState="cacheState"
            v-bind:contract-id="contractId"
            v-bind:nb-items="10"
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
import axios from "axios";
import {AccountBalanceTransactions, ContractResponse, TokenInfo} from "@/schemas/HederaSchemas";
import KeyValue from "@/components/values/KeyValue.vue";
import HexaValue from "@/components/values/HexaValue.vue";
import ContractTransactionTable from "@/components/contract/ContractTransactionTable.vue";
import PlayPauseButton, {PlayPauseState} from "@/components/PlayPauseButton.vue";
import {formatSeconds} from "@/utils/Duration";
import AccountLink from "@/components/values/AccountLink.vue";
import TimestampValue from "@/components/values/TimestampValue.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";
import TokenAmount from "@/components/values/TokenAmount.vue";
import BlobValue from "@/components/values/BlobValue.vue";
import Footer from "@/components/Footer.vue";
import NotificationBanner from "@/components/NotificationBanner.vue";

const MAX_TOKEN_BALANCES = 3

interface TokenSymbolBalance {
  symbol: string
  balance: number
}

export default defineComponent({

  name: 'ContractDetails',

  components: {
    NotificationBanner,
    Footer,
    BlobValue,
    HbarAmount,
    TokenAmount,
    DashboardCard,
    AccountLink,
    TimestampValue,
    PlayPauseButton,
    ContractTransactionTable,
    KeyValue,
    HexaValue
  },

  props: {
    contractId: String,
    network: String
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)
    let contract = ref(null as ContractResponse | null)
    let account = ref(null as AccountBalanceTransactions | null)
    let balances = ref([] as Array<TokenSymbolBalance>)
    let displayAllTokenLinks = ref(false)
    const cacheState = ref<PlayPauseState>(PlayPauseState.Play)

    const notification = computed(() => {
      let result
      if (contract.value?.deleted === true) {
        result = "Contract is deleted"
      } else {
        const expiration = contract.value?.expiration_timestamp
        if (expiration && Number.parseFloat(expiration) <= new Date().getTime() / 1000) {
          result = "Contract has expired and is in grace period"
        } else {
          result = null
        }
      }
      return result
    })

    onBeforeMount(() => {
      fetchContract()
    })

    watch(() => props.contractId, () => {
      fetchContract()
    });

    const fetchContract = () => {
      axios
          .get("api/v1/contracts/" + props.contractId)
          .then(response => {
            contract.value = response.data;
            axios
                .get("api/v1/accounts/" + props.contractId)
                .then(response => (processResponse(response.data)));
          });
    }

    const processResponse = (response: AccountBalanceTransactions) => {
      account.value = response;
      if (response.balance) {
        let nbTokens: number = response.balance.tokens.length;
        if (nbTokens) {

          if (nbTokens > MAX_TOKEN_BALANCES) {
            displayAllTokenLinks.value = true
          } else {
            for (let token of response.balance.tokens) {
              axios
                  .get("api/v1/tokens/" + token.token_id)
                  .then(response => (processTokenResponse(response.data, token.balance)));
            }
          }
        }
      }
    }

    const processTokenResponse = (info: TokenInfo, balance: number | undefined) => {
      if (info.symbol && balance) {
        const token: TokenSymbolBalance = {
          symbol: info.symbol,
          balance: balance
        }
        balances.value.push(token)
      }
    }

    const obtainerId = computed(() => {
      const result = contract.value?.obtainer_id
      return result === null ? undefined : result
    })

    const proxyAccountId = computed(() => {
      const result = contract.value?.proxy_account_id
      return result === null ? undefined : result
    })

    const formattedSolidity = computed(() => {
      let result: string

      const solidityAddress = contract.value?.solidity_address
      if (solidityAddress && solidityAddress.indexOf("0x") == 0) {
        // solidityAddress starts with 0x
        result = solidityAddress.substring(2)
      } else {
        result = solidityAddress ?? ""
      }

      return result
    })

    return {
      isSmallScreen,
      isTouchDevice,
      contract,
      account,
      balances,
      displayAllTokenLinks,
      cacheState,
      notification,
      obtainerId,
      proxyAccountId,
      formattedSolidity,

      processResponse,
      processTokenResponse,

      // From TimeUtils
      formatSeconds
    }
  },
});

</script>

<style/>