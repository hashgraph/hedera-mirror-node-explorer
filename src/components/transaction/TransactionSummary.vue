// SPDX-License-Identifier: Apache-2.0

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                     TEMPLATE                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>
  <template v-if="transaction">
    <TransferGraphSection
      v-if="shouldGraph"
      :transaction="transactionDetail"
      :compact="true"
    />
    <div v-else-if="isTokenAssociation">
      {{ transaction?.entity_id }}
      <span v-if="tokens.length">
        <i class="fas fa-link mr-1 h-is-low-contrast" />
        <TokenExtra :token-id="tokens[0]" />
        <span
          v-if="additionalTokensNumber"
          class="h-is-smaller h-is-extra-text h-should-wrap"
        >
          {{ ' ( + ' + additionalTokensNumber + ' more )' }}
        </span>
      </span>
    </div>
    <div v-else-if="isEthereumTransaction">
      {{ ethereumSummary }}
    </div>
    <div
      v-else
      class="h-should-wrap"
    >
      {{ makeSummaryLabel(transaction) }}
    </div>
  </template>
  <div v-else />
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, onBeforeUnmount, onMounted, PropType} from "vue";
import {Transaction, TransactionDetail, TransactionType} from "@/schemas/MirrorNodeSchemas";
import {makeSummaryLabel} from "@/utils/TransactionTools";
import TransferGraphSection from "@/components/transfer_graphs/TransferGraphSection.vue";
import {TransactionAnalyzer} from "@/components/transaction/TransactionAnalyzer";
import TokenExtra from "@/components/values/link/TokenExtra.vue";

const GRAPH_TRANSACTION_TYPES = [
  TransactionType.CRYPTOTRANSFER,
  TransactionType.TOKENBURN,
  TransactionType.TOKENMINT,
  TransactionType.TOKENREJECT,
  TransactionType.TOKENAIRDROP,
  TransactionType.TOKENCLAIMAIRDROP
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

    const transactionAnalyzer = new TransactionAnalyzer(computed(() => props.transaction ?? null))
    onMounted(() => transactionAnalyzer.mount())
    onBeforeUnmount(() => transactionAnalyzer.unmount())

    const additionalTokensNumber = computed(
        () => Math.max(0, transactionAnalyzer.tokens.value.length - 1))

    const ethereumSummary = computed(() => {
      let result
      if (transactionAnalyzer.entityId.value !== null) {
        result = transactionAnalyzer.contractId.value !== null
            ? 'Contract ID: ' + transactionAnalyzer.entityId.value
            : 'Account ID: ' + transactionAnalyzer.entityId.value
      } else {
        result = ""
      }
      return result
    })

    const transactionDetail = computed(() => {
      return props.transaction as TransactionDetail | undefined
    })

    return {
      shouldGraph,
      isTokenAssociation: transactionAnalyzer.isTokenAssociation,
      tokens: transactionAnalyzer.tokens,
      additionalTokensNumber,
      isEthereumTransaction: transactionAnalyzer.isEthereumTransaction,
      ethereumSummary,
      // From TransactionTools
      makeSummaryLabel,
      TransactionType,
      transactionDetail
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style />
