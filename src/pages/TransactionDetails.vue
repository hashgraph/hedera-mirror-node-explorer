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

    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Transaction </span>
        <span class="h-is-secondary-text mr-3">{{ transaction ? convertTransactionId(transactionId) : "" }}</span>
        <span v-if="showAllTransactionVisible" class="is-inline-block" id="allTransactionsLink">
          <router-link :to="{name: 'TransactionsById', params: {transactionId: transactionId}}">
            <span class="h-is-property-text has-text-grey">See all transactions with the same ID</span>
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
            <StringValue :string-value="transaction ? makeTypeLabel(transaction.name) : undefined"/>
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
            <HexaValue v-bind:byteString="transaction ? formatHash(transaction?.transaction_hash): undefined" v-bind:show-none="true"/>
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
        <Property v-if="transaction?.entity_id" id="entityId">
          <template v-slot:name>{{ entity?.label }}</template>
          <template v-slot:value>
            <template v-if="entity?.routeName">
              <EntityLink
                  v-bind:entity-id="transaction?.entity_id"
                  v-bind:route-name="routeName"
                  v-bind:show-extra="true"
              />
            </template>
            <template v-else>
              {{ transaction?.entity_id }}
            </template>
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
            <HbarAmount v-if="transaction" v-bind:amount="computeMaxFee(transaction)" v-bind:show-extra="true"/>
          </template>
        </Property>
        <Property id="netAmount" v-if="false">
          <template v-slot:name>Net Amount</template>
          <template v-slot:value>
            <HbarAmount v-if="transaction" v-bind:amount="computeNetAmount(transaction)" v-bind:show-extra="true"/>
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

    <DashboardCard style="margin-top: 2rem">
      <template v-slot:title>
        <span class="h-is-secondary-title">Transfers</span>
      </template>
      <template v-slot:content>
        <div class="h-is-property-text">
          <TransferGraphSection v-bind:transaction="transaction"/>
        </div>
      </template>
    </DashboardCard>

    <DashboardCard v-if="contractResult" style="margin-top: 2rem">
      <template v-slot:title>
        <span class="h-is-secondary-title">Contract Result</span>
      </template>

      <template v-slot:leftContent>
        <Property id="result">
          <template v-slot:name>Result</template>
          <template v-slot:value>
            <StringValue :string-value="contractResult?.result"/>
          </template>
        </Property>
        <Property id="from">
          <template v-slot:name>From</template>
          <template v-slot:value>
            <HexaValue :byte-string="contractResult?.from" v-bind:show-none="true"/>
          </template>
        </Property>
        <Property id="to">
          <template v-slot:name>To</template>
          <template v-slot:value>
            <HexaValue :byte-string="contractResult?.to" v-bind:show-none="true"/>
          </template>
        </Property>
        <Property id="type">
          <template v-slot:name>Type</template>
          <template v-slot:value>
            <StringValue :string-value="contractResult?.type?.toString()"/>
          </template>
        </Property>
        <Property id="errorMessage">
          <template v-slot:name>Error Message</template>
          <template v-slot:value>
            <StringValue :string-value="contractResult?.error_message"/>
          </template>
        </Property>
      </template>

      <template v-slot:rightContent>
        <Property id="gasLimit">
          <template v-slot:name>Gas Limit</template>
          <template v-slot:value>
            <PlainAmount :amount="contractResult?.gas_limit"/>
          </template>
        </Property>
        <Property id="gasUsed">
          <template v-slot:name>Gas Used</template>
          <template v-slot:value>
            <PlainAmount :amount="contractResult?.gas_used"/>
          </template>
        </Property>
        <Property id="maxFeePerGas">
          <template v-slot:name>Max Fee Per Gas</template>
          <template v-slot:value>
            <StringValue :string-value="contractResult?.max_fee_per_gas"/>
          </template>
        </Property>
        <Property id="maxPriorityFeePerGas">
          <template v-slot:name>Max Priority Fee Per Gas</template>
          <template v-slot:value>
            <StringValue :string-value="contractResult?.max_priority_fee_per_gas"/>
          </template>
        </Property>
        <Property id="gasPrice">
          <template v-slot:name>Gas Price</template>
          <template v-slot:value>
            <HbarAmount :amount="contractResult?.gas_price ?? 0" :show-extra="true"/>
          </template>
        </Property>
      </template>

    </DashboardCard>

    <DashboardCard v-if="contractResult" style="margin-top: 2rem">
      <template v-slot:title>
        <span class="h-is-secondary-title">Logs</span>
      </template>

      <template v-slot:control>
        <div class="is-flex is-justify-content-flex-end is-align-items-center">
          <button id="prev-block-button" :disabled="logCursor===0"
                  class="button is-white is-small" @click="logCursor-=1">&lt; PREVIOUS
          </button>
          <button id="next-block-button" :disabled="logCursor===contractResult?.logs.length - NB_LOG_DISPLAYED"
                  class="button is-white is-small ml-4" @click="logCursor+=1">NEXT &gt;
          </button>
        </div>
      </template>

      <template v-slot:leftContent>
        <template v-for="logIndex in NB_LOG_DISPLAYED" :key="logIndex">
          <Property id="logIndex">
            <template v-slot:name>Index</template>
            <template v-slot:value>
              <StringValue :string-value="contractResult?.logs[logCursor + logIndex - 1].index.toString()"/>
            </template>
          </Property>
          <Property id="logAddress">
            <template v-slot:name>Address</template>
            <template v-slot:value>
              <HexaValue v-bind:byteString="contractResult?.logs[logCursor + logIndex - 1].address" :show-none="true"/>
            </template>
          </Property>
          <Property id="logData">
            <template v-slot:name>Data</template>
            <template v-slot:value>
              <HexaValue v-bind:byteString="contractResult?.logs[logCursor + logIndex - 1].data" :show-none="true"/>
            </template>
          </Property>
          <Property id="logTopics" v-for="(t, topicIndex) in contractResult?.logs[logCursor + logIndex - 1].topics" :key="t">
            <template v-slot:name>{{ topicIndex === 0 ? "Topics" : "" }}</template>
            <template v-slot:value>
              <div class="is-flex">
                <HexaValue v-bind:byteString="'(' + topicIndex + ') '" class="mr-2"/>
                <HexaValue v-bind:byteString="t" :show-none="true"/>
              </div>
            </template>
          </Property>
          <hr v-if="logIndex < contractResult?.logs.length - 1" class="h-card-separator" style="height: 1px; background: grey"/>
        </template>
      </template>
    </DashboardCard>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeMount, onMounted, ref, watch} from 'vue';
