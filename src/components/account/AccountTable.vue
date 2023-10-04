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
        :data="accounts"
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
        customRowKey="account"
    >
        <o-table-column v-slot="props" field="account" label="Account">
            <div class="is-numeric">
                {{ props.row.account }}
            </div>
        </o-table-column>

        <o-table-column field="expiry" label="Expiry" v-slot="props">
            <TimestampValue
                v-bind:timestamp="props.row?.expiration_timestamp"
                v-bind:show-none="true"
            />
        </o-table-column>

        <o-table-column field="nb_tokens" label="Tokens" v-slot="props">
            <div v-if="props.row.balance?.tokens?.length > 1">
                {{ props.row.balance?.tokens?.length }} Types of Token
            </div>
            <div v-else-if="props.row.balance?.tokens?.length === 1">
                <TokenAmount
                    v-bind:amount="BigInt(props.row.balance?.tokens[0].balance)"
                    v-bind:token-id="props.row.balance?.tokens[0].token_id"
                    v-bind:show-extra="true"
                />
            </div>
            <div v-else class="has-text-grey"> None </div>
        </o-table-column>

        <o-table-column v-slot="props" field="memo" label="Memo">
            <div class="w250">
                <BlobValue
                    v-bind:blob-value="props.row.memo_base64"
                    v-bind:base64="true"
                    v-bind:show-none="true"
                />
            </div>
        </o-table-column>

        <o-table-column
            v-slot="props"
            field="balance"
            label="Balance"
            position="right"
        >
            <HbarAmount v-bind:amount="props.row.balance.balance ?? 0" />
        </o-table-column>
    </o-table>

    <EmptyTable v-if="!accounts.length" />
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">
import { ComputedRef, defineComponent, inject, PropType, Ref } from "vue";
import { AccountInfo } from "@/schemas/HederaSchemas";
import { routeManager } from "@/router";
import HbarAmount from "@/components/values/HbarAmount.vue";
import BlobValue from "@/components/values/BlobValue.vue";
import TimestampValue from "@/components/values/TimestampValue.vue";
import TokenAmount from "@/components/values/TokenAmount.vue";
import { ORUGA_MOBILE_BREAKPOINT } from "@/App.vue";
import EmptyTable from "@/components/EmptyTable.vue";
import { AccountTableController } from "@/components/account/AccountTableController";

export default defineComponent({
    name: "AccountTable",

    components: {
        EmptyTable,
        BlobValue,
        HbarAmount,
        TimestampValue,
        TokenAmount,
    },

    props: {
        controller: {
            type: Object as PropType<AccountTableController>,
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
            a: AccountInfo,
            c: unknown,
            i: number,
            ci: number,
            event: MouseEvent,
        ) => {
            if (a.account) {
                routeManager.routeToAccount(
                    a.account,
                    event.ctrlKey || event.metaKey,
                );
            }
        };

        return {
            isTouchDevice,
            isMediumScreen,
            accounts: props.controller.rows as ComputedRef<AccountInfo[]>,
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
