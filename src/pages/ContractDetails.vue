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

  <section class="section" :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}">

    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Contract </span>
        <div class="h-is-tertiary-text mt-3" id="entityId">
          <div class="is-inline-block h-is-property-text has-text-weight-light" style="min-width: 115px">Contract ID:</div>
          <Copyable :content-to-copy="normalizedContractId ?? ''">
            <template v-slot:content>
              <span>{{ normalizedContractId ?? "" }}</span>
            </template>
          </Copyable>
          <span v-if="accountChecksum" class="has-text-grey h-is-smaller">-{{ accountChecksum }}</span>
        </div>
        <div v-if="ethereumAddress" id="evmAddress" class="h-is-tertiary-text mt-2" style="word-break: keep-all">
          <div class="is-inline-block h-is-property-text has-text-weight-light" style="min-width: 115px">EVM Address:</div>
          <div class="is-inline-block">
            <EVMAddress :show-id="false" :has-custom-font="true" :address="ethereumAddress"/>
          </div>
        </div>

        <div v-if="!isMediumScreen && accountRoute" id="showAccountLink" class="is-inline-block mt-2">
          <router-link :to="accountRoute">
            <span class="h-is-property-text">Show associated account</span>
          </router-link>
        </div>
      </template>

      <template v-slot:control v-if="isMediumScreen">
        <div v-if="contract && accountRoute" id="showAccountLink" class="is-inline-block ml-3">
          <router-link :to="accountRoute">
            <span class="h-is-property-text">Show associated account</span>
          </router-link>
        </div>
      </template>

      <template v-slot:content>
        <NotificationBanner v-if="notification" :message="notification"/>
      </template>

      <template v-slot:leftContent>
            <Property id="balance">
              <template v-slot:name>{{ tokens?.length ? 'Balances' : 'Balance' }}</template>
              <template v-slot:value>
                <div class="has-flex-direction-column">
                  <HbarAmount v-if="contract" :amount="balance" :show-extra="true" timestamp="0"/>
                  <div v-if="displayAllTokenLinks">
                    <router-link :to="{name: 'AccountBalances', params: {accountId: contractId}}">
                      See all token balances
                    </router-link>
                  </div>
                  <div v-else>
                    <div v-for="t in tokens ?? []" :key="t.token_id ?? undefined">
                      <TokenAmount :amount="BigInt(t.balance)" :show-extra="true" :token-id="t.token_id"/>
                    </div>
                  </div>
                </div>
              </template>
            </Property>
            <Property id="key">
              <template v-slot:name>Admin Key</template>
              <template v-slot:value>
                <KeyValue :key-bytes="contract?.admin_key?.key" :key-type="contract?.admin_key?._type" :show-none="true"/>
              </template>
            </Property>
            <Property id="memo">
              <template v-slot:name>Memo</template>
              <template v-slot:value>
                <BlobValue :blob-value="contract?.memo" :show-none="true" :base64="true" :show-base64-as-extra="true"/>
              </template>
            </Property>
            <Property id="createTransaction">
              <template v-slot:name>Create Transaction</template>
              <template v-slot:value>
                <TransactionLink :transactionLoc="contract?.created_timestamp ?? undefined"/>
              </template>
            </Property>
            <Property id="expiresAt">
              <template v-slot:name>
                <span>Expires at</span>
                <InfoTooltip label="Contract expiry is not turned on yet. Value in this field is not relevant."/>
              </template>
              <template v-slot:value>
                <TimestampValue v-bind:timestamp="contract?.expiration_timestamp" v-bind:show-none="true"/>
              </template>
            </Property>
            <Property id="autoRenewPeriod">
              <template v-slot:name>
                <span>Auto Renew Period</span>
                <InfoTooltip label="Contract auto-renew is not turned on yet. Value in this field is not relevant."/>
              </template>
              <template v-slot:value>
                <DurationValue v-bind:number-value="contract?.auto_renew_period ?? undefined"/>
              </template>
            </Property>
            <Property id="autoRenewAccount">
              <template v-slot:name>
                <span>Auto Renew Account</span>
                <InfoTooltip label="Contract auto-renew is not turned on yet. Value in this field is not relevant."/>
              </template>
              <template v-slot:value>
                <AccountLink :account-id="autoRenewAccount" :show-none="true" null-label="None"/>
              </template>
            </Property>
            <Property id="maxAutoAssociation">
              <template v-slot:name>Max. Auto. Association</template>
              <template v-slot:value>
                <StringValue :string-value="contract?.max_automatic_token_associations?.toString()"/>
              </template>
            </Property>
      </template>

      <template v-slot:rightContent>
            <Property id="obtainer">
              <template v-slot:name>Obtainer</template>
              <template v-slot:value>
                <AccountLink :account-id="obtainerId" :show-none="true" null-label="None"/>
              </template>
            </Property>
            <Property id="proxyAccount">
              <template v-slot:name>Proxy Account</template>
              <template v-slot:value>
                <AccountLink :account-id="proxyAccountId" :show-none="true" null-label="None"/>
              </template>
            </Property>
            <Property id="validFrom">
              <template v-slot:name>Valid from</template>
              <template v-slot:value>
                <TimestampValue :timestamp="contract?.timestamp?.from" :show-none="true"/>
              </template>
            </Property>
            <Property id="validUntil">
              <template v-slot:name>Valid until</template>
              <template v-slot:value>
                <TimestampValue :timestamp="contract?.timestamp?.to" :show-none="true"/>
              </template>
            </Property>
            <Property v-if="displayNonce" id="nonce">
              <template v-slot:name>Contract Nonce</template>
              <template v-slot:value>
                {{ contract?.nonce }}
              </template>
            </Property>
            <Property id="file">
              <template v-slot:name>File</template>
              <template v-slot:value>
                <StringValue :string-value="contract?.file_id"/>
              </template>
            </Property>

      </template>
    </DashboardCard>

    <ContractByteCodeSection :contract-analyzer="contractAnalyzer"/>

    <ContractResultsSection :contract-id="normalizedContractId ?? undefined"/>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted} from 'vue';
