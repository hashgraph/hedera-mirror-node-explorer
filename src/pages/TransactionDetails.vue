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

  <section class="section">

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

        <div v-if="transaction && transaction?.result !== TRANSACTION_SUCCESS" class="hero is-small is-danger mb-5 has-text-centered">
          <div class="hero-body h-is-tertiary-text">
            <span>Transaction has failed: {{ transaction?.result }}</span>
          </div>
        </div>

        <div class="columns h-is-property-text">

          <div class="column">

            <div class="columns">
              <div class="column is-one-third  has-text-weight-light">
                Type
              </div>
              <div class="column" id="transactionType">
                {{ transaction ? makeTypeLabel(transaction.name) : "" }}
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-third  has-text-weight-light">
                Consensus at
              </div>
              <div class="column" id="consensusAt">
                <TimestampValue v-bind:timestamp="transaction?.consensus_timestamp" v-bind:show-none="true" />
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-third  has-text-weight-light">
                Transaction Hash
              </div>
              <div class="column" id="transactionHash">
                <HexaValue v-bind:byteString="transaction ? formatHash(transaction?.transaction_hash): undefined" v-bind:show-none="true"/>
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-third  has-text-weight-light">
                Net Amount
              </div>
              <div class="column" id="netAmount">
                <template v-if="transaction">
                  <HbarAmount v-bind:amount="computeNetAmount(transaction)" v-bind:show-extra="true"/>
                </template>
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-third  has-text-weight-light">
                Charged Fee
              </div>
              <div class="column" id="chargedFee">
                <template v-if="transaction">
                  <HbarAmount v-bind:amount="transaction.charged_tx_fee" v-bind:show-extra="true"/>
                </template>
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-third  has-text-weight-light">
                Max fee
              </div>
              <div class="column" id="maxFee">
                <template v-if="transaction">
                  <HbarAmount v-bind:amount="computeMaxFee(transaction)" v-bind:show-extra="true"/>
                </template>
              </div>
            </div>

          </div>

          <div class="column">

            <div v-if="transaction?.entity_id" id="entityKV" class="columns">
              <div class="column is-one-third  has-text-weight-light">
                {{ entity?.label }}
              </div>
              <div id="entityId" class="column">
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
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-third  has-text-weight-light">
                Memo
              </div>
              <div class="column should-wrap" id="memo">
                <BlobValue v-bind:blob-value="transaction?.memo_base64" v-bind:show-none="true" v-bind:base64="true"/>
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-third  has-text-weight-light">
                Operator Account
              </div>
              <div v-if="transaction" class="column" id="operatorAccount">
                <AccountLink v-bind:accountId="makeOperatorAccountLabel(transaction)" v-bind:show-extra="true"/>
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-third  has-text-weight-light">
                Node Account
              </div>
              <div v-if="transaction" class="column" id="nodeAccount">
                <AccountLink v-bind:accountId="transaction?.node" v-bind:show-extra="true"/>
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-third  has-text-weight-light">
                Duration
              </div>
              <div class="column" id="duration">
                {{ transaction ? transaction.valid_duration_seconds : "" }} seconds
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-third  has-text-weight-light">
                Scheduled
              </div>
              <div class="column" id="scheduled">
                {{ transaction ? transaction.scheduled : "" }}
              </div>
            </div>

          </div>

        </div>

        <div class="h-is-property-text">
          <TransferGraphSection v-bind:transaction="transaction"/>
        </div>

      </template>
    </DashboardCard>

  </section>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, onBeforeMount, ref, watch} from 'vue';
import axios, {AxiosResponse} from "axios";
import {Transaction, TransactionByIdResponse} from "@/schemas/HederaSchemas";
import {EntityDescriptor} from "@/utils/EntityDescriptor"
import {TransactionID} from "@/utils/TransactionID";
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

export default defineComponent({

  name: 'TransactionDetails',

  components: {
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

    const TRANSACTION_SUCCESS = 'SUCCESS'
    const response = ref<AxiosResponse<TransactionByIdResponse>|null>(null)
    const transaction = ref<Transaction|null>(null)
    let netAmount = ref(0)
    let entity = ref<EntityDescriptor|null>(null)

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
      axios
          .get<TransactionByIdResponse>("api/v1/transactions/" + props.transactionId)
          .then(r => {
            response.value = r
            transaction.value = r.data.transactions ? filter(r.data.transactions, props.consensusTimestamp) : null
            if (transaction.value != null) {
              netAmount.value = computeNetAmount(transaction.value);
              entity.value = EntityDescriptor.makeEntityDescriptor(transaction.value);
            }
          });
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
      transaction,
      netAmount,
      entity,
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