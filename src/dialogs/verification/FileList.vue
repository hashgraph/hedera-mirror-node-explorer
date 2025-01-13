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

<!--suppress CssUnusedSymbol -->

<template>
  <div v-if="displayedAuditItems.length> 0" id="file-table">
    <div class="is-flex is-justify-content-space-between">
            <span class="h-is-primary-subtitle">
                {{ tableTitle }}
            </span>
      <div class="is-flex is-justify-content-flex-end">
                <span v-if="nbUnusedAuditItems > 0" class="has-text-info" style="cursor: pointer"
                      @click="handleToggleFiltering">
                    {{ isListFiltered ? 'Show unused' : 'Hide unused' }}
                    {{ ' (' + nbUnusedAuditItems + ')' }}
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
                    <span v-if="isMetadata(props.row)" class="icon" style="font-size: 15px"
                          :class="{'has-text-grey': isUnused(props.row)}"
                    >
                        <i class="far fa-file-alt"></i>
                    </span>
          <img v-else-if="isUnused(props.row)" alt="Solidity file" class="image mr-1" style="width: 20px; height: 20px;"
               src="../../assets/solidity-icon-grey.svg"
          >
          <img v-else alt="Solidity file" class="image mr-1" style="width: 20px; height: 20px;"
               src="../../assets/solidity-icon.svg"
          >
          <p :class="{'has-text-grey':isUnused(props.row)}" class="ml-1">
            {{ props.row.path }}
          </p>
          <span v-if="!isMetadata(props.row) && props.row.target" class="icon ml-1 has-text-grey"
                style="font-size: 14px">
                       <i class="fa fa-arrow-left"></i>
                    </span>
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
import {ContractSourceAnalyzerItem} from "@/utils/analyzer/ContractSourceAnalyzer.ts";

export default defineComponent({
  name: 'FileList',

  components: {},

  props: {
    auditItems: {
      type: Array as PropType<ContractSourceAnalyzerItem[]>,
      default: [] as Array<ContractSourceAnalyzerItem> /* to please eslint */
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
    const tableTitle = computed(() => `Added Files (${props.auditItems.length})`)

    const filteredAuditItems = computed(() => {
      let result: Array<ContractSourceAnalyzerItem> = []
      for (let i = 0; i < props.auditItems.length; i++) {
        if (!props.auditItems[i].unused) {
          result.push(props.auditItems[i])
        }
      }
      return result
    })

    const displayedAuditItems = computed(() => {
      return isListFiltered.value ? filteredAuditItems.value : props.auditItems
    })

    const nbUnusedAuditItems = computed(() => {
      let result = 0
      for (const i of props.auditItems) {
        if (i.unused) {
          result++
        }
      }
      return result
    })

    const isMetadata = (item: ContractSourceAnalyzerItem) => {
      const parts = item.path.split('.')
      const suffix = parts[parts.length - 1].toLowerCase()
      return suffix.toLowerCase() === 'json'
    }

    const isUnused = (item: ContractSourceAnalyzerItem) => {
      return item.unused
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
      filteredAuditItems,
      displayedAuditItems,
      nbUnusedAuditItems,
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
