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

  <textarea  v-if="sources.length > 0"
             v-model="sourceContent"
             wrap = "off"
             readonly
             :rows="rows"
             style="width:100%; font-family: novamonoregular,monospace"></textarea>

  <span v-else-if="initialLoading"/>

  <span v-else class="has-text-grey">None</span>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, ref} from 'vue';
import {initialLoadingKey} from "@/AppKeys";

export default defineComponent({
  name: 'SourceCodeValue',

  props: {
    sources: {
        type: Array<String>,
        default: []
    } ,
    rows: {
        type: Number,
        default: 20
    }
  },

  setup(props) {
      const FILE_SEPARATOR = "\n\n==========================================================================================================================================================================================\n\n"
    const initialLoading = inject(initialLoadingKey, ref(false))
    const sourceContent = computed(() => {
        let result = ""
        props.sources.forEach((s) => {
            result = result + s + FILE_SEPARATOR
        })
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