import axios, {AxiosResponse} from "axios";
import {
  AccountBalanceTransactions, BlocksResponse,
  ContractResponse,
  Transaction,
  TransactionByIdResponse,
  TransactionType
} from "@/schemas/HederaSchemas";
import {EntityDescriptor} from "@/utils/EntityDescriptor"
import {normalizeTransactionId, TransactionID} from "@/utils/TransactionID";
import {computeNetAmount, makeOperatorAccountLabel, makeTypeLabel} from "@/utils/TransactionTools";
import {ContractResultDetailsLoader} from "@/components/contract/ContractResultDetailsLoader";
import AccountLink from "@/components/values/AccountLink.vue";
import {base64DecToArr, byteToHex} from "@/utils/B64Utils";
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
import PlainAmount from "@/components/values/PlainAmount.vue";
import {BlocksResponseCollector} from "@/utils/BlocksResponseCollector";
import BlockLink from "@/components/values/BlockLink.vue";

const MAX_INLINE_CHILDREN = 3
const NB_LOG_DISPLAYED = 2

export default defineComponent({

  name: 'TransactionDetailsV2',

  components: {
    BlockLink,
    PlainAmount,
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

    const TRANSACTION_SUCCESS = 'SUCCESS'
    const response = ref<AxiosResponse<TransactionByIdResponse>|null>(null)
    const invalidId = ref(false)
    const got404 = ref(false)
    const transaction = ref<Transaction|null>(null)
    let netAmount = ref(0)
    let entity = ref<EntityDescriptor | null>(null)
    let scheduledTransaction = ref<Transaction | null>(null)
    let schedulingTransaction = ref<Transaction | null>(null)
    let parentTransaction = ref<Transaction | null>(null)
    let childTransactions = ref<Array<Transaction>>([])
    const blockNumber = ref<number | null>(null)
    const logCursor = ref(0)

    const showAllTransactionVisible = computed(() => {
      const count = response.value?.data.transactions?.length ?? 0
      return count >= 2
    })
    const displayAllChildrenLinks = computed(() => childTransactions.value.length > MAX_INLINE_CHILDREN )

    const notification = computed(() => {
      let result
      if (invalidId.value) {
        result = "Invalid transaction ID: " + props.transactionId
      } else if (got404.value) {
        result = "Transaction with ID " + normalizeTransactionId(props.transactionId ?? "", true) + " was not found"
      } else if (transaction.value && transaction.value.result !== TRANSACTION_SUCCESS) {
        result = "Transaction has failed: " + transaction.value?.result
      } else {
        result = null
      }
      return result
    })

    const routeName = computed(() => {
      return entity?.value?.routeName
    })

    const contractResultDetailsLoader = new ContractResultDetailsLoader(
        ref(null),
        ref(null),
        computed(() => props.transactionId ?? null))
    onMounted(() => contractResultDetailsLoader.requestLoad())

    onBeforeMount(() => {
      fetchTransaction()
    })

    watch(() => props.transactionId, () => {
      fetchTransaction()
    });

    watch(() => props.consensusTimestamp, () => {
      fetchTransaction()
    });

    watch(transaction, () => {
        if (transaction.value?.consensus_timestamp) {
          BlocksResponseCollector.instance.fetch(transaction.value.consensus_timestamp)
              .then((r: AxiosResponse<BlocksResponse>) => {
                    blockNumber.value = r.data?.blocks ? (r.data?.blocks[0].number ?? null) : null
                  }
              , (reason: unknown) => {
                console.warn("BlocksResponseCollector failed to find block with reason: " + reason)
                    blockNumber.value = null
              })
        } else {
          blockNumber.value = null
        }
    })

    const fetchTransaction = () => {
      got404.value = false
      invalidId.value = false
      response.value = null
      transaction.value = null

      if (props.transactionId && TransactionID.parse(props.transactionId)) {
        axios
            .get<TransactionByIdResponse>("api/v1/transactions/" + props.transactionId)
            .then(r => {
              response.value = r
              transaction.value = null
              scheduledTransaction.value = null
              schedulingTransaction.value = null
              parentTransaction.value = null
              childTransactions.value = []
              if (r.data.transactions) {
                transaction.value = filter(r.data.transactions, props.consensusTimestamp)
                if (transaction.value != null) {
                  netAmount.value = computeNetAmount(transaction.value)

                  if (transaction.value.entity_id && transaction.value.name === TransactionType.ETHEREUMTRANSACTION) {
                    axios.get<ContractResponse>("api/v1/contracts/" + transaction.value.entity_id)
                        .then(() => entity.value = new EntityDescriptor("Contract ID", "ContractDetails"))
                        .catch(() => {
                          axios.get<AccountBalanceTransactions>("api/v1/accounts/" + transaction.value?.entity_id)
                              .then(() => entity.value = new EntityDescriptor("Account ID", "AccountDetails"))
                              .catch(() => entity.value = new EntityDescriptor("Entity ID", ""))

                        })
                  } else {
                    entity.value = EntityDescriptor.makeEntityDescriptor(transaction.value)
                  }

                  if (r.data.transactions.length >= 2) {
                    scheduledTransaction.value = (transaction.value.name === TransactionType.SCHEDULECREATE)
                        ? lookupScheduledTransaction(r.data.transactions)
                        : null
                    schedulingTransaction.value = transaction.value.scheduled
                        ? lookupSchedulingTransaction(r.data.transactions)
                        : null
                    const children = lookupChildTransactions(r.data.transactions)
                    if (children.length && transaction.value.nonce && transaction.value.nonce > 0) {
                      parentTransaction.value = lookupParentTransaction(r.data.transactions)
                    } else {
                      childTransactions.value = children
                    }
                  }
                }
              }
            })
            .catch(reason => {
              if(axios.isAxiosError(reason) && reason?.request?.status === 404) {
                got404.value = true
              }
            })
      } else {
        invalidId.value = true
      }
    }

    const convertTransactionId = (id: string) => {
      let result: string
      if (id != null) {
        const tid = TransactionID.parse(id)
        result = tid != null ? tid.toString() : id
      } else {
        result = "?"
      }
      return result
    }

    const formatHash = (hash: string | undefined) => {
      return hash != undefined ? byteToHex(base64DecToArr(hash)) : ""
    }

    const computeMaxFee = (t: Transaction) => {
      const result = t.max_fee ? Number.parseFloat(t.max_fee) : 0
      return isNaN(result) ? -9999 : result
    }

    return {
      NB_LOG_DISPLAYED,
      isSmallScreen,
      isTouchDevice,
      transaction,
      netAmount,
      entity,
      notification,
      routeName,
      TRANSACTION_SUCCESS,
      convertTransactionId,
      formatHash,
      computeMaxFee,
      blockNumber,
      logCursor,
      makeTypeLabel,
      computeNetAmount,
      makeOperatorAccountLabel,
      showAllTransactionVisible,
      displayAllChildrenLinks,
      scheduledTransaction,
      schedulingTransaction,
      parentTransaction,
      childTransactions,
      contractResult: contractResultDetailsLoader.entity
    }
  },
});

