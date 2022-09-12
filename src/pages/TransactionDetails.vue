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

  <section class="section" :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}">

    <DashboardCard class="h-card">
      <template v-slot:title>
        <div class="is-flex is-align-items-center">
          <span class="h-is-primary-title">Transaction </span>
          <span class="h-is-secondary-text mr-3">{{ normalizedTransactionId ?? "" }}</span>
          <div v-if="transaction">
            <div v-if="transactionSucceeded"
                 class="h-has-pill has-background-success mr-3 h-is-text-size-2 mt-3">SUCCESS
            </div>
            <div v-else class="h-has-pill has-background-danger mr-3 h-is-text-size-2 mt-3">FAILURE</div>
          </div>
          <span v-if="showAllTransactionVisible" class="is-inline-block mt-2" id="allTransactionsLink">
          <router-link :to="{name: 'TransactionsById', params: {transactionId: normalizedTransactionId}}">
            <span class="h-is-property-text has-text-grey">See all transactions with the same ID</span>
          </router-link>
        </span>
        </div>
      </template>

      <template v-slot:content>
        <NotificationBanner v-if="notification" :message="notification"/>
      </template>

      <template v-slot:leftContent>
        <Property id="transactionType">
          <template v-slot:name>Type</template>
          <template v-slot:value>
            <StringValue :string-value="transactionType ? makeTypeLabel(transactionType) : undefined"/>
          </template>
        </Property>
        <Property id="consensusAt">
          <template v-slot:name>Consensus at</template>
          <template v-slot:value>
            <TimestampValue v-bind:timestamp="transaction?.consensus_timestamp" v-bind:show-none="true" />
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
            <BlobValue :blob-value="transaction?.memo_base64" :show-none="true" :base64="true" class="should-wrap"/>
          </template>
        </Property>
      </template>

      <template v-slot:rightContent>
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
            <HbarAmount v-if="transaction" v-bind:amount="transaction.charged_tx_fee" v-bind:show-extra="true"/>
          </template>
        </Property>
        <Property id="maxFee">
          <template v-slot:name>Max fee</template>
          <template v-slot:value>
            <HbarAmount v-if="transaction" v-bind:amount="maxFee" v-bind:show-extra="true"/>
          </template>
        </Property>
        <Property id="netAmount" v-if="false">
          <template v-slot:name>Net Amount</template>
          <template v-slot:value>
            <HbarAmount v-if="transaction" v-bind:amount="netAmount" v-bind:show-extra="true"/>
          </template>
        </Property>
        <Property id="duration">
          <template v-slot:name>Valid Duration</template>
          <template v-slot:value>
            <DurationValue v-bind:string-value="transaction?.valid_duration_seconds"/>
          </template>
        </Property>
        <Property id="nonce">
          <template v-slot:name>Nonce</template>
          <template v-slot:value>
            {{ transaction?.nonce }}
          </template>
        </Property>
        <Property v-if="schedulingTransaction" id="schedulingTransaction">
          <template v-slot:name>Scheduling</template>
          <template v-slot:value>
            <router-link :to="{
                  name: 'TransactionDetails',
                  params: { transactionId: schedulingTransaction.transaction_id },
                  query: { t: schedulingTransaction.consensus_timestamp }
                }">Show transaction
            </router-link>
          </template>
        </Property>
        <Property v-else-if="scheduledTransaction" id="scheduledTransaction">
          <template v-slot:name>Scheduled</template>
          <template v-slot:value>
            <router-link :to="{
                  name: 'TransactionDetails',
                  params: { transactionId: scheduledTransaction.transaction_id },
                  query: { t: scheduledTransaction.consensus_timestamp }
                }">Show transaction
            </router-link>
          </template>
        </Property>
        <Property v-else>
          <template v-slot:name>Scheduled</template>
          <template v-slot:value>
            <span class="has-text-grey">False</span>
          </template>
        </Property>
        <Property v-if="parentTransaction" id="parentTransaction">
          <template v-slot:name>Parent</template>
          <template v-slot:value>
            <router-link :to="{
                  name: 'TransactionDetails',
                  params: { transactionId: parentTransaction.transaction_id },
                  query: { t: parentTransaction.consensus_timestamp }
                }">{{ makeTypeLabel(parentTransaction.name) }}
            </router-link>
          </template>
        </Property>
        <Property v-if="childTransactions.length" id="children">
          <template v-slot:name>Children</template>
          <template v-slot:value>
            <router-link v-if="displayAllChildrenLinks"
                         :to="{name: 'TransactionsById', params: {transactionId: transactionId}}">
              {{ 'Show all ' + childTransactions.length + ' child transactions' }}
            </router-link>
            <div v-else>
              <router-link v-for="tx in childTransactions" :key="tx.nonce" :to="{
                    name: 'TransactionDetails',
                    params: { transactionId: tx.transaction_id },
                    query: { t: tx.consensus_timestamp }
                  }">
                <span class="mr-2">{{ '#' + tx.nonce }}</span>
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

    <ContractResultAndLogs :transaction-id-or-hash="transactionId"/>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onMounted, ref, watch} from 'vue';
