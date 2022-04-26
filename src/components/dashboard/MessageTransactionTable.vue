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
      :narrowed="true"
      :paginated="true"
      :per-page="nbItems ?? 15"
      :striped="true"
      :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"
      aria-current-label="Current page"
      aria-next-label="Next page"
      aria-page-label="Page"
      aria-previous-label="Previous page"
      customRowKey="consensus_timestamp"
      default-sort="consensus_timestamp"
      @click="handleClick"
  >

    <o-table-column v-slot="props" field="topic_id" label="Topic ID">
      <div class="w200 is-numeric">
        {{ props.row.entity_id ?? "" }}
      </div>
    </o-table-column>

    <o-table-column v-slot="props" field="memo" label="Memo">
      <div class="w250">
        <BlobValue v-bind:blob-value="props.row.memo_base64" v-bind:base64="true" v-bind:show-none="true"/>
      </div>
    </o-table-column>

    <o-table-column v-slot="props" field="consensus_timestamp" label="Time">
      <TimestampValue v-bind:timestamp="props.row.consensus_timestamp"/>
    </o-table-column>

  </o-table>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, onBeforeUnmount, PropType, ref, watch} from 'vue';
import {Transaction, TransactionType} from "@/schemas/HederaSchemas";
import {EntityCacheState} from "@/utils/EntityCache";
import {TransactionCache} from "@/components/transaction/TransactionCache";
import {PlayPauseState} from "@/components/PlayPauseButton.vue";
import TimestampValue from "@/components/values/TimestampValue.vue";
import router from "@/router";
import BlobValue from "@/components/values/BlobValue.vue";
import { ORUGA_MOBILE_BREAKPOINT } from '@/App.vue';

export default defineComponent({
  name: 'MessageTransactionTable',

  components: {TimestampValue, BlobValue},

  props: {
    nbItems: Number,
    accountIdFilter: String,
    cacheState: String as PropType<PlayPauseState>
  },

  setup(props, context) {

    // 1) transactions
    let transactions = ref<Array<Transaction>>([])

    // 2) cache
    const cache = new TransactionCache()
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
    const updateCacheAccountId = (currentValue: string | undefined) => {
      cache.setAccountId(currentValue ?? null)
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
    cache.setTransactionType(TransactionType.CONSENSUSSUBMITMESSAGE)
    updateCacheAccountId(props.accountIdFilter)
    updateCacheState(props.cacheState)
    watch(() => props.accountIdFilter, (currentValue) => {
      updateCacheAccountId(currentValue)
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
      router.push({name: 'TransactionDetails', params: {transactionId: t.transaction_id}, query: {t: t.consensus_timestamp}})
    }

    // 4) currentPage
    let currentPage = ref(1)

    return {
      transactions,
      cache,
      handleClick,
      currentPage,
      ORUGA_MOBILE_BREAKPOINT
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>