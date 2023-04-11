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

  <section :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}" class="section">

    <DashboardCard class="h-card">
      <template v-slot:title>
        <div class="is-flex is-align-items-center">
          <span class="h-is-primary-title mr-1">Transaction </span>
          <span class="h-is-secondary-text mr-3">{{ formattedTransactionId ?? "" }}</span>
          <div v-if="transaction">
            <div v-if="transactionSucceeded"
                 class="h-has-pill has-background-success mr-3 h-is-text-size-2 mt-3">SUCCESS
            </div>
            <div v-else class="h-has-pill has-background-danger mr-3 h-is-text-size-2 mt-3">FAILURE</div>
          </div>
          <span v-if="routeToAllTransactions && isLargeScreen" id="allTransactionsLink" class="is-inline-block mt-2">
          <router-link :to="routeToAllTransactions">
            <span class="h-is-property-text has-text-grey">Show all transactions with the same ID</span>
          </router-link>
        </span>
        </div>
        <span v-if="routeToAllTransactions && !isLargeScreen">
          <router-link :to="routeToAllTransactions">
            <span class="h-is-property-text has-text-grey">Show all transactions with the same ID</span>
          </router-link>
        </span>
      </template>

      <template v-slot:content>
        <NotificationBanner v-if="notification" :message="notification"/>
      </template>

      <template v-slot:leftContent>
        <Property id="transactionType">
          <template v-slot:name>Type</template>
          <template v-slot:value>
            <StringValue :string-value="transactionType ? makeTypeLabel(transactionType) : undefined"/>
            <div v-if="scheduledTransaction" id="scheduledLink">
              <router-link :to="routeManager.makeRouteToTransactionObj(scheduledTransaction)">
                <span class="h-is-text-size-3 has-text-grey">Show scheduled transaction</span>
              </router-link>
            </div>
          </template>
        </Property>
        <Property id="consensusAt">
          <template v-slot:name>Consensus at</template>
          <template v-slot:value>
            <TimestampValue v-bind:show-none="true" v-bind:timestamp="transaction?.consensus_timestamp"/>
          </template>
        </Property>
        <Property id="transactionHash">
          <template v-slot:name>Transaction Hash</template>
          <template v-slot:value>
            <HexaValue v-bind:byteString="formattedHash ?? undefined" v-bind:show-none="true"/>
          </template>
        </Property>
        <Property id="blockNumber">
          <template v-slot:name>Block</template>
          <template v-slot:value>
            <BlockLink :block-number="blockNumber"/>
          </template>
        </Property>
        <Property id="nodeAccount">
          <template v-slot:name>Node Submitted To</template>
          <template v-slot:value>
            <AccountLink v-bind:accountId="transaction?.node" v-bind:show-extra="true"/>
          </template>
        </Property>
        <Property id="memo">
          <template v-slot:name>Memo</template>
          <template v-slot:value>
            <BlobValue :base64="true" :blob-value="transaction?.memo_base64" :show-none="true"/>
          </template>
        </Property>
      </template>

      <template v-slot:rightContent>
        <Property v-if="isTokenAssociation && associatedTokens.length" id="associatedTokenId">
          <template v-slot:name>
            Associated Token<span v-if="associatedTokens.length > 1">s</span>
          </template>
          <template v-slot:value>
            <TokenLink v-for="t of associatedTokens" :key="t" :token-id="t" :show-extra="true"/>
          </template>
        </Property>
        <Property v-if="systemContract" id="entityId">
          <template v-slot:name>Contract ID</template>
          <template v-slot:value>{{ systemContract }}</template>
        </Property>
        <Property v-else-if="transaction?.entity_id" id="entityId">
          <template v-slot:name>{{ entity?.label }}</template>
          <template v-slot:value>
            <EntityLink v-if="entity?.routeName"
                        v-bind:entity-id="transaction?.entity_id"
                        v-bind:route-name="routeName"
                        v-bind:show-extra="true"
            />
            <span v-else>
                  {{ transaction?.entity_id }}
                </span>
          </template>
        </Property>
        <Property id="operatorAccount">
          <template v-slot:name>Payer Account</template>
          <template v-slot:value>
            <AccountLink v-if="transaction" v-bind:accountId="makeOperatorAccountLabel(transaction)"
                         v-bind:show-extra="true"/>
          </template>
        </Property>
        <Property id="chargedFee">
          <template v-slot:name>Charged Fee</template>
          <template v-slot:value>
            <HbarAmount v-if="transaction" :amount="transaction.charged_tx_fee"
                        :show-extra="true" :timestamp="transaction.consensus_timestamp"/>
          </template>
        </Property>
        <Property id="maxFee">
          <template v-slot:name>Max fee</template>
          <template v-slot:value>
            <HbarAmount v-if="transaction" :amount="maxFee" :show-extra="true"
                        :timestamp="transaction.consensus_timestamp"/>
          </template>
        </Property>
        <Property v-if="false" id="netAmount">
          <template v-slot:name>Net Amount</template>
          <template v-slot:value>
            <HbarAmount v-if="transaction" :amount="netAmount" :show-extra="true"
                        :timestamp="transaction.consensus_timestamp"/>
          </template>
        </Property>
        <Property id="duration">
          <template v-slot:name>Valid Duration</template>
          <template v-slot:value>
            <DurationValue v-bind:string-value="transaction?.valid_duration_seconds" :show-none="true"/>
          </template>
        </Property>
        <Property id="nonce">
          <template v-slot:name>Nonce</template>
          <template v-slot:value>
            {{ transaction?.nonce }}
          </template>
        </Property>
        <Property id="scheduled">
          <template v-slot:name>Scheduled</template>
          <template v-if="transaction?.scheduled===true" v-slot:value>
            True
            <div v-if="schedulingTransaction" id="schedulingLink">
              <router-link :to="routeManager.makeRouteToTransactionObj(schedulingTransaction)">
                <span class="has-text-grey h-is-text-size-3">Show schedule create transaction</span>
              </router-link>
            </div>
          </template>
          <template v-else-if="scheduledTransaction!==null" v-slot:value>
            False
          </template>
          <template v-else v-slot:value>
            <span class="has-text-grey">False</span>
          </template>
        </Property>
        <Property v-if="parentTransaction" id="parentTransaction">
          <template v-slot:name>Parent Transaction</template>
          <template v-slot:value>
            <router-link :to="routeManager.makeRouteToTransactionObj(parentTransaction)">
              {{ makeTypeLabel(parentTransaction.name) }}
            </router-link>
          </template>
        </Property>
        <Property v-if="childTransactions.length" id="childTransactions">
          <template v-slot:name>Child Transactions</template>
          <template v-slot:value>
            <router-link v-if="displayAllChildrenLinks"
                         :to="routeManager.makeRouteToTransactionsById(transactionId)">
              {{ 'Show all ' + childTransactions.length + ' transactions' }}
            </router-link>
            <div v-else>
              <router-link v-for="tx in childTransactions" :key="tx.nonce"
                           :to="routeManager.makeRouteToTransactionObj(tx)">
                <span class="mr-2 is-numeric">{{ '#' + tx.nonce }}</span>
                <span>{{ makeTypeLabel(tx.name) }}</span>
                <br/></router-link>
            </div>
          </template>
        </Property>
      </template>
    </DashboardCard>

    <DashboardCard class="h-card">
      <template v-slot:title>
        <span class="h-is-secondary-title">Transfers</span>
      </template>
      <template v-slot:content>
        <div class="h-is-property-text">
          <TransferGraphSection v-bind:transaction="transaction"/>
        </div>
      </template>
    </DashboardCard>

    <TopicMessage :message="topicMessage"/>

    <ContractResult :contract-id="contractId"
                    :is-parent="transaction?.parent_consensus_timestamp === null"
                    :timestamp="transaction?.consensus_timestamp"
                    :transaction-id-or-hash="transaction?.transaction_id"/>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted} from 'vue';