function filter(transactions: Transaction[], consensusTimestamp: string|undefined): Transaction|null {
  let result: Transaction|null
  if (transactions.length == 1) {
    result = transactions[0]
  } else if (transactions.length >= 2) {
    if (consensusTimestamp) {
      const t = lookupTransactionWithTimestamp(transactions, consensusTimestamp)
      result = t !== null ? t : transactions[0]
    } else {
      const t = lookupScheduledTransaction(transactions)
      result = t !== null ? t : transactions[0]
    }
  } else {
    result = null
  }
  return result
}

function lookupTransactionWithTimestamp(transactions: Transaction[], consensusTimestamp: string): Transaction|null {
  let result: Transaction | null = null
  for (let t of transactions) {
    if (t.consensus_timestamp == consensusTimestamp) {
      result = t
      break
    }
  }
  return result
}

function lookupScheduledTransaction(transactions: Transaction[]): Transaction|null {
  let result: Transaction | null = null
  for (let t of transactions) {
    if (t.scheduled) {
      result = t
      break
    }
  }
  return result
}

function lookupSchedulingTransaction(transactions: Transaction[]): Transaction|null {
  let result: Transaction | null = null
  for (let t of transactions) {
    if (t.name === TransactionType.SCHEDULECREATE) {
      result = t
      break
    }
  }
  return result
}

function lookupParentTransaction(transactions: Transaction[]): Transaction|null {
  let result: Transaction | null = null
  for (let t of transactions) {
    if (t.nonce === 0) {
      result = t
      break
    }
  }
  return result
}

function lookupChildTransactions(transactions: Transaction[]): Transaction[] {
  let result = new Array<Transaction>()
  for (let t of transactions) {
    if (t.nonce && t.nonce > 0) {
      result.push(t)
    }
  }
  return result
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

.columns button{
  vertical-align: initial;
}

</style>