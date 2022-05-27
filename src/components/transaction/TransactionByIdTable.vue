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
      v-model:current-page="currentPage"
      :data="transactions"
      :hoverable="true"
      :narrowed="narrowed"
      :paginated="!isTouchDevice && paginationNeeded"
      :per-page="isMediumScreen ? pageSize : 5"
      :striped="true"
      :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"
      aria-current-label="Current page"
      aria-next-label="Next page"
      aria-page-label="Page"
      aria-previous-label="Previous page"
      customRowKey="consensus_timestamp"
      @click="handleClick"
  >
    <o-table-column v-slot="props" field="consensus_timestamp" label="Time">
      <span>
        <TimestampValue v-bind:timestamp="props.row.consensus_timestamp"/>
        <span v-if="props.row.result !== 'SUCCESS'" class="icon has-text-danger">
          <i class="fas fa-exclamation-triangle"></i>
        </span>
      </span>
    </o-table-column>

    <o-table-column v-slot="props" field="name" label="Type">
      <div class="h-has-pill" style="display: inline-block">
        <div class="h-is-text-size-2">{{ makeTypeLabel(props.row.name) }}</div>
      </div>
    </o-table-column>

    <o-table-column v-slot="props" label="Content">
      <TransactionSummary v-bind:transaction="props.row"/>
    </o-table-column>

    <o-table-column v-slot="props" label="Relationship">
      {{ makeRelationshipLabel(props.row) }}
    </o-table-column>

  </o-table>

  <EmptyTable v-if="!transactions.length"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, PropType, ref, watch} from 'vue';
import {Transaction} from '@/schemas/HederaSchemas';
import {makeRelationshipLabel, makeTypeLabel} from "@/utils/TransactionTools";
import {EntityCacheState} from "@/utils/EntityCache";
import {PlayPauseState} from "@/components/PlayPauseButton.vue";
import router from "@/router";
import TimestampValue from "@/components/values/TimestampValue.vue";
import TransactionSummary from "@/components/transaction/TransactionSummary.vue";
import {TransactionByIdCache} from "@/components/transaction/TransactionByIdCache";
import {ORUGA_MOBILE_BREAKPOINT} from '@/App.vue';
import EmptyTable from "@/components/EmptyTable.vue";

export default defineComponent({
  name: 'TransactionByIdTable',

  components: {EmptyTable, TransactionSummary, TimestampValue },

  props: {
    narrowed: Boolean,
    nbItems: Number,
    transactionId: String,
    cacheState: String as PropType<PlayPauseState>
  },

  setup(props, context) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)

    const DEFAULT_PAGE_SIZE = 15
    const pageSize = props.nbItems ?? DEFAULT_PAGE_SIZE
    const paginationNeeded = computed(() => {
          return transactions.value.length > 5
        }
    )

    // 1) transactions
    let transactions = ref<Array<Transaction>>([])

    // 2) cache
    const cache = new TransactionByIdCache(isTouchDevice ? 15 : 100)
    cache.responseDidChangeCB = () => {
      transactions.value = cache.getEntity()?.transactions ?? []
    }
    cache.stateDidChangeCB = () => {
      let newState: PlayPauseState
      switch (cache.getState()) {
        default:
        case EntityCacheState.Stopped:
          newState = cache.isAutoStopped() ? PlayPauseState.AutoPause : PlayPauseState.Pause
          break
        case EntityCacheState.Updating:
        case EntityCacheState.Ready:
          newState = PlayPauseState.Play
          break
      }
      context.emit('update:cacheState', newState)
    }
    const updateTransactionId = (currentValue: string | undefined) => {
      cache.setTransactionId(currentValue ?? null)
    }
    const updateCacheState = (currentValue: PlayPauseState | undefined) => {
      switch (currentValue ?? PlayPauseState.Play) {
        case PlayPauseState.Pause:
        case PlayPauseState.AutoPause:
          cache.stop()
          break
        case PlayPauseState.Play:
          cache.start()
          break
      }
    }
    updateTransactionId(props.transactionId)
    updateCacheState(props.cacheState)
    watch(() => props.transactionId, (currentValue) => {
      updateTransactionId(currentValue)
      updateCacheState(PlayPauseState.Play)
    })
    watch(() => props.cacheState, (currentValue) => {
      updateCacheState(currentValue)
    })
    onBeforeUnmount(() => {
      cache.stop()
    })

    // 3) handleClick
    const handleClick = (t: Transaction) => {
      router.push({name: 'TransactionDetails',
        params: {transactionId: t.transaction_id},
        query: {t: t.consensus_timestamp}})
    }

    // 4) currentPage
    let currentPage = ref(1)

    return {
      isTouchDevice,
      isMediumScreen,
      pageSize,
      paginationNeeded,
      transactions,
      cache,
      handleClick,
      currentPage,

      // From App
      ORUGA_MOBILE_BREAKPOINT,

      // From TransactionTools
      makeTypeLabel,
      makeRelationshipLabel
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>