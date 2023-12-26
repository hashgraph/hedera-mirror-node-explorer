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

    <div v-if="textValue && false" id="bytecode"
         class="is-family-monospace h-is-text-size-3 has-text-grey mt-2 mr-1 pl-1 py-1 code-data-box"
         style="word-wrap: anywhere">
        {{ textValue }}
    </div>

    <div v-else-if="textValue && true" id="bytecode"
         class=" mt-2 mr-1 code-data-box"
         style="padding-left: 2px" >
        <HexaValue :byte-string="textValue" :copyable="false"/>
    </div>

    <span v-else-if="initialLoading"/>

    <span v-else class="has-text-grey">None</span>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, ref, watch} from 'vue';
import {initialLoadingKey} from "@/AppKeys";
import HexaValue from "@/components/values/HexaValue.vue";

export default defineComponent({
    name: 'ByteCodeValue',
    components: {HexaValue},

    props: {
        byteCode: String,
    },

    setup(props) {
        const textValue = ref(props.byteCode)
        watch(() => props.byteCode, () => {
            textValue.value = props.byteCode
        })
        const initialLoading = inject(initialLoadingKey, ref(false))
        return {textValue, initialLoading}
    }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>

.code-data-box {
    border: 0.5px solid dimgrey;
    gap: 0.42rem;
    max-height: 20rem;
    overflow-y: auto;
    min-height: 5rem
}

</style>