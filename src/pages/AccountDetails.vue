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
        <span class="h-is-secondary-text mr-3">{{ normalizedAccountId }}</span>
        <span v-if="showContractVisible" class="is-inline-block" id="showContractLink">
          <router-link :to="{name: 'ContractDetails', params: {contractId: accountId}}">
            <span class="h-is-property-text has-text-grey">Associated contract</span>
          </router-link>
        </span>
        <p class="h-is-tertiary-text" v-if="accountInfo != null"> {{ accountInfo }} </p>
      </template>

      <template v-slot:table>

        <div class="columns h-is-property-text">
          <div class="column">
            <Property :id="'balance'">
              <template v-slot:name>{{ tokenBalances?.length ? 'Balances' : 'Balance' }}</template>
              <template v-slot:value>
                <div class="h-is-tertiary-text"><HbarAmount v-bind:amount="balance" v-bind:show-extra="true"/></div>
                <div v-if="displayAllTokenLinks">
                  <router-link :to="{name: 'AccountBalances', params: {accountId: accountId}}">
                    See all token balances
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
          <div v-if="isSmallScreen && elapsed" class="column has-text-right  has-text-grey mt-1">
              {{ elapsed }} ago
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
                {{ formatSeconds(account?.auto_renew_period) }}
              </template>
            </Property>
            <Property :id="'maxAutoAssociation'">
              <template v-slot:name>Max. Auto. Association</template>
              <template v-slot:value>
                {{ account?.max_automatic_token_associations ?? "" }}
              </template>
            </Property>
            <Property :id="'receiverSigRequired'">
              <template v-slot:name>Receiver Sig. Required</template>
              <template v-slot:value>
                {{ account?.receiver_sig_required ?? ""}}
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
            v-bind:narrowed="true"
            v-bind:nb-items="10"
            v-bind:accountIdFilter="accountId"
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
import {Duration, formatSeconds} from "@/utils/Duration";
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
import {makeEthAddressForAccount} from "@/schemas/HederaUtils";
import EthAddress from "@/components/values/EthAddress.vue";
import HexaValue from "@/components/values/HexaValue.vue";
import base32Decode from "base32-decode";
import {byteToHex} from "@/utils/B64Utils";

const MAX_TOKEN_BALANCES = 10

export default defineComponent({

  name: 'AccountDetails',

  components: {
    HexaValue,
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
    EthAddress
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

    const router = useRouter()
    const route = useRoute()
    const typeQuery = (route.query?.type as string ?? "").toUpperCase()

    const selectedTransactionType = ref<TransactionOption>(
        (Object.keys(TransactionType).indexOf(typeQuery) >= 0)
            ? typeQuery as TransactionOption
            : ""
    )

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

    const normalizedAccountId = computed(() => {
      return props.accountId ? EntityID.normalize(props.accountId) : props.accountId
    })

    const accountInfo = computed(() => {
      const entry = normalizedAccountId.value ? operatorRegistry.lookup(normalizedAccountId.value) : null
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

    const ethereumAddress = computed(() => {
      return account.value !== null ? makeEthAddressForAccount(account.value) : null
    })

    const aliasByteString = computed(() => {
      const alias = account.value?.alias
      return alias ? byteToHex(new Uint8Array(base32Decode(alias, 'RFC4648'))) : null
    })

    return {
      isSmallScreen,
      isTouchDevice,
      cacheState,
      selectedTransactionType,
      account,
      normalizedAccountId,
      balanceTimeStamp,
      balance,
      tokenBalances,
      accountInfo,
      displayAllTokenLinks,
      elapsed,
      showContractVisible,
      ethereumAddress,
      aliasByteString,

      // From TimeUtils
      formatSeconds
    }
  }
});

</script>

<style/>