import {makeOperatorAccountLabel, makeTypeLabel} from "@/utils/TransactionTools";
import AccountLink from "@/components/values/AccountLink.vue";
import HexaValue from "@/components/values/HexaValue.vue";
import TimestampValue from "@/components/values/TimestampValue.vue";
import EntityLink from "@/components/values/EntityLink.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";
import BlobValue from "@/components/values/BlobValue.vue";
import StringValue from "@/components/values/StringValue.vue";
import TransferGraphSection from "@/components/transfer_graphs/TransferGraphSection.vue";
import Footer from "@/components/Footer.vue";
import NotificationBanner from "@/components/NotificationBanner.vue";
import Property from "@/components/Property.vue";
import DurationValue from "@/components/values/DurationValue.vue";
import BlockLink from "@/components/values/BlockLink.vue";
import ContractResult from "@/components/contract/ContractResult.vue";
import {TransactionDetail, TransactionType} from "@/schemas/HederaSchemas";
import TopicMessage from "@/components/topic/TopicMessage.vue";
import {TopicMessageCache} from "@/utils/cache/TopicMessageCache";
import {routeManager} from "@/router"
import TokenLink from "@/components/values/TokenLink.vue";
import {TransactionLocParser} from "@/utils/parser/TransactionLocParser";
import {TransactionGroupAnalyzer} from "@/components/transaction/TransactionGroupAnalyzer";
import {TransactionAnalyzer} from "@/components/transaction/TransactionAnalyzer";
import {TransactionGroupCache} from "@/utils/cache/TransactionGroupCache";

const MAX_INLINE_CHILDREN = 9

