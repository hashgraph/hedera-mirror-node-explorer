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

  <div id="topic-message-table">
    <o-table
        :data="messages"
        :loading="loading"
        :paginated="!isTouchDevice && paginated"
        backend-pagination
        pagination-order="left"
        :range-before="0"
        :range-after="0"
        :total="total"
        v-model:current-page="currentPage"
        :per-page="perPage"
        focusable
        @page-change="onPageChange"
        @cell-click="handleClick"

        :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"

        aria-current-label="Current page"
        aria-next-label="Next page"
        aria-page-label="Page"
        aria-previous-label="Previous page"
        customRowKey="consensus_timestamp"
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
          <BlobValue :blob-value="props.row.message" :base64="true" :show-none="true"/>
        </div>
      </o-table-column>

      <template v-slot:bottom-left>
        <TablePageSize
            v-model:size="perPage"
            :storage-key="AppStorage.TOPIC_MESSAGE_TABLE_PAGE_SIZE_KEY"
        />
      </template>

    </o-table>

    <TablePageSize
        v-if="!paginated && showPageSizeSelector"
        v-model:size="perPage"
        :storage-key="AppStorage.TOPIC_MESSAGE_TABLE_PAGE_SIZE_KEY"
        style="width: 116px; margin-left: 4px"
    />

    <EmptyTable v-if="!messages.length"/>
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {ComputedRef, defineComponent, inject, PropType, Ref} from 'vue';
import {TopicMessageTableController} from "@/components/topic/TopicMessageTableController";
import TimestampValue from "@/components/values/TimestampValue.vue";
import BlobValue from "@/components/values/BlobValue.vue";
import {ORUGA_MOBILE_BREAKPOINT} from "@/BreakPoints";
import EmptyTable from "@/components/EmptyTable.vue";
import {TopicMessage} from "@/schemas/HederaSchemas";
import {routeManager} from "@/router";
import TablePageSize from "@/components/transaction/TablePageSize.vue";
import {AppStorage} from "@/AppStorage";

export default defineComponent({

  name: 'TopicMessageTable',

  components: {TablePageSize, EmptyTable, BlobValue, TimestampValue},

  props: {
    controller: {
      type: Object as PropType<TopicMessageTableController>,
      required: true
    }
  },

  setup(props) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)

    const handleClick = (t: TopicMessage,  c: unknown, i: number, ci: number, event: MouseEvent) => {
      const consensusTimestamp = t.consensus_timestamp
      if (consensusTimestamp) {
        routeManager.routeToTransactionByTs(consensusTimestamp, event)
      }
    }

    return {
      isTouchDevice,
      isMediumScreen,
      messages: props.controller.rows as ComputedRef<TopicMessage[]>,
      loading: props.controller.loading as ComputedRef<boolean>,
      total: props.controller.totalRowCount as ComputedRef<number>,
      currentPage: props.controller.currentPage as Ref<number>,
      onPageChange: props.controller.onPageChange,
      perPage: props.controller.pageSize as Ref<number>,
      paginated: props.controller.paginated as ComputedRef<boolean>,
      showPageSizeSelector: props.controller.showPageSizeSelector as ComputedRef<boolean>,
      ORUGA_MOBILE_BREAKPOINT,
      AppStorage,
      handleClick
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>
#topic-message-table table.o-table > tbody > tr {
  cursor: default;
}
</style>
