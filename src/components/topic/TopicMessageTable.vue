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

  <div id="topic-message-table">
    <o-table
        v-model:current-page="currentPage"
        :data="messages"
        :paginated="paginationNeeded"
        :per-page="pageSize"
        :striped="true"
        :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"
        aria-current-label="Current page"
        aria-next-label="Next page"
        aria-page-label="Page"
        aria-previous-label="Previous page"
        customRowKey="sequence_number"
        default-sort="sequence_number"
    >
      <o-table-column v-slot="props" field="sequence_number" label="Sequence #">
        <div class="is-numeric">
          {{ props.row.sequence_number != null ? props.row.sequence_number : "" }}
        </div>
      </o-table-column>

      <o-table-column v-slot="props" field="consensus_timestamp" label="Time">
        <TimestampValue v-bind:timestamp="props.row.consensus_timestamp"/>
      </o-table-column>

      <o-table-column v-slot="props" field="message" label="Message">
        <div class="should-wrap">
          <BlobValue v-bind:blob-value="props.row.message" v-bind:base64="true" v-bind:show-none="true"/>
        </div>
      </o-table-column>

    </o-table>
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, onBeforeUnmount, PropType, ref, watch} from 'vue';

import {TopicMessage} from "@/schemas/HederaSchemas"
import {EntityCacheState} from "@/utils/EntityCache";
import {TopicMessageCache} from "@/components/topic/TopicMessageCache";
import {PlayPauseState} from "@/components/PlayPauseButton.vue";
import TimestampValue from "@/components/values/TimestampValue.vue";
import BlobValue from "@/components/values/BlobValue.vue";
import { ORUGA_MOBILE_BREAKPOINT } from '@/App.vue';

export default defineComponent({

  name: 'TopicMessageTable',

  components: {BlobValue, TimestampValue},

  props: {
    topicId: {
      type: String,
      required: true
    },
    nbItems: Number,
    cacheState: String as PropType<PlayPauseState>
  },

  setup(props, context) {

    const DEFAULT_PAGE_SIZE = 15

    const pageSize = props.nbItems ?? DEFAULT_PAGE_SIZE
    const paginationNeeded = computed(() => {
          return messages.value.length > pageSize
        }
    )

    // 1) messages
    let messages = ref<Array<TopicMessage>>([])

    // 2) cache
    const cache = new TopicMessageCache(props.topicId)

    cache.responseDidChangeCB = () => {
      messages.value = cache.getEntity()?.messages ?? []
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

    updateCacheState(props.cacheState)

    watch(() => props.topicId, (currentValue) => {
          cache.setTopicId(currentValue)
          cache.start()
        }
    )

    watch(() => props.cacheState, (currentValue) => {
      updateCacheState(currentValue)
    })

    onBeforeUnmount(() => {
      cache.stop()
    })

    // 3) currentPage
    let currentPage = ref(1)

    return {
      pageSize,
      paginationNeeded,
      messages,
      cache,
      currentPage,
      ORUGA_MOBILE_BREAKPOINT
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>
#topic-message-table table.o-table > tbody > tr {
  cursor:default;
}
</style>
