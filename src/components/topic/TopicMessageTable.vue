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
        :paginated="!isTouchDevice && paginationNeeded"
        :per-page="isMediumScreen ? pageSize : 5"
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
    <EmptyTable v-if="!messages.length"/>
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, PropType, ref} from 'vue';

import {TopicMessage} from "@/schemas/HederaSchemas"
import TimestampValue from "@/components/values/TimestampValue.vue";
import BlobValue from "@/components/values/BlobValue.vue";
import {ORUGA_MOBILE_BREAKPOINT} from '@/App.vue';
import EmptyTable from "@/components/EmptyTable.vue";

export default defineComponent({

  name: 'TopicMessageTable',

  components: {EmptyTable, BlobValue, TimestampValue},

  props: {
    nbItems: Number,
    messages: {
      type: Array as PropType<Array<TopicMessage>>,
      default: () => []
    }
  },

  setup(props) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)

    const DEFAULT_PAGE_SIZE = 15
    const pageSize = props.nbItems ?? DEFAULT_PAGE_SIZE
    const paginationNeeded = computed(() => {
          return props.messages.length > pageSize
        }
    )

    // 3) currentPage
    let currentPage = ref(1)

    return {
      isTouchDevice,
      isMediumScreen,
      pageSize,
      paginationNeeded,
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
