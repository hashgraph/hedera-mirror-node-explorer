<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2024 Hedera Hashgraph, LLC
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

    <DashboardCard collapsible-key="contractDetails">
      <template v-slot:title>
        <span class="h-is-primary-title">Contract </span>
      </template>

      <template v-slot:subtitle>
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
        <div v-if="domainName" id="names" class="h-is-tertiary-text mt-2" style="word-break: keep-all">
          <div class="is-inline-block h-is-property-text has-text-weight-light" style="min-width: 115px">Domain:</div>
          <div class="is-inline-block h-is-property-text">
            <EntityIOL :label="domainName"/>
            <span class="ml-2">
              <InfoTooltip v-if="domainProviderName" :label="domainProviderName"/>
            </span>
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

        <div class="h-is-property-text">
          <Property id="balance" :full-width="isMediumScreen">
            <template v-slot:name>
              <span class="h-is-tertiary-text">Balance</span>
            </template>
            <template v-slot:value>
              <InlineBalancesValue :balance-analyzer="balanceAnalyzer"/>
            </template>
          </Property>
        </div>
      </template>

      <template v-slot:leftContent>
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
        <Property id="expiresAt" tooltip="Contract expiry is not turned on yet. Value in this field is not relevant.">
          <template v-slot:name>
            <span>Expires at</span>
          </template>
          <template v-slot:value>
            <TimestampValue v-bind:timestamp="contract?.expiration_timestamp" v-bind:show-none="true"/>
          </template>
        </Property>
        <Property id="autoRenewPeriod"
                  tooltip="Contract auto-renew is not turned on yet. Value in this field is not relevant.">
          <template v-slot:name>
            <span>Auto Renew Period</span>
          </template>
          <template v-slot:value>
            <DurationValue v-bind:number-value="contract?.auto_renew_period ?? undefined"/>
          </template>
        </Property>
        <Property id="autoRenewAccount"
                  tooltip="Contract auto-renew is not turned on yet. Value in this field is not relevant.">
          <template v-slot:name>
            <span>Auto Renew Account</span>
          </template>
          <template v-slot:value>
            <AccountLink :account-id="autoRenewAccount"/>
          </template>
        </Property>
        <Property id="maxAutoAssociation"
                  tooltip="Number of auto association slots for token airdrops. Unlimited (-1), Limited (>0), No auto association slots (0).">
          <template v-slot:name>Max. Auto. Association</template>
          <template v-slot:value>
            <StringValue :string-value="maxAutoAssociationValue"/>
          </template>
        </Property>
      </template>

      <template v-slot:rightContent>
        <Property id="obtainer">
          <template v-slot:name>Obtainer</template>
          <template v-slot:value>
            <AccountLink :account-id="obtainerId"/>
          </template>
        </Property>
        <Property id="proxyAccount">
          <template v-slot:name>Proxy Account</template>
          <template v-slot:value>
            <AccountLink :account-id="proxyAccountId"/>
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

    <TokensSection :account-id="normalizedContractId"/>

    <ContractResultsSection :contract-id="normalizedContractId ?? undefined"/>

    <ContractByteCodeSection :contract-analyzer="contractAnalyzer"/>

    <ContractResultLogs :logs="logs"/>

    <MirrorLink :network="network" entityUrl="contracts" :loc="contractId"/>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted} from 'vue';
import KeyValue from "@/components/values/KeyValue.vue";
import AccountLink from "@/components/values/link/AccountLink.vue";
import TimestampValue from "@/components/values/TimestampValue.vue";
import DurationValue from "@/components/values/DurationValue.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import BlobValue from "@/components/values/BlobValue.vue";
import StringValue from "@/components/values/StringValue.vue";
import Footer from "@/components/Footer.vue";
import NotificationBanner from "@/components/NotificationBanner.vue";
import Property from "@/components/Property.vue";
import {AccountByIdCache} from "@/utils/cache/AccountByIdCache";
import {ContractLocParser} from "@/utils/parser/ContractLocParser";
import {networkRegistry} from "@/schemas/NetworkRegistry";
import router, {routeManager} from "@/router";
import TransactionLink from "@/components/values/TransactionLink.vue";
import EVMAddress from "@/components/values/EVMAddress.vue";
import ContractByteCodeSection from "@/components/contract/ContractByteCodeSection.vue";
import ContractResultsSection from "@/components/contract/ContractResultsSection.vue";
import Copyable from "@/components/Copyable.vue";
import {ContractAnalyzer} from "@/utils/analyzer/ContractAnalyzer";
import ContractResultLogs from "@/components/contract/ContractResultLogs.vue";
import {ContractResultsLogsAnalyzer} from "@/utils/analyzer/ContractResultsLogsAnalyzer";
import {BalanceAnalyzer} from "@/utils/analyzer/BalanceAnalyzer";
import InlineBalancesValue from "@/components/values/InlineBalancesValue.vue";
import MirrorLink from "@/components/MirrorLink.vue";
import {NameQuery} from "@/utils/name_service/NameQuery";
import EntityIOL from "@/components/values/link/EntityIOL.vue";
import InfoTooltip from "@/components/InfoTooltip.vue";
import {labelForAutomaticTokenAssociation} from "@/schemas/HederaUtils";
import TokensSection from "@/components/token/TokensSection.vue";

