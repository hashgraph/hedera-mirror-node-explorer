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
        :data="tokens"
        :loading="loading"
        paginated
        backend-pagination
        :total="total"
        v-model:current-page="currentPage"
        :per-page="perPage"
        @page-change="onPageChange"
        @cell-click="handleClick"
        :hoverable="true"
        :narrowed="narrowed"
        :striped="true"
        :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"
        aria-current-label="Current page"
        aria-next-label="Next page"
        aria-page-label="Page"
        aria-previous-label="Previous page"
        customRowKey="token_id"
    >
        <o-table-column v-slot="props" field="token_id" label="Token">
            <div class="is-numeric">
                {{ props.row.token_id }}
            </div>
        </o-table-column>

        <o-table-column v-slot="props" field="symbol" label="Symbol">
            <div class="w400">{{ props.row.symbol }}</div>
        </o-table-column>
    </o-table>

    <EmptyTable v-if="!tokens.length" />
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">
import { ComputedRef, defineComponent, inject, PropType, Ref } from "vue";
import { routeManager } from "@/router";
import { Token } from "@/schemas/HederaSchemas";
import { ORUGA_MOBILE_BREAKPOINT } from "@/App.vue";
import EmptyTable from "@/components/EmptyTable.vue";
import { TokenTableController } from "@/components/token/TokenTableController";

export default defineComponent({
    name: "TokenTable",

    components: { EmptyTable },

    props: {
        controller: {
            type: Object as PropType<TokenTableController>,
            required: true,
        },
        narrowed: {
            type: Boolean,
            default: false,
        },
    },

    setup(props) {
        const isTouchDevice = inject("isTouchDevice", false);
        const isMediumScreen = inject("isMediumScreen", true);

        const handleClick = (
            t: Token,
            c: unknown,
            i: number,
            ci: number,
            event: MouseEvent,
        ) => {
            if (t.token_id) {
                routeManager.routeToToken(
                    t.token_id,
                    event.ctrlKey || event.metaKey,
                );
            }
        };

        return {
            isTouchDevice,
            isMediumScreen,
            tokens: props.controller.rows as ComputedRef<Token[]>,
            loading: props.controller.loading as ComputedRef<boolean>,
            total: props.controller.totalRowCount as ComputedRef<number>,
            currentPage: props.controller.currentPage as Ref<number>,
            onPageChange: props.controller.onPageChange,
            perPage: props.controller.pageSize as Ref<number>,
            handleClick,
            ORUGA_MOBILE_BREAKPOINT,
        };
    },
});
</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped></style>
