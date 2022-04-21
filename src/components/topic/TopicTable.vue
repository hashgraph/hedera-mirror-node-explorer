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

  <o-table
      :data="transactions"
      :hoverable="true"
      :paginated="true"
      :per-page="nbItems ?? 15"
      :striped="true"
      :v-model:current-page="currentPage"
      aria-current-label="Current page"
      aria-next-label="Next page"
      aria-page-label="Page"
      aria-previous-label="Previous page"
      customRowKey="topic_id"
      default-sort="topic_id"
      @click="handleClick"
  >
    <o-table-column v-slot="props" field="topic_id" label="Topic">
      <div class="is-numeric">
        {{ props.row.entity_id }}
      </div>
    </o-table-column>

    <o-table-column v-slot="props" field="created" label="Created">
      <TimestampValue v-bind:timestamp="props.row.valid_start_timestamp"/>
    </o-table-column>

    <o-table-column v-slot="props" field="memo" label="Memo">
      <div class="w600">
        <BlobValue v-bind:blob-value="props.row.memo_base64" v-bind:base64="true" v-bind:show-none="true"/>
      </div>
    </o-table-column>

  </o-table>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, onBeforeUnmount, onMounted, ref} from 'vue';
import {Transaction, TransactionResult, TransactionType} from "@/schemas/HederaSchemas";
import {TransactionCache} from "@/components/transaction/TransactionCache";
import TimestampValue from "@/components/values/TimestampValue.vue";
import router from "@/router";
import BlobValue from "@/components/values/BlobValue.vue";

export default defineComponent({
  name: 'TopicTable',

  components: {BlobValue, TimestampValue},

  props: {
    nbItems: Number,
  },

  setup() {

    const transactionTypeFilter = TransactionType.CONSENSUSCREATETOPIC
    const transactionResultFilter = TransactionResult.SUCCESS

    // 1) transactions
    let transactions = ref<Array<Transaction>>([])

    // 2) cache
    const cache = new TransactionCache()
    cache.setTransactionType(transactionTypeFilter)
    cache.setTransactionResult(transactionResultFilter)

    cache.responseDidChangeCB = () => {
      transactions.value = cache.getEntity()?.transactions ?? []
    }

    onMounted(() => {
      cache.start()
    })
    onBeforeUnmount(() => {
      cache.stop()
    })

    // 3) handleClick
    const handleClick = (t: Transaction) => {
      router.push({name: 'TopicDetails', params: {topicId: t.entity_id}})
    }

    // 4) currentPage
    let currentPage = ref(1)

    return {
      transactions,
      cache,
      handleClick,
      currentPage,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>