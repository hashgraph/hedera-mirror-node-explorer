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
        <span class="h-is-secondary-text is-numeric mr-3">{{ contract ? normalizedContractId : "" }}</span>
        <span v-if="contract" class="is-inline-block">
          <router-link :to="{name: 'AccountDetails', params: {accountId: normalizedContractId}}">
            <span class="h-is-property-text">Show associated account</span>
          </router-link>
        </span>
      </template>
      <template v-slot:table>

        <NotificationBanner v-if="notification" :message="notification"/>

        <div class="columns h-is-property-text">

          <div class="column">
            <Property :id="'balance'">
              <template v-slot:name>{{ tokens?.length ? 'Balances' : 'Balance' }}</template>
              <template v-slot:value>
                <div class="has-flex-direction-column">
                  <HbarAmount v-if="contract" :amount="balance" :show-extra="true"/>
                  <div v-if="displayAllTokenLinks">
                    <router-link :to="{name: 'AccountBalances', params: {accountId: contractId}}">
                      See all token balances
                    </router-link>
                  </div>
                  <div v-else>
                    <div v-for="t in tokens" :key="t.token_id">
                      <TokenAmount :amount="t.balance" :token-id="t.token_id" :show-extra="true"/>
                    </div>
                  </div>
                </div>
              </template>
            </Property>
            <Property :id="'key'">
              <template v-slot:name>Key</template>
              <template v-slot:value>
                <KeyValue :key-bytes="contract?.admin_key?.key" :key-type="contract?.admin_key?._type" :show-none="true"/>
              </template>
            </Property>
            <Property :id="'memo'">
              <template v-slot:name>Memo</template>
              <template v-slot:value>
                <BlobValue :blob-value="contract?.memo" :show-none="true" :base64="true" class="should-wrap"/>
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
                <TimestampValue v-bind:timestamp="contract?.expiration_timestamp" v-bind:show-none="true"/>
              </template>
            </Property>
            <Property :id="'autoRenewPeriod'">
              <template v-slot:name>Auto Renew Period</template>
              <template v-slot:value>
                <DurationValue v-bind:number-value="contract?.auto_renew_period"/>
              </template>
            </Property>
            <Property :id="'code'">
              <template v-slot:name>Code</template>
              <template v-slot:value>
                <ByteCodeValue :byte-code="contract?.bytecode"/>
              </template>
            </Property>
          </div>

          <div class="column">
            <Property :id="'obtainer'">
              <template v-slot:name>Obtainer</template>
              <template v-slot:value>
                <AccountLink :account-id="obtainerId" :show-none="true"/>
              </template>
            </Property>
            <Property :id="'proxyAccount'">
              <template v-slot:name>Proxy Account</template>
              <template v-slot:value>
                <AccountLink :account-id="proxyAccountId" :show-none="true"/>
              </template>
            </Property>
            <Property :id="'validFrom'">
              <template v-slot:name>Valid from</template>
              <template v-slot:value>
                <TimestampValue :timestamp="contract?.timestamp?.from" :show-none="true"/>
              </template>
            </Property>
            <Property :id="'validUntil'">
              <template v-slot:name>Valid until</template>
              <template v-slot:value>
                <TimestampValue :timestamp="contract?.timestamp?.to" :show-none="true"/>
              </template>
            </Property>
            <Property :id="'file'">
              <template v-slot:name>File</template>
              <template v-slot:value>
                <StringValue :string-value="contract?.file_id"/>
              </template>
            </Property>
            <Property :id="'solidity'">
              <template v-slot:name>Solidity</template>
              <template v-slot:value>
                <HexaValue :byteString="formattedSolidity" :show-none="true"/>
              </template>
            </Property>
            <Property :id="'evmAddress'">
              <template v-slot:name>EVM Address</template>
              <template v-slot:value>
                <HexaValue :byte-string="contract?.evm_address" :show-none="true"/>
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

        <div class="is-flex is-justify-content-space-between is-align-items-baseline">
          <p class="h-is-tertiary-text">Recent Transactions</p>
          <PlayPauseButton v-model="cacheState"/>
        </div>

        <ContractTransactionTable
            v-if="contract"
            v-model:cacheState="cacheState"
            v-bind:contract-id="normalizedContractId"
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
import {AccountBalanceTransactions, ContractResponse} from "@/schemas/HederaSchemas";
import KeyValue from "@/components/values/KeyValue.vue";
import HexaValue from "@/components/values/HexaValue.vue";
import ContractTransactionTable from "@/components/contract/ContractTransactionTable.vue";
import PlayPauseButton, {PlayPauseState} from "@/components/PlayPauseButton.vue";
import AccountLink from "@/components/values/AccountLink.vue";
import TimestampValue from "@/components/values/TimestampValue.vue";
import DurationValue from "@/components/values/DurationValue.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";
import TokenAmount from "@/components/values/TokenAmount.vue";
import BlobValue from "@/components/values/BlobValue.vue";
import StringValue from "@/components/values/StringValue.vue";
import ByteCodeValue from "@/components/values/ByteCodeValue.vue";
import Footer from "@/components/Footer.vue";
import NotificationBanner from "@/components/NotificationBanner.vue";
import {EntityID} from "@/utils/EntityID";
import Property from "@/components/Property.vue";
import {makeEthAddressForAccount} from "@/schemas/HederaUtils";
import EthAddress from "@/components/values/EthAddress.vue";
import {base32ToAlias, byteToHex} from "@/utils/B64Utils";

