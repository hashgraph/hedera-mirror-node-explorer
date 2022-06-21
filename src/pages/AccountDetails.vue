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
        <span class="h-is-primary-title">Account </span>
        <span class="h-is-secondary-text mr-3">{{ account ? normalizedAccountId : "" }}</span>
        <span v-if="showContractVisible" class="is-inline-block" id="showContractLink">
          <router-link :to="{name: 'ContractDetails', params: {contractId: accountId}}">
            <span class="h-is-property-text">Show associated contract</span>
          </router-link>
        </span>
        <router-link v-if="accountInfo != null" :to="{name: 'NodeDetails', params: {nodeId: nodeId}}">
          <p class="h-is-tertiary-text"> {{ accountInfo }} </p>
        </router-link>
      </template>

      <template v-slot:table>

        <NotificationBanner v-if="notification" :message="notification"/>

        <div class="columns h-is-property-text">
          <div class="column">
            <Property :id="'balance'">
              <template v-slot:name>{{ tokenBalances?.length ? 'Balances' : 'Balance' }}</template>
              <template v-slot:value>
                <div v-if="account" class="h-is-tertiary-text"><HbarAmount v-bind:amount="balance" v-bind:show-extra="true"/></div>
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
            <div v-if="isSmallScreen && elapsed" class="has-text-right  has-text-grey mt-1">
              {{ elapsed }} ago
            </div>
          </div>
        </div>
        <br/>

        <div class="columns h-is-property-text">

          <div class="column">
            <Property :id="'key'">
              <template v-slot:name>Key</template>
              <template v-slot:value>
                <KeyValue :key-bytes="account?.key?.key" :key-type="account?.key?._type" :show-none="true"/>
              </template>
            </Property>
            <Property :id="'memo'">
              <template v-slot:name>Memo</template>
              <template v-slot:value>
                <BlobValue v-bind:blob-value="account?.memo" v-bind:show-none="true" v-bind:base64="true" class="should-wrap"/>
              </template>
            </Property>
            <Property :id="'alias'">
              <template v-slot:name>Alias</template>
              <template v-slot:value>
                <HexaValue v-bind:byte-string="aliasByteString" v-bind:show-none="true"/>
              </template>
            </Property>
            <Property :id="'expiresAt'">
              <template v-slot:name>Expires at</template>
              <template v-slot:value>
                <TimestampValue v-bind:timestamp="account?.expiry_timestamp" v-bind:show-none="true" />
              </template>
            </Property>
          </div>

          <div class="column">
            <Property :id="'autoRenewPeriod'">
              <template v-slot:name>Auto Renew Period</template>
              <template v-slot:value>
                <DurationValue v-bind:number-value="account?.auto_renew_period"/>
              </template>
            </Property>
            <Property :id="'maxAutoAssociation'">
              <template v-slot:name>Max. Auto. Association</template>
              <template v-slot:value>
                <StringValue :string-value="account?.max_automatic_token_associations?.toString()"/>
              </template>
            </Property>
            <Property :id="'receiverSigRequired'">
              <template v-slot:name>Receiver Sig. Required</template>
              <template v-slot:value>
                <StringValue :string-value="account?.receiver_sig_required?.toString()"/>
              </template>
            </Property>
            <Property :id="'ethereumAddress'">
              <template v-slot:name>ERC20 Address</template>
              <template v-slot:value>
                <EthAddress v-if="ethereumAddress"
                            :address="ethereumAddress"
                            :show-none="true"/>
              </template>
            </Property>
          </div>

        </div>
        <br/>

        <div class="is-flex is-align-items-center is-justify-content-space-between" id="recentTransactions">
          <p class="h-is-tertiary-text">Recent Transactions</p>
          <div class="is-flex is-align-items-flex-end">
            <PlayPauseButton v-model="cacheState"/>
            <TransactionTypeSelect v-model="selectedTransactionType"/>
          </div>
        </div>

        <TransactionTable
            v-if="account"
            v-bind:narrowed="true"
            v-bind:nb-items="10"
            v-bind:accountIdFilter="normalizedAccountId"
            v-bind:transactionTypeFilter="selectedTransactionType"
            v-model:cacheState="cacheState"
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

