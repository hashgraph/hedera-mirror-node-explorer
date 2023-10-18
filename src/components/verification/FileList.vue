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
    <div>
        <div v-for="f of clampedFileList">
            {{ f }}
        </div>
        <div v-if="hiddenCount >= 1" class="h-is-property-text has-text-grey is-italic">and {{ hiddenCount }} additional file(s)</div>
    </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, PropType} from "vue";

export default defineComponent({
    name: 'FileList',

    components: {},

    props: {
        fileList: {
            type: Array as PropType<string[]>,
            default: []
        }
    },

    setup: function(props) {
        const isTouchDevice = inject('isTouchDevice', false)
        const isSmallScreen = inject('isSmallScreen', true)
        const isMediumScreen = inject('isMediumScreen', true)

        const clampedFileList = computed((): string[] => {
            const maxFileCount = 10
            return props.fileList.length >= maxFileCount ? props.fileList.slice(0, maxFileCount) : props.fileList
        })

        const hiddenCount = computed(() => {
            return props.fileList.length - clampedFileList.value.length
        })

        return {
            isTouchDevice,
            isSmallScreen,
            isMediumScreen,
            clampedFileList,
            hiddenCount
        }
    }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
