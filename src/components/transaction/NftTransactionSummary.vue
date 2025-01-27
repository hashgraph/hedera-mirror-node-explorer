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
  <template v-if="transaction">
    <NftDetailsTransferGraph v-if="shouldGraph" :transaction="transactionDetail"/>
    <div v-else-if="isTokenAssociation">
      {{ transaction?.sender_account_id }}
      <span v-if="tokens.length">
                <i class="fas fa-link mr-1 has-text-grey"></i>
                <TokenExtra :token-id="tokens[0]"/>
                <span
                    v-if="additionalTokensNumber"
                    class="h-is-smaller h-is-extra-text should-wrap"
                >
                    {{ " ( + " + additionalTokensNumber + " more )" }}
                </span>
            </span>
    </div>
    <div v-else/>
  </template>
  <div v-else/>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, PropType,} from "vue"
import {NftTransactionTransfer, TransactionType,} from "@/schemas/MirrorNodeSchemas"
import TokenExtra from "@/components/values/link/TokenExtra.vue"
import {NftTransactionAnalyzer} from "./NftTransactionAnalyzer"
import NftDetailsTransferGraph from "@/components/transfer_graphs/NftDetailsTransferGraph.vue";

const GRAPH_TRANSACTION_TYPES = [
  TransactionType.CRYPTOTRANSFER,
  TransactionType.TOKENBURN,
  TransactionType.TOKENMINT,
]

const props = defineProps({
  transaction: Object as PropType<NftTransactionTransfer | undefined>,
})

const shouldGraph = computed(() => {
  return (
      props.transaction?.type &&
      GRAPH_TRANSACTION_TYPES.indexOf(props.transaction.type) != -1
  )
})

const transactionAnalyzer = new NftTransactionAnalyzer(
    computed(() => props.transaction ?? null),
)
onMounted(() => transactionAnalyzer.mount())
onBeforeUnmount(() => transactionAnalyzer.unmount())

const additionalTokensNumber = computed(() =>
    Math.max(0, transactionAnalyzer.tokens.value.length - 1),
)

const transactionDetail = computed(() => {
  return props.transaction
})

const isTokenAssociation = transactionAnalyzer.isTokenAssociation
const tokens = transactionAnalyzer.tokens

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
