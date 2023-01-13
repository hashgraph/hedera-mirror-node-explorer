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
  <template v-if="transaction">
    <TransferGraphSection v-if="shouldGraph"
        v-bind:transaction="transaction"
        v-bind:compact="true"/>
    <div v-else-if="isTokenAssociation">
      {{ transaction?.entity_id }}
      <span v-if="tokens.length">
        <i class="fas fa-link mr-1 has-text-grey"></i>
        <TokenExtra :token-id="tokens[0]" :show-name="true"/>
        <span v-if="additionalTokensNumber" class="h-is-smaller h-is-extra-text should-wrap">
          {{ ' ( + ' + additionalTokensNumber + ' more )' }}
        </span>
      </span>
    </div>
    <div v-else class="w250">
      {{ makeSummaryLabel(transaction) }}
    </div>
  </template>
  <div v-else />
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, onMounted, PropType, ref} from "vue";
import {Transaction, TransactionType} from "@/schemas/HederaSchemas";
import {makeSummaryLabel} from "@/utils/TransactionTools";
import TransferGraphSection from "@/components/transfer_graphs/TransferGraphSection.vue";
import {TokenRelationshipLoader} from "@/components/token/TokenRelationshipLoader";
import TokenExtra from "@/components/values/TokenExtra.vue";

const GRAPH_TRANSACTION_TYPES = [
  TransactionType.CRYPTOTRANSFER,
  TransactionType.TOKENBURN,
  TransactionType.TOKENMINT
]

export default defineComponent({
  name: "TransactionSummary",
  components: {TokenExtra, TransferGraphSection},
  props: {
    transaction: Object as PropType<Transaction | undefined>
  },

  setup(props) {

    const shouldGraph = computed(() => {
      return props.transaction?.name && GRAPH_TRANSACTION_TYPES.indexOf(props.transaction.name) != -1
    })

    const isTokenAssociation = computed(() => props.transaction?.name === TransactionType.TOKENASSOCIATE)

    const tokenRelationships = new TokenRelationshipLoader(ref(props.transaction?.entity_id ?? null))
    onMounted(() => tokenRelationships.requestLoad())

    const tokens = computed(
        () => tokenRelationships.lookupTokens(props.transaction?.consensus_timestamp ?? ""))

    const additionalTokensNumber = computed(() => tokens.value.length ?  tokens.value.length - 1 : 0)

    return {
      shouldGraph,
      isTokenAssociation,
      tokens,
      additionalTokensNumber,
      // From TransactionTools
      makeSummaryLabel,
      TransactionType
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
