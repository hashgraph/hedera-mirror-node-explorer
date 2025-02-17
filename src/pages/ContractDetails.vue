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

  <PageFrameV2 page-title="Contract Details">

    <DashboardCardV2 collapsible-key="contractDetails">
      <template #title>
        {{ `Contract ${contractName ?? ''}` }}
        <div v-if="isVerified" class="h-has-pill h-status-success" style="margin-top: 2px">
          VERIFIED
        </div>
        <div v-if="isErc20" class="h-has-pill" style="margin-top: 2px">
          ERC 20
        </div>
        <div v-if="isErc721" class="h-has-pill" style="margin-top: 2px">
          ERC 721
        </div>
      </template>

      <template #right-control>
        <template v-if="contract && accountRoute">
          <ArrowLink
              :route="accountRoute" id="showAccountLink"
              text="Associated account"
          />
        </template>
      </template>

      <template #content>
        <NotificationBanner v-if="notification" :message="notification"/>

        <Property id="entityId" full-width>
          <template #name>
            Contract ID
          </template>
          <template #value>
            <Copyable :content-to-copy="normalizedContractId ?? ''">
              <template #content>
                <span>{{ normalizedContractId ?? "" }}</span>
              </template>
            </Copyable>
            <span v-if="accountChecksum">-{{ accountChecksum }}</span>
          </template>
        </Property>
        <Property id="evmAddress" full-width>
          <template #name>
            EVM Address
          </template>
          <template #value>
            <EVMAddress
                :show-id="false"
                :address="ethereumAddress"/>
          </template>
        </Property>
        <Property v-if="domainName" id="names" full-width>
          <template #name>
            Domain
          </template>
          <template #value>
            <EntityIOL :label="domainName"/>
            <InfoTooltip v-if="domainProviderName" :label="domainProviderName"/>
          </template>
        </Property>
      </template>

      <template #left-content>
        <Property id="balance">
          <template #name>
            Balance
          </template>
          <template #value>
            <InlineBalancesValue :balance-analyzer="balanceAnalyzer"/>
          </template>
        </Property>
        <Property id="key">
          <template #name>Admin Key</template>
          <template #value>
            <KeyValue :key-bytes="contract?.admin_key?.key" :key-type="contract?.admin_key?._type" :show-none="true"/>
          </template>
        </Property>
        <Property id="memo">
          <template #name>Memo</template>
          <template #value>
            <BlobValue :blob-value="contract?.memo" :show-none="true" :base64="true" :show-base64-as-extra="true"/>
          </template>
        </Property>
        <Property id="createTransaction">
          <template #name>Create Transaction</template>
          <template #value>
            <TransactionLink :transactionLoc="contract?.created_timestamp ?? undefined"/>
          </template>
        </Property>
        <Property
            id="maxAutoAssociation"
            tooltip="Number of auto association slots for token airdrops. Unlimited (-1), Limited (>0), No auto association slots (0)."
        >
          <template #name>Max. Auto. Association</template>
          <template #value>
            <StringValue :string-value="maxAutoAssociationValue"/>
          </template>
        </Property>

        <template v-if="enableExpiry">
          <Property
              id="expiresAt"
              tooltip="Contract expiry is not turned on yet. Value in this field is not relevant."
          >
            <template #name>
              <span>Expires at</span>
            </template>
            <template #value>
              <TimestampValue :timestamp="contract?.expiration_timestamp" :show-none="true"/>
            </template>
          </Property>
          <Property
              id="autoRenewPeriod"
              tooltip="Contract auto-renew is not turned on yet. Value in this field is not relevant."
          >
            <template #name>
              <span>Auto Renew Period</span>
            </template>
            <template #value>
              <DurationValue :number-value="contract?.auto_renew_period ?? undefined"/>
            </template>
          </Property>
          <Property
              id="autoRenewAccount"
              tooltip="Contract auto-renew is not turned on yet. Value in this field is not relevant."
          >
            <template #name>
              <span>Auto Renew Account</span>
            </template>
            <template #value>
              <AccountLink :account-id="autoRenewAccount"/>
            </template>
          </Property>
        </template>
        <template v-else>
          <Property id="obtainer">
            <template #name>Obtainer</template>
            <template #value>
              <AccountLink :account-id="obtainerId"/>
            </template>
          </Property>
          <Property id="proxyAccount">
            <template #name>Proxy Account</template>
            <template #value>
              <AccountLink :account-id="proxyAccountId"/>
            </template>
          </Property>
        </template>
      </template>

      <template #right-content>
        <template v-if="enableExpiry">
          <Property id="obtainer">
            <template #name>Obtainer</template>
            <template #value>
              <AccountLink :account-id="obtainerId"/>
            </template>
          </Property>
          <Property id="proxyAccount">
            <template #name>Proxy Account</template>
            <template #value>
              <AccountLink :account-id="proxyAccountId"/>
            </template>
          </Property>
        </template>
        <template v-else>
        </template>

        <Property id="validFrom">
          <template #name>Valid from</template>
          <template #value>
            <TimestampValue :timestamp="contract?.timestamp?.from" :show-none="true"/>
          </template>
        </Property>
        <Property id="validUntil">
          <template #name>Valid until</template>
          <template #value>
            <TimestampValue :timestamp="contract?.timestamp?.to" :show-none="true"/>
          </template>
        </Property>
        <Property v-if="displayNonce" id="nonce">
          <template #name>Contract Nonce</template>
          <template #value>
            {{ contract?.nonce }}
          </template>
        </Property>
        <Property id="file">
          <template #name>File</template>
          <template #value>
            <StringValue :string-value="contract?.file_id"/>
          </template>
        </Property>
      </template>
    </DashboardCardV2>

    <TokensSection :account-id="normalizedContractId"/>

    <ContractERCSection
        :contract-id="normalizedContractId"
        v-model:is-erc20="isErc20"
        v-model:is-erc721="isErc721"
    />

    <ContractResultsSection :contract-id="normalizedContractId ?? undefined"/>

    <ContractByteCodeSection :contract-analyzer="contractAnalyzer"/>

    <ContractResultLogs :logs="logs"/>

    <MirrorLink :network="network" entityUrl="contracts" :loc="contractId"/>

  </PageFrameV2>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, onBeforeUnmount, onMounted, ref} from 'vue';