export default defineComponent({

  name: 'TransactionDetails',

  components: {
    TokenLink,
    TopicMessage,
    ContractResult,
    BlockLink,
    Property,
    NotificationBanner,
    Footer,
    HbarAmount, BlobValue,
    DashboardCard, EntityLink, AccountLink,
    HexaValue, TimestampValue, TransferGraphSection,
    StringValue, DurationValue
  },

  props: {
    transactionLoc: String,
    network: String
  },

  setup: function (props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isLargeScreen = inject('isLargeScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    const transactionLoc = computed(() => props.transactionLoc ?? null)
    const transactionLocParser = new TransactionLocParser(transactionLoc)
    onMounted(() => transactionLocParser.mount())
    onBeforeUnmount(() => transactionLocParser.unmount())

    const transactionAnalyzer = new TransactionAnalyzer(transactionLocParser.transaction)
    onMounted(() => transactionAnalyzer.mount())
    onBeforeUnmount(() => transactionAnalyzer.unmount())

    const transactionGroupLookup = TransactionGroupCache.instance.makeLookup(transactionLocParser.transactionId)
    onMounted(() => transactionGroupLookup.mount())
    onBeforeUnmount(() => transactionGroupLookup.unmount())

    const transactionGroupAnalyzer = new TransactionGroupAnalyzer(transactionGroupLookup.entity)
    const routeToAllTransactions = computed(() => {
      const count = transactionGroupAnalyzer.transactions.value?.length ?? 0
      const transactionId = transactionLocParser.transactionId.value ?? null
      return count >= 2 && transactionId !== null
          ? routeManager.makeRouteToTransactionsById(transactionId)
          : null
    })
    const displayAllChildrenLinks = computed(() => {
      return transactionGroupAnalyzer.childTransactions.value.length > MAX_INLINE_CHILDREN
    })


    const routeName = computed(() => {
      return transactionAnalyzer.entityDescriptor.value?.routeName
    })

    const messageTimestamp = computed(() =>
        (transactionAnalyzer.transactionType.value === TransactionType.CONSENSUSSUBMITMESSAGE)
            ? transactionAnalyzer.consensusTimestamp.value ?? ""
            : ""
    )
    const topicMessageLookup = TopicMessageCache.instance.makeLookup(messageTimestamp)
    onMounted(() => topicMessageLookup.mount())
    onBeforeUnmount(() => topicMessageLookup.unmount())

    const transactionDetail = computed(() => {
      let result: TransactionDetail|null
      const consensusTimestamp = transactionAnalyzer.consensusTimestamp.value
      if (consensusTimestamp !== null) {
        result = null
        for (const t of transactionGroupAnalyzer.transactions.value ?? []) {
          if (consensusTimestamp == t.consensus_timestamp) {
            result = t
          }
        }
      } else {
        result = null
      }
      return result
    })

    const parentTransaction = computed(() => {
      let result: TransactionDetail|null
      const t = transactionLocParser.transaction.value
      const p = transactionGroupAnalyzer.parentTransaction.value
      if (t !== null && p !== null && t.consensus_timestamp !== p.consensus_timestamp) {
        result = p
      } else {
        result = null
      }
      return result
    })

    const childTransactions = computed(() => {
      let result: TransactionDetail[]
      const t = transactionLocParser.transaction.value
      const p = transactionGroupAnalyzer.parentTransaction.value
      if (t !== null && p !== null && t.consensus_timestamp === p.consensus_timestamp) {
        result = transactionGroupAnalyzer.childTransactions.value
      } else {
        result = []
      }
      return result
    })

    const scheduledTransaction = computed(() => {
      let result: TransactionDetail|null
      const t = transactionLocParser.transaction.value
      const i = transactionGroupAnalyzer.scheduledTransaction.value
      if (t !== null && i !== null && t.consensus_timestamp !== i.consensus_timestamp) {
        result = i
      } else {
        result = null
      }
      return result
    })

    const schedulingTransaction = computed(() => {
      let result: TransactionDetail|null
      const t = transactionLocParser.transaction.value
      const o = transactionGroupAnalyzer.schedulingTransaction.value
      if (t !== null && o !== null && t.consensus_timestamp !== o.consensus_timestamp) {
        result = o
      } else {
        result = null
      }
      return result
    })


    return {
      isSmallScreen,
      isLargeScreen,
      isTouchDevice,
      transactionId: transactionLocParser.transactionId,
      transaction: transactionDetail,
      formattedTransactionId: transactionAnalyzer.formattedTransactionId,
      netAmount: transactionAnalyzer.netAmount,
      entity: transactionAnalyzer.entityDescriptor,
      contractId: transactionAnalyzer.contractId,
      systemContract: transactionAnalyzer.systemContract,
      maxFee: transactionAnalyzer.maxFee,
      formattedHash: transactionAnalyzer.formattedHash,
      transactionType: transactionAnalyzer.transactionType,
      transactionSucceeded: transactionAnalyzer.hasSucceeded,
      scheduledTransaction,
      schedulingTransaction,
      parentTransaction,
      childTransactions,
      blockNumber: transactionAnalyzer.blockNumber,
      notification: transactionLocParser.errorNotification,
      routeName,
      routeManager,
      makeTypeLabel,
      makeOperatorAccountLabel,
      routeToAllTransactions,
      displayAllChildrenLinks,
      topicMessage: topicMessageLookup.entity,
      isTokenAssociation: transactionAnalyzer.isTokenAssociation,
      associatedTokens: transactionAnalyzer.tokens
    }
  },
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>