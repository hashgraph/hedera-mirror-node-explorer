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
    <div v-if="fileList" id="file-table">
        <o-table
            :current-page="currentPage"
            :data="fileList"
            :paginated="isPaginated"
            :per-page="perPage"
            aria-current-label="Current page"
            aria-next-label="Next page"
            aria-page-label="Page"
            aria-previous-label="Previous page">

            <o-table-column v-slot="props" :label="tableTitle" field="type_and_name">
                <div class="is-flex is-align-items-center">
                    <img v-if="isMetadata(props.row)" alt="JSON file" class="image"
                         src="../../assets/json-file.svg" style="width: 20px; height: 20px">
                    <img v-else alt="Solidity file" class="image"
                         src="../../assets/solidity-icon.svg" style="width: 20px; height: 20px">
                    <p class="ml-2">
                        {{ props.row }}
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

export default defineComponent({
    name: 'FileList',

    components: {},

    props: {
        fileList: {
            type: Array as PropType<string[]>,
            default: []
        }
    },

    setup: function (props) {
        const isTouchDevice = inject('isTouchDevice', false)
        const isSmallScreen = inject('isSmallScreen', true)
        const isMediumScreen = inject('isMediumScreen', true)

        const currentPage = ref(1);
        const perPage = ref(10);
        const isPaginated = computed(() => props.fileList.length > perPage.value)
        const tableTitle = computed(() => `Added Files (${props.fileList.length})`)

        const isMetadata = (fileName: string) => {
            const parts = fileName.split('.')
            const suffix = parts[parts.length - 1].toLowerCase()
            return suffix.toLowerCase() === 'json'
        }

        return {
            isTouchDevice,
            isSmallScreen,
            isMediumScreen,
            isPaginated,
            currentPage,
            perPage,
            tableTitle,
            isMetadata
        }
    }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>
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