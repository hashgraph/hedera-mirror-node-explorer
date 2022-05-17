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
        <span class="h-is-primary-title">Transaction </span>
        <span class="h-is-secondary-text mr-3">{{ transaction ? convertTransactionId(transactionId) : "" }}</span>
        <span v-if="showAllTransactionVisible" class="is-inline-block" id="allTransactionsLink">
          <router-link :to="{name: 'TransactionsById', params: {transactionId: transactionId}}">
            <span class="h-is-property-text has-text-grey">See all transactions with the same ID</span>
          </router-link>
        </span>
     </template>

      <template v-slot:table>

        <NotificationBanner v-if="notification" :message="notification"/>

        <div class="columns h-is-property-text">

          <div class="column">
            <Property :id="'transactionType'">
              <template v-slot:name>Type</template>
              <template v-slot:value>
                {{ transaction ? makeTypeLabel(transaction.name) : "" }}
              </template>
            </Property>
            <Property :id="'consensusAt'">
              <template v-slot:name>Consensus at</template>
              <template v-slot:value>
                <TimestampValue v-bind:timestamp="transaction?.consensus_timestamp" v-bind:show-none="true" />
              </template>
            </Property>
            <Property :id="'transactionHash'">
              <template v-slot:name>Transaction Hash</template>
              <template v-slot:value>
                <HexaValue v-bind:byteString="transaction ? formatHash(transaction?.transaction_hash): undefined" v-bind:show-none="true"/>
              </template>
            </Property>
            <Property :id="'netAmount'">
              <template v-slot:name>Net Amount</template>
              <template v-slot:value>
                <HbarAmount v-if="transaction" v-bind:amount="computeNetAmount(transaction)" v-bind:show-extra="true"/>
              </template>
            </Property>
            <Property :id="'chargedFee'">
              <template v-slot:name>Charged Fee</template>
              <template v-slot:value>
                <HbarAmount v-if="transaction" v-bind:amount="transaction.charged_tx_fee" v-bind:show-extra="true"/>
              </template>
            </Property>
            <Property :id="'maxFee'">
              <template v-slot:name>Max fee</template>
              <template v-slot:value>
                <HbarAmount v-if="transaction" v-bind:amount="computeMaxFee(transaction)" v-bind:show-extra="true"/>
              </template>
            </Property>
          </div>

          <div class="column">
            <Property v-if="transaction?.entity_id" :id="'entityId'">
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
            <Property :id="'memo'">
              <template v-slot:name>Memo</template>
              <template v-slot:value>
                <BlobValue :blob-value="transaction?.memo_base64" :show-none="true" :base64="true" class="should-wrap"/>
              </template>
            </Property>
            <Property :id="'operatorAccount'">
              <template v-slot:name>Operator Account</template>
              <template v-slot:value>
                <AccountLink v-if="transaction" v-bind:accountId="makeOperatorAccountLabel(transaction)" v-bind:show-extra="true"/>
              </template>
            </Property>
            <Property :id="'nodeAccount'">
              <template v-slot:name>Node Account</template>
              <template v-slot:value>
                <AccountLink v-if="transaction" v-bind:accountId="transaction?.node" v-bind:show-extra="true"/>
              </template>
            </Property>
            <Property :id="'duration'">
              <template v-slot:name>Duration</template>
              <template v-slot:value>
                {{ transaction ? transaction.valid_duration_seconds : "" }} seconds
              </template>
            </Property>
            <Property :id="'scheduled'">
              <template v-slot:name>Scheduled</template>
              <template v-slot:value>
                {{ transaction ? transaction.scheduled : "" }}
              </template>
            </Property>
          </div>

        </div>

        <div class="h-is-property-text">
          <TransferGraphSection v-bind:transaction="transaction"/>
        </div>

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
import axios, {AxiosResponse} from "axios";
import {Transaction, TransactionByIdResponse} from "@/schemas/HederaSchemas";
import {EntityDescriptor} from "@/utils/EntityDescriptor"
import {normalizeTransactionId, TransactionID} from "@/utils/TransactionID";
import {computeNetAmount, makeOperatorAccountLabel, makeTypeLabel} from "@/utils/TransactionTools";
import AccountLink from "@/components/values/AccountLink.vue";
import {base64DecToArr, byteToHex} from "@/utils/B64Utils";
import HexaValue from "@/components/values/HexaValue.vue";
import TimestampValue from "@/components/values/TimestampValue.vue";
import EntityLink from "@/components/values/EntityLink.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";
import BlobValue from "@/components/values/BlobValue.vue";
import TransferGraphSection from "@/components/transfer_graphs/TransferGraphSection.vue";
import Footer from "@/components/Footer.vue";
import NotificationBanner from "@/components/NotificationBanner.vue";
import Property from "@/components/Property.vue";

export default defineComponent({

  name: 'TransactionDetails',

  components: {
    Property,
    NotificationBanner,
    Footer,
    HbarAmount, BlobValue,
    DashboardCard, EntityLink, AccountLink,
    HexaValue, TimestampValue, TransferGraphSection,
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

    const notification = computed(() => {
      let result
      if (invalidId.value) {
        result =  "Invalid transaction ID: " + props.transactionId
      } else if(got404.value) {
        result =  "Transaction with ID " + normalizeTransactionId(props.transactionId ?? "", true) + " was not found"
      } else if (transaction.value && transaction.value.result !== TRANSACTION_SUCCESS) {
        result =  "Transaction has failed: " + transaction.value?.result
      } else {
        result = null
      }
      return result
    })

    onBeforeMount(() => {
      fetchTransaction()
    })

    watch(() => props.transactionId, () => {
      fetchTransaction()
    });

    const routeName = computed(() => {
      return entity?.value?.routeName
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
              transaction.value = r.data.transactions ? filter(r.data.transactions, props.consensusTimestamp) : null
              if (transaction.value != null) {
                netAmount.value = computeNetAmount(transaction.value)
                entity.value = EntityDescriptor.makeEntityDescriptor(transaction.value)
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

    const showAllTransactionVisible = computed(() => {
      const transactionCount = response.value?.data.transactions?.length ?? 0
      return transactionCount >= 2
    })

    return {
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

      makeTypeLabel,
      computeNetAmount,
      makeOperatorAccountLabel,
      showAllTransactionVisible
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

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

.columns button{
  vertical-align: initial;
}

</style>