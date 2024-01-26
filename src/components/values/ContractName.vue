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

<template>
    <template v-if="contractId != null">
        <div v-if="fullMatch || partialMatch">
            <div class="icon is-small has-text-success mr-1">
                <i v-if="fullMatch" class="fas fa-check-circle"></i>
                <i v-else class="fas fa-check-circle"></i>
            </div>
            <span>
                {{ name }}
            </span>
        </div>
        <span v-else-if="false" class="h-has-pill h-has-page-background has-text-grey has-text-weight-light">
            not verified
        </span>
    </template>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, onBeforeUnmount, onMounted} from "vue";
import {ContractAnalyzer, GlobalState} from "@/utils/analyzer/ContractAnalyzer";

export default defineComponent({
    name: "ContractName",

    props: {
        contractId: {
            type: String,
            required: true
        }
    },

    setup(props) {

        const contractAnalyzer = new ContractAnalyzer(computed(() => props.contractId ?? null))
        onMounted(() => contractAnalyzer.mount())
        onBeforeUnmount(() => contractAnalyzer.unmount())

        const name = computed(() => contractAnalyzer.contractName.value)
        const partialMatch = computed(() => contractAnalyzer.globalState.value === GlobalState.PartialMatch)
        const fullMatch = computed(() => contractAnalyzer.globalState.value === GlobalState.FullMatch)

        return {
            name,
            partialMatch,
            fullMatch,
        }
    }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>