import KeyValue from "@/components/values/KeyValue.vue";
import AccountLink from "@/components/values/link/AccountLink.vue";
import TimestampValue from "@/components/values/TimestampValue.vue";
import DurationValue from "@/components/values/DurationValue.vue";
import BlobValue from "@/components/values/BlobValue.vue";
import StringValue from "@/components/values/StringValue.vue";
import PageFrameV2 from "@/components/page/PageFrameV2.vue";
import NotificationBanner from "@/components/NotificationBanner.vue";
import Property from "@/components/Property.vue";
import {AccountByIdCache} from "@/utils/cache/AccountByIdCache";
import {ContractLocParser} from "@/utils/parser/ContractLocParser";
import {NetworkConfig} from "@/config/NetworkConfig";
import {routeManager} from "@/router";
import TransactionLink from "@/components/values/TransactionLink.vue";
import EVMAddress from "@/components/values/EVMAddress.vue";
import ContractByteCodeSection from "@/components/contract/ContractByteCodeSection.vue";
import ContractResultsSection from "@/components/contract/ContractResultsSection.vue";
import Copyable from "@/elements/Copyable.vue";
import {ContractAnalyzer} from "@/utils/analyzer/ContractAnalyzer";
import ContractResultLogs from "@/components/contract/ContractResultLogs.vue";
import {ContractResultsLogsAnalyzer} from "@/utils/analyzer/ContractResultsLogsAnalyzer";
import {BalanceAnalyzer} from "@/utils/analyzer/BalanceAnalyzer";
import InlineBalancesValue from "@/components/values/InlineBalancesValue.vue";
import MirrorLink from "@/components/MirrorLink.vue";
import {NameQuery} from "@/utils/name_service/NameQuery";
import EntityIOL from "@/components/values/link/EntityIOL.vue";
import InfoTooltip from "@/components/InfoTooltip.vue";
import {labelForAutomaticTokenAssociation} from "@/schemas/MirrorNodeUtils.ts";
import TokensSection from "@/components/token/TokensSection.vue";
import ContractERCSection from "@/components/contract/ContractERCSection.vue";
import DashboardCardV2 from "@/components/DashboardCardV2.vue";
import ArrowLink from "@/components/ArrowLink.vue";

const props = defineProps({
  contractId: String,
  network: String
})

const networkConfig = NetworkConfig.inject()

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
    contractLocParser.contractId.value ? networkConfig.computeChecksum(
        contractLocParser.contractId.value,
        routeManager.currentNetwork.value
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

//
// ContractAnalyzer
//
const contractAnalyzer = new ContractAnalyzer(normalizedContractId)
onMounted(() => contractAnalyzer.mount())
onBeforeUnmount(() => contractAnalyzer.unmount())

//
// ERC
//
const isErc20 = ref(false)
const isErc721 = ref(false)

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

const enableExpiry = routeManager.enableExpiry
const contract = contractLocParser.entity
const ethereumAddress = contractLocParser.ethereumAddress
const notification = contractLocParser.errorNotification
const isVerified = contractAnalyzer.isVerified
const contractName = contractAnalyzer.contractName
const logs = contractResultsLogsAnalyzer.logs
const domainName = nameQuery.name
const domainProviderName = nameQuery.providerName

</script>

<style scoped>

</style>