import {TransactionID} from "@/utils/TransactionID";
import {makeOperatorAccountLabel, makeTypeLabel} from "@/utils/TransactionTools";
import {TransactionLoader} from "@/components/transaction/TransactionLoader";
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
import ContractResultAndLogs from "@/components/transaction/ContractResultAndLogs.vue";

const MAX_INLINE_CHILDREN = 3
const NB_LOG_LINES = 2
const MAX_LOG_LINES = 10

export default defineComponent({

  name: 'TransactionDetails',

  components: {
    ContractResultAndLogs,
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
    transactionId: String,
    consensusTimestamp: String,
    network: String
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    const validId = computed(() => props.transactionId ? TransactionID.parse(props.transactionId) !== null : false)
    const transactionLoader = new TransactionLoader(
        computed(() => props.transactionId ?? null),
        computed(() => props.consensusTimestamp ?? null))
    onMounted(() => transactionLoader.requestLoad())

    const logCursor = ref(0)
    const nbLogLines = ref(NB_LOG_LINES)
    watch(nbLogLines, () => logCursor.value = 0)

    const showAllTransactionVisible = computed(() => {
      const count = transactionLoader.transactions.value?.length ?? 0
      return count >= 2
    })

    const displayAllChildrenLinks = computed(
        () => transactionLoader.childTransactions.value.length > MAX_INLINE_CHILDREN )

    const notification = computed(() => {
      let result
      if (!validId.value) {
        result = "Invalid transaction ID: " + props.transactionId
      } else if (transactionLoader.got404.value) {
        result = "Transaction with ID " + transactionLoader.normalizedTransactionId.value + " was not found"
      } else if (transactionLoader.hasSucceeded.value) {
        result = null
      } else {
        result = transactionLoader.result.value
      }
      return result
    })

    const routeName = computed(() => {
      return transactionLoader.entityDescriptor.value?.routeName
    })

    return {
      NB_LOG_LINES,
      MAX_LOG_LINES,
      isSmallScreen,
      isTouchDevice,
      transaction: transactionLoader.transaction,
      normalizedTransactionId: transactionLoader.normalizedTransactionId,
      netAmount: transactionLoader.netAmount,
      entity: transactionLoader.entityDescriptor,
      systemContract: transactionLoader.systemContract,
      maxFee: transactionLoader.maxFee,
      formattedHash: transactionLoader.formattedHash,
      transactionType: transactionLoader.transactionType,
      transactionSucceeded: transactionLoader.hasSucceeded,
      scheduledTransaction: transactionLoader.scheduledTransaction,
      schedulingTransaction: transactionLoader.schedulingTransaction,
      parentTransaction: transactionLoader.parentTransaction,
      childTransactions: transactionLoader.childTransactions,
      blockNumber: transactionLoader.blockNumber,
      notification,
      routeName,
      logCursor,
      nbLogLines,
      makeTypeLabel,
      // computeNetAmount,
      makeOperatorAccountLabel,
      showAllTransactionVisible,
      displayAllChildrenLinks,
    }
  },
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>