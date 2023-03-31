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
          <span>{{ normalizedContractId ?? "" }}</span>
          <span v-if="accountChecksum" class="has-text-grey">-{{ accountChecksum }}</span>
        </div>
        <div v-if="ethereumAddress" id="evmAddress" class="h-is-tertiary-text mt-2" style="word-break: keep-all">
          <div class="is-inline-block h-is-property-text has-text-weight-light" style="min-width: 115px">EVM Address:</div>
          <div class="is-inline-block">
            <EVMAddress :show-id="false" :has-custom-font="true" :address="ethereumAddress"/>
          </div>
        </div>

        <div v-if="!isMediumScreen && contract" id="showAccountLink" class="is-inline-block mt-2">
          <router-link :to="accountRoute">
            <span class="h-is-property-text">Show associated account</span>
          </router-link>
        </div>
      </template>

      <template v-slot:control v-if="isMediumScreen">
        <div v-if="contract" id="showAccountLink" class="is-inline-block ml-3">
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
                    <div v-for="t in tokens" :key="t.token_id">
                      <TokenAmount :amount="t.balance" :show-extra="true" :token-id="t.token_id"/>
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
                <BlobValue :blob-value="contract?.memo" :show-none="true" :base64="true"/>
              </template>
            </Property>
            <Property id="createTransaction">
              <template v-slot:name>Create Transaction</template>
              <template v-slot:value>
                <TransactionLink :transactionLoc="contract?.created_timestamp"/>
              </template>
            </Property>
            <Property id="expiresAt">
              <template v-slot:name>Expires at</template>
              <template v-slot:value>
                <TimestampValue v-bind:timestamp="contract?.expiration_timestamp" v-bind:show-none="true"/>
              </template>
            </Property>
            <Property id="autoRenewPeriod">
              <template v-slot:name>Auto Renew Period</template>
              <template v-slot:value>
                <DurationValue v-bind:number-value="contract?.auto_renew_period"/>
              </template>
            </Property>
            <Property id="autoRenewAccount">
              <template v-slot:name>Auto Renew Account</template>
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
            <Property id="code">
              <template v-slot:name>Initcode</template>
              <template v-slot:value>
                <ByteCodeValue :byte-code="contract?.bytecode"/>
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
            <Property id="file">
              <template v-slot:name>File</template>
              <template v-slot:value>
                <StringValue :string-value="contract?.file_id"/>
              </template>
            </Property>

      </template>
    </DashboardCard>

    <DashboardCard>
      <template v-slot:title>
        <p class="h-is-secondary-title">Recent Transactions</p>
      </template>

      <template v-slot:control>
        <div class="is-flex is-align-items-flex-end">
          <PlayPauseButton v-bind:controller="transactionTableController"/>
          <TransactionFilterSelect v-model:controller="transactionTableController"/>
        </div>
      </template>

      <template v-slot:content>
        <ContractTransactionTable
            v-if="contract"
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

import {computed, defineComponent, inject, onBeforeUnmount, onMounted} from 'vue';
import KeyValue from "@/components/values/KeyValue.vue";
import ContractTransactionTable from "@/components/contract/ContractTransactionTable.vue";
import PlayPauseButton from "@/components/PlayPauseButton.vue";
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
import {ContractByIdCache} from "@/utils/cache/ContractByIdCache";
import {AccountLoader} from "@/components/account/AccountLoader";
import {TransactionTableControllerXL} from "@/components/transaction/TransactionTableControllerXL";
import TransactionFilterSelect from "@/components/transaction/TransactionFilterSelect.vue";
import {networkRegistry} from "@/schemas/NetworkRegistry";
import router, {routeManager} from "@/router";
import TransactionLink from "@/components/values/TransactionLink.vue";
import EVMAddress from "@/components/values/EVMAddress.vue";

const MAX_TOKEN_BALANCES = 3

export default defineComponent({

  name: 'ContractDetails',

  components: {
    EVMAddress,
    TransactionLink,
    TransactionFilterSelect,
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

    const accountLoader = new AccountLoader(normalizedContractId)
    onMounted(() => accountLoader.requestLoad())

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
        accountLoader.accountId.value ? networkRegistry.computeChecksum(
            accountLoader.accountId.value,
            router.currentRoute.value.params.network as string
        ) : null)

    const displayAllTokenLinks = computed(() => accountLoader.tokens.value ? accountLoader.tokens.value.length > MAX_TOKEN_BALANCES : false)

    const notification = computed(() => {
      let result: string|null

      // const expiration = contractLoader.entity.value?.expiration_timestamp
      if (!validEntityId.value) {
        result = "Invalid contract ID: " + props.contractId
      } else if (contractLookup.entity.value == null) {
        result = "Contract with ID " + props.contractId + " was not found"
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

    //
    // transactionTableController
    //

    const pageSize = computed(() => 10)
    const transactionTableController = new TransactionTableControllerXL(router, normalizedContractId, pageSize, true)
    onMounted(() => transactionTableController.mount())
    onBeforeUnmount(() => transactionTableController.unmount())

    const accountRoute = computed(() => {
      return normalizedContractId.value !== null ?  routeManager.makeRouteToAccount(normalizedContractId.value) : null
    })

    return {
      isSmallScreen,
      isMediumScreen,
      isTouchDevice,
      contract: contractLookup.entity,
      account: accountLoader.entity,
      balance: accountLoader.balance,
      tokens: accountLoader.tokens,
      ethereumAddress: accountLoader.ethereumAddress,
      accountChecksum,
      displayAllTokenLinks,
      transactionTableController,
      notification,
      autoRenewAccount: autoRenewAccount,
      obtainerId: obtainerId,
      proxyAccountId: proxyAccountId,
      normalizedContractId,
      accountRoute
    }
  },
});

</script>

<style/>
