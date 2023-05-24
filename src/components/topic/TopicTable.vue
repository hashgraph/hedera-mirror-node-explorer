<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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
            backend-pagination
            :total="total"
            v-model:current-page="currentPage"
            :per-page="perPage"
            @page-change="onPageChange"
            @click="handleClick"

            :hoverable="true"
            :paginated="!isTouchDevice"
            :striped="true"
            :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"

            aria-current-label="Current page"
            aria-next-label="Next page"
            aria-page-label="Page"
            aria-previous-label="Previous page"
            customRowKey="consensus_timestamp"
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
            <BlobValue :blob-value="props.row.memo_base64" :base64="true" :show-none="true"/>
        </o-table-column>

    </o-table>

    <EmptyTable v-if="!transactions.length"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {ComputedRef, defineComponent, inject, PropType, Ref} from 'vue';
import {Transaction} from "@/schemas/HederaSchemas";
import TimestampValue from "@/components/values/TimestampValue.vue";
import {routeManager} from "@/router";
import BlobValue from "@/components/values/BlobValue.vue";
import {ORUGA_MOBILE_BREAKPOINT} from '@/App.vue';
import EmptyTable from "@/components/EmptyTable.vue";
import {TransactionTableController} from "@/components/transaction/TransactionTableController";

export default defineComponent({
    name: 'TopicTable',

    components: {EmptyTable, BlobValue, TimestampValue},

    props: {
        controller: {
            type: Object as PropType<TransactionTableController>,
            required: true
        }
    },

    setup(props) {
        const isTouchDevice = inject('isTouchDevice', false)

        const handleClick = (t: Transaction) => {
            if (t.entity_id) {
                routeManager.routeToTopic(t.entity_id)
            }
        }

        return {
            isTouchDevice,
            transactions: props.controller.rows as ComputedRef<Transaction[]>,
            loading: props.controller.loading as ComputedRef<boolean>,
            total: props.controller.totalRowCount as ComputedRef<number>,
            currentPage: props.controller.currentPage as Ref<number>,
            onPageChange: props.controller.onPageChange,
            perPage: props.controller.pageSize as Ref<number>,
            handleClick,

            // From App
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