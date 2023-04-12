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

  <template v-if="netAmount > 0">

    <HbarTransferGraphC
        v-if="compact"
        data-cy="hbarTransfers"
        v-bind:transaction="transaction"/>
    <HbarTransferGraphF
        v-else
        data-cy="hbarTransfers"
        v-bind:transaction="transaction" title="Hbar Transfers"/>
    <br/>

  </template>

  <NftTransferGraph
      data-cy="nftTransfers"
      :class="{'mb-4': !compact}"
      v-bind:transaction="transaction"
      v-bind:compact="compact"/>

  <TokenTransferGraphC
      data-cy="tokenTransfers"
      v-if="compact"
      v-bind:transaction="transaction"/>
  <TokenTransferGraphF
      data-cy="tokenTransfers"
      v-else
      v-bind:transaction="transaction"/>

  <template v-if="netAmount === 0 && !compact">
    <HbarTransferGraphF
        data-cy="feeTransfers"
        class="mt-4"
        v-bind:transaction="transaction" title="Fee Transfers" :show-none="true"/>
  </template>


</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, PropType} from "vue";
import {TransactionDetail} from "@/schemas/HederaSchemas";
import HbarTransferGraphC from "@/components/transfer_graphs/HbarTransferGraphC.vue";
import HbarTransferGraphF from "@/components/transfer_graphs/HbarTransferGraphF.vue";
import NftTransferGraph from "@/components/transfer_graphs/NftTransferGraph.vue";
import TokenTransferGraphC from "@/components/transfer_graphs/TokenTransferGraphC.vue";
import TokenTransferGraphF from "@/components/transfer_graphs/TokenTransferGraphF.vue";
import {computeNetAmount} from "@/utils/TransactionTools";

export default defineComponent({
  name: "TransferGraphSection",
  components: {
    NftTransferGraph,
    TokenTransferGraphC,
    TokenTransferGraphF,
    HbarTransferGraphC,
    HbarTransferGraphF,
  },
  props: {
    transaction: Object as PropType<TransactionDetail>,
    compact: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {

    const netAmount = computed(() => {
      return props.transaction ? computeNetAmount(props.transaction) : 0
    })

    return {
      netAmount,
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
