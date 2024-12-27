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

  <PageFrameV2 page-title="Transactions by ID">
    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Transactions with ID </span>
        <span class="h-is-secondary-text">{{ normalizedTransactionId }}</span>
      </template>
      <template v-slot:content>
        <TransactionByIdTable v-bind:transactions="transactions"/>
      </template>
    </DashboardCard>
  </PageFrameV2>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, onBeforeUnmount, onMounted} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";
import TransactionByIdTable from "@/components/transaction/TransactionByIdTable.vue";
import {TransactionID} from "@/utils/TransactionID";
import PageFrameV2 from "@/components/page/PageFrameV2.vue";
import {TransactionGroupCache} from "@/utils/cache/TransactionGroupCache";

export default defineComponent({
  name: 'TransactionsById',

  props: {
    network: String,
    transactionId: String
  },

  components: {
    PageFrameV2,
    DashboardCard,
    TransactionByIdTable,
  },

  setup(props) {

    const normalizedTransactionId = computed(() => {
      return props.transactionId ? TransactionID.normalizeForDisplay(props.transactionId) : "?";
    })

    const paramTransactionId = computed(() => {
      return props.transactionId ? TransactionID.normalize(props.transactionId) : null
    })

    const groupLookup = TransactionGroupCache.instance.makeLookup(paramTransactionId)
    onMounted(() => groupLookup.mount())
    onBeforeUnmount(() => groupLookup.unmount())

    const transactions = computed(() => groupLookup.entity.value ?? [])

    return {
      transactions,
      normalizedTransactionId
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
