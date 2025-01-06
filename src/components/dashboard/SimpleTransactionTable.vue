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

  <o-table
      :data="transactions"
      :loading="loading"
      :per-page="perPage"
      @cell-click="handleClick"

      :hoverable="true"
      :narrowed="true"
      :striped="true"
      :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"

      customRowKey="consensus_timestamp"
  >

    <o-table-column v-slot="props" field="transaction_id" label="ID">
      <TransactionLabel :transaction-id="props.row.transaction_id" :result="props.row.result"/>
    </o-table-column>

    <o-table-column v-slot="props" label="CONTENT">
      <TransactionSummary :transaction="props.row"/>
    </o-table-column>

    <o-table-column v-slot="props" field="consensus_timestamp" label="TIME">
      <TimestampValue :timestamp="props.row.consensus_timestamp"/>
    </o-table-column>

  </o-table>

  <EmptyTable v-if="!transactions.length"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {PropType} from 'vue';
import {Transaction} from "@/schemas/MirrorNodeSchemas";
import TimestampValue from "@/components/values/TimestampValue.vue";
import TransactionLabel from "@/components/values/TransactionLabel.vue";
import {routeManager} from "@/router";
import TransactionSummary from "@/components/transaction/TransactionSummary.vue";
import {ORUGA_MOBILE_BREAKPOINT} from "@/BreakPoints";
import EmptyTable from "@/components/EmptyTable.vue";
import {TransactionTableController} from "@/components/transaction/TransactionTableController";

const props = defineProps({
  controller: {
    type: Object as PropType<TransactionTableController>,
    required: true
  }
})

const handleClick = (t: Transaction, c: unknown, i: number, ci: number, event: MouseEvent) => {
  routeManager.routeToTransaction(t, event)
}

const transactions = props.controller.rows
const loading = props.controller.loading
const perPage = props.controller.pageSize

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