const MAX_TOKEN_BALANCES = 3

export default defineComponent({

  name: 'ContractDetails',

  components: {
    ByteCodeValue,
    Property,
    NotificationBanner,
    Footer,
    BlobValue,
    HbarAmount,
    TokenAmount,
    DashboardCard,
    AccountLink,
    TimestampValue,
    DurationValue,
    PlayPauseButton,
    ContractTransactionTable,
    KeyValue,
    HexaValue,
    StringValue,
    EthAddress
  },

  props: {
    contractId: String,
    network: String
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)
    const contract = ref<ContractResponse | null>(null)
    const account = ref<AccountBalanceTransactions | null>(null)
    const balance = computed(() => account.value?.balance?.balance)
    const tokens = computed(() => account.value?.balance?.tokens)
    const displayAllTokenLinks = computed(() => tokens.value ? tokens.value.length > MAX_TOKEN_BALANCES : false)
    const cacheState = ref<PlayPauseState>(PlayPauseState.Play)

    const got404 = ref(false)
    const validEntityId = computed(() => {
      return props.contractId ? EntityID.parse(props.contractId, true) != null : false
    })
    const normalizedContractId = computed(() => {
      // return props.contractId ? EntityID.normalize(props.contractId) : props.contractId
      return contract.value?.contract_id ? EntityID.normalize(contract.value.contract_id) : null
    })

    const notification = computed(() => {
      const expiration = contract.value?.expiration_timestamp
      let result

      if (!validEntityId.value) {
        result = "Invalid contract ID: " + props.contractId
      } else if (got404.value) {
        result = "Contract with ID " + props.contractId + " was not found"
      } else if (contract.value?.deleted === true) {
        result = "Contract is deleted"
      } else if (expiration && Number.parseFloat(expiration) <= new Date().getTime() / 1000) {
        result = "Contract has expired and is in grace period"
      } else {
        result = null
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
      contract.value = null
      got404.value = false
      if (validEntityId.value) {
        axios
            .get("api/v1/contracts/" + props.contractId)
            .then(response => {
              contract.value = response.data;
              axios
                  .get("api/v1/accounts/" + normalizedContractId.value)
                  .then(response => {
                    account.value = response.data
                  })
            })
            .catch(reason => {
              if (axios.isAxiosError(reason) && reason?.request?.status === 404) {
                got404.value = true
              }
            })
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
      contract,
      account,
      balance,
      tokens,
      displayAllTokenLinks,
      cacheState,
      notification,
      obtainerId,
      proxyAccountId,
      formattedSolidity,
      normalizedContractId,
      ethereumAddress,
      aliasByteString
    }
  },
});

</script>

<style/>