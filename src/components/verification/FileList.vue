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

<!--suppress CssUnusedSymbol -->

<template>
    <div v-if="auditItems.length> 0" id="file-table">
        <div class="is-flex is-justify-content-space-between">
            <span class="h-is-primary-subtitle">
                {{ tableTitle }}
            </span>
            <span class="has-text-info" style="cursor: pointer" @click="handleClearAllFiles">
                Clear all files
            </span>
        </div>

        <o-table
            :current-page="currentPage"
            :data="auditItems"
            :paginated="isPaginated"
            :per-page="perPage"
            aria-current-label="Current page"
            aria-next-label="Next page"
            aria-page-label="Page"
            aria-previous-label="Previous page">

            <o-table-column v-slot="props" field="type_and_name">
                <div class="is-flex is-align-items-center">
                    <img v-if="isMetadata(props.row)" alt="JSON file" class="image"
                         src="../../assets/json-file.svg" style="width: 20px; height: 20px">
                    <img v-else alt="Solidity file" class="image"
                         src="../../assets/solidity-icon.svg" style="width: 20px; height: 20px">
                    <p :class="{
                        'has-text-grey':props.row.status === ContractAuditItemStatus.Unused,
                        'has-text-weight-bold':props.row.target
                    }" class="ml-2">
                        {{ props.row.path }}
                    </p>
                </div>
            </o-table-column>

        </o-table>
    </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, PropType, ref} from "vue";
import {ContractAuditItem, ContractAuditItemStatus} from "@/utils/analyzer/ContractSourceAudit";

export default defineComponent({
    name: 'FileList',
    computed: {
        ContractAuditItemStatus() {
            return ContractAuditItemStatus
        }
    },

    components: {},

    props: {
        auditItems: {
            type: Array as PropType<ContractAuditItem[]>,
            default: []
        }
    },

    emits: ['clearAllFiles'],

    setup: function (props, context) {
        const isTouchDevice = inject('isTouchDevice', false)
        const isSmallScreen = inject('isSmallScreen', true)
        const isMediumScreen = inject('isMediumScreen', true)

        const currentPage = ref(1);
        const perPage = ref(10);
        const isPaginated = computed(() => props.auditItems.length > perPage.value)
        const tableTitle = computed(() => `Added Files (${props.auditItems.length})`)

        const isMetadata = (auditItem: ContractAuditItem) => {
            const parts = auditItem.path.split('.')
            const suffix = parts[parts.length - 1].toLowerCase()
            return suffix.toLowerCase() === 'json'
        }

        const handleClearAllFiles = () => {
            context.emit("clearAllFiles")
        }

        return {
            isTouchDevice,
            isSmallScreen,
            isMediumScreen,
            isPaginated,
            currentPage,
            perPage,
            tableTitle,
            isMetadata,
            handleClearAllFiles
        }
    }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>
#file-table table.o-table {
    margin: 0;
}

#file-table table.o-table > tbody > tr {
    cursor: default;
}

#file-table table.o-table > thead > tr > th {
    font-size: 15px;
    line-height: 18px;
    padding-top: 0;
    padding-left: 0;
    padding-bottom: 12px;
    border-width: 0;
}

#file-table td.o-table__td {
    border-width: 0;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
}
</style>