import {computed, defineComponent, inject, onBeforeMount, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import axios from "axios";
import {AccountBalanceTransactions, BalancesResponse, ContractResponse, TransactionType} from "@/schemas/HederaSchemas";
import {operatorRegistry} from "@/schemas/OperatorRegistry";
import KeyValue from "@/components/values/KeyValue.vue";
import PlayPauseButton, {PlayPauseState} from "@/components/PlayPauseButton.vue";
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
import TransactionTypeSelect, {TransactionOption} from "@/components/transaction/TransactionTypeSelect.vue";
import {useRoute, useRouter} from "vue-router";
import {EntityID} from "@/utils/EntityID";
import Property from "@/components/Property.vue";
import NotificationBanner from "@/components/NotificationBanner.vue";
import {makeEthAddressForAccount} from "@/schemas/HederaUtils";
import EthAddress from "@/components/values/EthAddress.vue";
import HexaValue from "@/components/values/HexaValue.vue";
import StringValue from "@/components/values/StringValue.vue";
import {base32ToAlias, byteToHex} from "@/utils/B64Utils";

const MAX_TOKEN_BALANCES = 10

export default defineComponent({

  name: 'AccountDetails',

  components: {
    HexaValue,
    NotificationBanner,
    Property,
    TransactionTypeSelect,
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
    const isTouchDevice = inject('isTouchDevice', false)

    const cacheState = ref<PlayPauseState>(PlayPauseState.Play)
    const account = ref<AccountBalanceTransactions|null>(null)
    const got404 = ref(false)

    const router = useRouter()
    const route = useRoute()
    const typeQuery = (route.query?.type as string ?? "").toUpperCase()

    const selectedTransactionType = ref<TransactionOption>(
        (Object.keys(TransactionType).indexOf(typeQuery) >= 0)
            ? typeQuery as TransactionOption
            : ""
    )

    const validEntityId = computed(() => {
      return props.accountId ? EntityID.parse(props.accountId, true) != null : false
    })

    const normalizedAccountId = computed(() => {
      return props.accountId ? EntityID.normalize(props.accountId) : props.accountId
    })

    const accountInfo = computed(() => {
      return normalizedAccountId.value ? operatorRegistry.makeDescription(normalizedAccountId.value) : null
    })

    const nodeId = computed(() => {
      return normalizedAccountId.value ? operatorRegistry.lookup(normalizedAccountId.value)?.nodeId : null
    })

    const updateQuery = () => {
      router.replace({
        query: {type: selectedTransactionType.value.toLowerCase()}
      })
    }

    updateQuery()
    watch(selectedTransactionType, () => {
      updateQuery()
    })

    let balanceResponse = ref<BalancesResponse|null>(null)

    const cache = new BalanceCache(normalizedAccountId.value, 1, 60000)
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
      if (validEntityId.value) {
        cache.setAccountId(normalizedAccountId.value)
        cache.start()
      } else {
        cache.stop()
      }
    });

    onMounted(() => {
      if (validEntityId.value) {
        cache.start()
      }
    })

    onBeforeUnmount(() => {
      cache.stop()
    })

    const notification = computed(() => {
      let result
      if (!validEntityId.value) {
        result =  "Invalid account ID: " + props.accountId
      } else if (got404.value) {
        result =  "Account with ID " + props.accountId + " was not found"
      } else {
        result = null
      }
      return result
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

    const displayAllTokenLinks = computed(() => {
      const tokenCount = tokenBalances.value?.length ?? 0
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
      account.value = null
      got404.value = false
      if (validEntityId.value) {
        axios
            .get<AccountBalanceTransactions>("api/v1/accounts/" + normalizedAccountId.value, { params: params})
            .then(response => account.value = response.data)
            .catch(reason => {
              if(axios.isAxiosError(reason) && reason?.request?.status === 404) {
                got404.value = true
              }
            })
      }
    }

    const showContractVisible = ref(false)

    const fetchContract = () => {
      showContractVisible.value = false
      if (validEntityId.value) {
        axios
            .get<ContractResponse>("api/v1/contracts/" + normalizedAccountId.value)
            .then(() => showContractVisible.value = true)
            .catch(() => null)
      }
    }

    const ethereumAddress = computed(() => {
      return account.value !== null ? makeEthAddressForAccount(account.value) : null
    })

    const aliasByteString = computed(() => {
      const alias = account.value?.alias
      return alias ? byteToHex(new Uint8Array(base32ToAlias(alias))) : null
    })

    return {
      isSmallScreen,
      isTouchDevice,
      cacheState,
      selectedTransactionType,
      account,
      notification,
      validEntityId,
      normalizedAccountId,
      balanceTimeStamp,
      balance,
      tokenBalances,
      accountInfo,
      nodeId,
      displayAllTokenLinks,
      elapsed,
      showContractVisible,
      ethereumAddress,
      aliasByteString
    }
  }
});

</script>

<style/>