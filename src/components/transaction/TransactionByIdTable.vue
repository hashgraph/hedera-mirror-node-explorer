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
      v-model:current-page="currentPage"
      :data="props.transactions"
      :hoverable="true"
      :narrowed="props.narrowed"
      :paginated="!isTouchDevice && paginationNeeded"
      pagination-order="centered"
      :range-before="1"
      :range-after="1"
      :per-page="isMediumScreen ? pageSize : 5"
      :striped="true"
      :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"
      aria-current-label="Current page"
      aria-next-label="Next page"
      aria-page-label="Page"
      aria-previous-label="Previous page"
      customRowKey="consensus_timestamp"
      @cell-click="handleClick"
  >
    <o-table-column v-slot="props" field="consensus_timestamp" label="TIME">
      <span>
        <TimestampValue class="h-is-bold" v-bind:timestamp="props.row.consensus_timestamp"/>
        <span v-if="props.row.result !== 'SUCCESS'" class="icon has-text-danger">
          <i class="fas fa-exclamation-triangle"></i>
        </span>
      </span>
    </o-table-column>

    <o-table-column v-slot="props" field="name" label="TYPE">
      <div class="h-has-pill" style="display: inline-block">
        {{ makeTypeLabel(props.row.name) }}
      </div>
    </o-table-column>

    <o-table-column v-slot="props" label="CONTENT">
      <TransactionSummary v-bind:transaction="props.row"/>
    </o-table-column>

    <o-table-column v-if="showRelationship" v-slot="props" label="RELATIONSHIP">
      {{ makeRelationshipLabel(props.row) }}
    </o-table-column>

    <o-table-column v-if="showNonce" v-slot="props" label="NONCE">
      {{ props.row.nonce }}
    </o-table-column>

  </o-table>

  <EmptyTable v-if="!props.transactions.length"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, inject, PropType, ref} from 'vue';
import {Transaction, TransactionType} from '@/schemas/MirrorNodeSchemas.ts';
import {makeTypeLabel} from "@/utils/TransactionTools";
import {routeManager} from "@/router";
import TimestampValue from "@/components/values/TimestampValue.vue";
import TransactionSummary from "@/components/transaction/TransactionSummary.vue";
import {ORUGA_MOBILE_BREAKPOINT} from "@/BreakPoints";
import EmptyTable from "@/components/EmptyTable.vue";

const props = defineProps({
  narrowed: Boolean,
  nbItems: Number,
  transactions: {
    type: Array as PropType<Array<Transaction>>,
    default: () => []
  }
})

const isTouchDevice = inject('isTouchDevice', false)
const isMediumScreen = inject('isMediumScreen', true)

const DEFAULT_PAGE_SIZE = 15
const pageSize = props.nbItems ?? DEFAULT_PAGE_SIZE
const paginationNeeded = computed(() => {
      return props.transactions.length > 5
    }
)
const showRelationship = computed(() => props.transactions.length >= 1 && makeRelationshipLabel(props.transactions[0]))
const showNonce = computed(() => props.transactions.length >= 2 && !props.transactions[1].scheduled)

const handleClick = (t: Transaction, c: unknown, i: number, ci: number, event: MouseEvent) => {
  routeManager.routeToTransaction(t, event)
}

let currentPage = ref(1)

const hasChild = computed(() => {
  let result = false
  for (const tx of props.transactions) {
    if (tx.parent_consensus_timestamp) {
      result = true
      break
    }
  }
  return result
})

const makeRelationshipLabel = (row: Transaction): string => {
  let result: string
  if (row.name === TransactionType.SCHEDULECREATE) {
    result = "Schedule Create"
  } else if (row.scheduled) {
    result = "Scheduled"
  } else if (hasChild.value) {
    if (row.nonce && row.nonce > 0) {
      result = "Child"
    } else {
      result = "Parent"
    }
  } else {
    result = ""
  }
  return result
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