export default defineComponent({

  name: 'ContractDetails',

  components: {
    TokensSection,
    InfoTooltip,
    EntityIOL,
    InlineBalancesValue,
    MirrorLink,
    Copyable,
    ContractByteCodeSection,
    ContractResultsSection,
    EVMAddress,
    TransactionLink,
    Property,
    NotificationBanner,
    Footer,
    BlobValue,
    DashboardCard,
    AccountLink,
    TimestampValue,
    DurationValue,
    KeyValue,
    StringValue,
    ContractResultLogs
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

    const normalizedContractId = computed(() => {
      return contractLocParser.contractId.value
    })

    //
    // contract
    //

    const contractLocParser = new ContractLocParser(computed(() => props.contractId ?? null))
    onMounted(() => contractLocParser.mount())
    onBeforeUnmount(() => contractLocParser.unmount())

    const displayNonce = computed(() => contractLocParser.entity.value?.nonce != undefined)
    const maxAutoAssociationValue = computed(() =>
        labelForAutomaticTokenAssociation(
            contractLocParser.entity.value?.max_automatic_token_associations ?? 0
        ))

    const autoRenewAccount = computed(() => {
      return contractLocParser.entity.value?.auto_renew_account ?? null
    })

    const obtainerId = computed(() => {
      return contractLocParser.entity.value?.obtainer_id ?? null
    })

    const proxyAccountId = computed(() => {
      return contractLocParser.entity.value?.proxy_account_id ?? null
    })

    const accountChecksum = computed(() =>
        contractLocParser.contractId.value ? networkRegistry.computeChecksum(
            contractLocParser.contractId.value,
            router.currentRoute.value.params.network as string
        ) : null)

    //
    // account
    //

    const accountLookup = AccountByIdCache.instance.makeLookup(normalizedContractId)
    onMounted(() => accountLookup.mount())
    onBeforeUnmount(() => accountLookup.unmount())

    //
    // BalanceAnalyzer
    //

    const balanceAnalyzer = new BalanceAnalyzer(contractLocParser.contractId, 10000)
    onMounted(() => balanceAnalyzer.mount())
    onBeforeUnmount(() => balanceAnalyzer.unmount())

    const accountRoute = computed(() => {
      return normalizedContractId.value !== null ? routeManager.makeRouteToAccount(normalizedContractId.value) : null
    })

    const contractAnalyzer = new ContractAnalyzer(normalizedContractId)
    onMounted(() => contractAnalyzer.mount())
    onBeforeUnmount(() => contractAnalyzer.unmount())

    //
    // contract results logs - event logs at contract level
    //
    const contractResultsLogsAnalyzer = new ContractResultsLogsAnalyzer(normalizedContractId)
    onMounted(() => contractResultsLogsAnalyzer.mount())
    onBeforeUnmount(() => contractResultsLogsAnalyzer.unmount())

    //
    // Naming
    //
    const nameQuery = new NameQuery(computed(() => props.contractId ?? null))
    onMounted(() => nameQuery.mount())
    onBeforeUnmount(() => nameQuery.unmount())

    return {
      isSmallScreen,
      isMediumScreen,
      isTouchDevice,
      contract: contractLocParser.entity,
      maxAutoAssociationValue,
      balanceAnalyzer,
      ethereumAddress: contractLocParser.ethereumAddress,
      displayNonce,
      accountChecksum,
      notification: contractLocParser.errorNotification,
      autoRenewAccount: autoRenewAccount,
      obtainerId: obtainerId,
      proxyAccountId: proxyAccountId,
      normalizedContractId,
      accountRoute,
      contractAnalyzer,
      logs: contractResultsLogsAnalyzer.logs,
      domainName: nameQuery.name,
      domainProviderName: nameQuery.providerName,
    }
  },
});

</script>

<style/>
