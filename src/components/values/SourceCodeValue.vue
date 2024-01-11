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

<!--suppress HtmlWrongAttributeValue -->
<template>
    <div  v-if="sourceFiles.length > 0"  id="source-code"
          class="mt-2 h-code-box h-has-page-background" style="max-height: 400px;">
        <template  v-for="(file, index) in sourceFiles">
            <p class="mt-2 mx-3 h-is-extra-text">{{ file.name }}</p>
            <pre class="h-has-page-background">{{ file.content }}</pre>
            <hr v-if="index < sourceFiles.length - 1" class="has-background-grey-dark m-0" style="height: 0.5px"/>
        </template>
    </div>

    <span v-else-if="initialLoading"/>

    <span v-else class="has-text-grey">None</span>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, PropType, ref} from 'vue';
import {initialLoadingKey} from "@/AppKeys";
import OpcodeValue from "@/components/values/OpcodeValue.vue";
import {SourcifyResponseItem} from "@/utils/cache/SourcifyCache";

export default defineComponent({
    name: 'SourceCodeValue',
    components: {OpcodeValue},

    props: {
        sourceFiles: {
            type: Object as PropType<SourcifyResponseItem[]>,
            default: []
        },
    },

    setup(props) {
        const FILE_SEPARATOR = "\n\n==========================================================================================================================================================================================\n\n"
        const initialLoading = inject(initialLoadingKey, ref(false))
        const sourceContent = computed(() => {
            let result = ""
            for (let i = 0; i < props.sourceFiles.length; i++) {
                console.log(`source: [${props.sourceFiles[i].content}]`)
                result += props.sourceFiles[i]
                if (i < props.sourceFiles.length - 1) {
                    result += FILE_SEPARATOR
                }
            }
            return result
        })
        return {
            initialLoading,
            sourceContent
        }
    }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>