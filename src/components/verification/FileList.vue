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
    <div v-if="displayedAuditItems.length> 0" id="file-table">
        <div class="is-flex is-justify-content-space-between">
            <span class="h-is-primary-subtitle">
                {{ tableTitle }}
            </span>
            <div class="is-flex is-justify-content-flex-end">
                <span class="has-text-info" style="cursor: pointer" @click="handleToggleFiltering">
                {{ isListFiltered ? 'Show all' : 'Hide unused' }}
            </span>
                <span class="has-text-info ml-5" style="cursor: pointer" @click="handleClearAllFiles">
                Clear all
            </span>
            </div>
        </div>

        <o-table
            :current-page="currentPage"
            :data="displayedAuditItems"
            :paginated="isPaginated"
            :per-page="perPage"
            aria-current-label="Current page"
            aria-next-label="Next page"
            aria-page-label="Page"
            aria-previous-label="Previous page">

            <o-table-column v-slot="props" field="type_and_name">
                <div class="is-flex is-align-items-center">
                    <img v-if="isMetadata(props.row) && isUnused(props.row)" alt="JSON file" class="image"
                         src="../../assets/json-file-grey.svg" style="width: 20px; height: 20px;">
                    <img v-else-if="isMetadata(props.row)" alt="JSON file" class="image"
                         src="../../assets/json-file.svg" style="width: 20px; height: 20px;">
                    <img v-else-if="isUnused(props.row)" alt="Solidity file" class="image"
                         src="../../assets/solidity-icon-grey.svg" style="width: 20px; height: 20px;">
                    <img v-else alt="Solidity file" class="image"
                         src="../../assets/solidity-icon.svg" style="width: 20px; height: 20px;">
                    <p :class="{
                        'has-text-grey':isUnused(props.row),
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
        const isListFiltered = ref(false)
        const isPaginated = computed(() => props.auditItems.length > perPage.value)
        const tableTitle = computed(() => `Added Files (${displayedAuditItems.value.length})`)

        const sortedAuditItems = computed(() => {
            let result = [...props.auditItems]
            result.sort((a, b) => {
                if (a.target && b.target) {
                    return 0
                } else if (a.target) {
                    return -1
                } else if (b.target) {
                    return 1
                } else if (a.status === b.status) {
                    return 0
                } else if (a.status === ContractAuditItemStatus.OK) {
                    return -1
                } else if (b.status === ContractAuditItemStatus.OK) {
                    return 1
                } else {
                    return 0
                }
            })
            return result
        })

        const filteredAuditItems = computed(() => {
            let result: Array<ContractAuditItem> = []
            for (let i = 0; i < sortedAuditItems.value.length; i++) {
                if (sortedAuditItems.value[i].status === ContractAuditItemStatus.OK) {
                    result.push(sortedAuditItems.value[i])
                }
            }
            return result
        })

        const displayedAuditItems = computed(() => {
            return isListFiltered.value ? filteredAuditItems.value : sortedAuditItems.value
        })

        const isMetadata = (auditItem: ContractAuditItem) => {
            const parts = auditItem.path.split('.')
            const suffix = parts[parts.length - 1].toLowerCase()
            return suffix.toLowerCase() === 'json'
        }

        const isUnused = (auditItem: ContractAuditItem) => {
            return auditItem.status === ContractAuditItemStatus.Unused
        }

        const handleClearAllFiles = () => {
            context.emit("clearAllFiles")
        }

        const handleToggleFiltering = () => {
            isListFiltered.value = !isListFiltered.value
        }

        return {
            isTouchDevice,
            isSmallScreen,
            isMediumScreen,
            isPaginated,
            currentPage,
            perPage,
            isListFiltered,
            tableTitle,
            sortedAuditItems,
            filteredAuditItems,
            displayedAuditItems,
            isMetadata,
            isUnused,
            handleClearAllFiles,
            handleToggleFiltering
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