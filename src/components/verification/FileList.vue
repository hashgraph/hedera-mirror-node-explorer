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
    <div v-if="contractFileList" id="file-table">
        <o-table
            :current-page="currentPage"
            :data="contractFileList"
            :paginated="isPaginated"
            :per-page="perPage"
            aria-current-label="Current page"
            aria-next-label="Next page"
            aria-page-label="Page"
            aria-previous-label="Previous page">

            <o-table-column v-slot="props" :label="tableTitle" field="type_and_name">
                <div class="is-flex is-align-items-center">
                    <img v-if="props.row.type === 'json'" alt="JSON file" class="image"
                         src="../../assets/json-file.svg" style="width: 20px; height: 20px">
                    <img v-else-if="props.row.type === 'sol'" alt="Solidity file" class="image"
                         src="../../assets/solidity-icon.svg" style="width: 20px; height: 20px">
                    <i v-else class="fas fa-question"></i>
                    <p :class="{'has-text-grey': props.row.removed}" class="ml-2">
                        {{ props.row.name }}
                    </p>
                </div>
            </o-table-column>

            <o-table-column v-slot="props" field="remove_action" label="" position="right">
                <div v-if="!props.row.removed" class="is-flex is-align-items-center is-align-content-flex-end"
                     style="width: 20px">
                    <img alt="Trash" class="image"
                         src="@/assets/red-trash.svg"
                         style="width: 20px; height: 20px" @click="handleRemove(props.index)">
                    <p class="ml-1" style="color: #ED6A5E"
                       @click="handleRemove(props.index)">
                        Remove
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

import {computed, defineComponent, inject, onMounted, PropType, ref, watch} from "vue";

export interface ContractFile {
    type: string,
    name: string,
    removed: boolean
}

export default defineComponent({
    name: 'FileList',

    components: {},

    props: {
        fileList: {
            type: Array as PropType<string[]>,
            default: []
        }
    },

    emits: ["update:fileList"],

    setup: function (props, context) {
        const isTouchDevice = inject('isTouchDevice', false)
        const isSmallScreen = inject('isSmallScreen', true)
        const isMediumScreen = inject('isMediumScreen', true)

        const currentPage = ref(1);
        const perPage = ref(10);
        const isPaginated = computed(() => props.fileList.length > perPage.value)
        const tableTitle = computed(() => `Added Files (${contractFileList.value.length})`)

        const contractFileList = ref<ContractFile[]>([])
        onMounted(() => upDateContractFileList())
        watch(() => props.fileList, () => upDateContractFileList())
        const upDateContractFileList = () => {
            const result: Array<ContractFile> = []
            props.fileList.forEach((file) => {
                    const parts = file.split('.')
                    const suffix = parts[parts.length - 1].toLowerCase()
                    result.push({
                        type: suffix,
                        name: file.toString(),
                        removed: false
                    })
                }
            )
            contractFileList.value = result
        }

        const handleRemove = (index: number) => {
            const result = Array.from(props.fileList)
            result.splice(index, 1)
            context.emit('update:fileList', result)
            contractFileList.value[index].removed = true
        }

        return {
            isTouchDevice,
            isSmallScreen,
            isMediumScreen,
            isPaginated,
            currentPage,
            perPage,
            tableTitle,
            contractFileList,
            handleRemove
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
}

#file-table th.o-table__th {
    border-width: 0;
}

#file-table td.o-table__td {
    border-width: 0;
}
</style>