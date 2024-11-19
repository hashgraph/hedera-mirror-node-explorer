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
  <NftDetailsTransferGraph
      data-cy="nftTransfers"
      v-bind:class="{
            'mb-4': !compact,
        }"
      v-bind:transaction="transaction"
      v-bind:compact="compact"
  />
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">
import {computed, defineComponent, PropType} from "vue"
import {NftTransactionTransfer} from "@/schemas/MirrorNodeSchemas"
import NftDetailsTransferGraph from "@/components/transfer_graphs/NftDetailsTransferGraph.vue"

export default defineComponent({
  name: "NftTransferGraphSection",
  components: {
    NftDetailsTransferGraph,
  },
  props: {
    transaction: Object as PropType<NftTransactionTransfer>,
    compact: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const displayNftTransfers = computed(
        () =>
            props.transaction?.sender_account_id &&
            props.transaction?.receiver_account_id,
    )

    return {
      displayNftTransfers,
    }
  },
})
</script>
