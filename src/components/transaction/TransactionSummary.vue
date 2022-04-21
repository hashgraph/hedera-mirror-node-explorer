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
    <TransferGraphSection
        v-if="shouldGraph"
        v-bind:transaction="transaction"
        v-bind:compact="true"/>
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

import {computed, defineComponent, PropType} from "vue";
import {Transaction, TransactionType} from "@/schemas/HederaSchemas";
import {makeSummaryLabel} from "@/utils/TransactionTools";
import TransferGraphSection from "@/components/transfer_graphs/TransferGraphSection.vue";

const GRAPH_TRANSACTION_TYPES = [
  TransactionType.CRYPTOTRANSFER,
  TransactionType.TOKENCREATION,
  TransactionType.TOKENBURN,
  TransactionType.TOKENMINT
]

export default defineComponent({
  name: "TransactionSummary",
  components: {TransferGraphSection},
  props: {
    transaction: Object as PropType<Transaction|undefined>
  },

  setup(props) {

    const shouldGraph = computed(() => {
      return props.transaction?.name && GRAPH_TRANSACTION_TYPES.indexOf(props.transaction.name) != -1
    })
    return {
      shouldGraph,

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