import KeyValue from "@/components/values/KeyValue.vue";
import AccountLink from "@/components/values/AccountLink.vue";
import TimestampValue from "@/components/values/TimestampValue.vue";
import DurationValue from "@/components/values/DurationValue.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";
import TokenAmount from "@/components/values/TokenAmount.vue";
import BlobValue from "@/components/values/BlobValue.vue";
import StringValue from "@/components/values/StringValue.vue";
import Footer from "@/components/Footer.vue";
import NotificationBanner from "@/components/NotificationBanner.vue";
import {EntityID} from "@/utils/EntityID";
import Property from "@/components/Property.vue";
import {ContractByIdCache} from "@/utils/cache/ContractByIdCache";
import {AccountLocParser} from "@/utils/parser/AccountLocParser";
import {networkRegistry} from "@/schemas/NetworkRegistry";
import router, {routeManager} from "@/router";
import TransactionLink from "@/components/values/TransactionLink.vue";
import EVMAddress from "@/components/values/EVMAddress.vue";
import ContractByteCodeSection from "@/components/contract/ContractByteCodeSection.vue";
import ContractResultsSection from "@/components/contracts/ContractResultsSection.vue";
import InfoTooltip from "@/components/InfoTooltip.vue";
import Copyable from "@/components/Copyable.vue";
import {ContractAnalyzer} from "@/utils/analyzer/ContractAnalyzer";

const MAX_TOKEN_BALANCES = 3

export default defineComponent({

  name: 'ContractDetails',

  components: {
    Copyable,
    ContractByteCodeSection,
    InfoTooltip,
    ContractResultsSection,
    EVMAddress,
    TransactionLink,
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
    KeyValue,
    StringValue
  },

  props: {
    contractId: String,
    network: String
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    //
    // basic computed's
    //

    const validEntityId = computed(() => {
      return props.contractId ? EntityID.parse(props.contractId, true) != null : false
    })
    const normalizedContractId = computed(() => {
      return props.contractId ? EntityID.normalize(props.contractId) : null
    })

    //
    // contract
    //

    const contractLookup = ContractByIdCache.instance.makeLookup(normalizedContractId)
    onMounted(() => contractLookup.mount())
    onBeforeUnmount(() => contractLookup.unmount())

    const accountLocParser = new AccountLocParser(normalizedContractId)
    onMounted(() => accountLocParser.mount())
    onBeforeUnmount(() => accountLocParser.unmount())

    const displayNonce = computed(() => contractLookup.entity.value?.nonce != undefined)

    const autoRenewAccount = computed(() => {
      return contractLookup.entity.value?.auto_renew_account ?? null
    })

    const obtainerId = computed(() => {
      return contractLookup.entity.value?.obtainer_id ?? null
    })

    const proxyAccountId = computed(() => {
      return contractLookup.entity.value?.proxy_account_id ?? null
    })

    const accountChecksum = computed(() =>
        accountLocParser.accountId.value ? networkRegistry.computeChecksum(
            accountLocParser.accountId.value,
            router.currentRoute.value.params.network as string
        ) : null)

    const displayAllTokenLinks = computed(() => accountLocParser.tokens.value ? accountLocParser.tokens.value.length > MAX_TOKEN_BALANCES : false)

    const notification = computed(() => {
      let result: string|null

      // const expiration = contractLoader.entity.value?.expiration_timestamp
      if (!validEntityId.value) {
        result = "Invalid contract ID: " + props.contractId
      } else if (contractLookup.entity.value == null) {
          if (contractLookup.isLoaded()) {
              result = "Contract with ID " + props.contractId + " was not found"
          } else {
              result = null
          }
      } else if (contractLookup.entity.value?.deleted === true) {
        result = "Contract is deleted"
      // to be re-activated after Feb 9th
      // } else if (expiration && Number.parseFloat(expiration) <= new Date().getTime() / 1000) {
      //   result = "Contract has expired and is in grace period"
      } else {
        result = null
      }
      return result
    })

    const accountRoute = computed(() => {
      return normalizedContractId.value !== null ?  routeManager.makeRouteToAccount(normalizedContractId.value) : null
    })

    const contractAnalyzer = new ContractAnalyzer(normalizedContractId)
    onMounted(() => contractAnalyzer.mount())
    onBeforeUnmount(() => contractAnalyzer.unmount())

    return {
      isSmallScreen,
      isMediumScreen,
      isTouchDevice,
      contract: contractLookup.entity,
      account: accountLocParser.accountInfo,
      balance: accountLocParser.balance,
      tokens: accountLocParser.tokens,
      ethereumAddress: accountLocParser.ethereumAddress,
      displayNonce,
      accountChecksum,
      displayAllTokenLinks,
      notification,
      autoRenewAccount: autoRenewAccount,
      obtainerId: obtainerId,
      proxyAccountId: proxyAccountId,
      normalizedContractId,
      accountRoute,
      contractAnalyzer
    }
  },
});

</script>

<style/>
