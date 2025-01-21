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

  <DashboardCardV2 v-if="showContractResults" collapsible-key="contractCalls">
    <template #title>
      Recent Contract Calls
    </template>

    <template #left-control>
      <PlayPauseButtonV2 :controller="resultTableController"/>
    </template>

    <template #content>
      <div id="contract-results-table">
        <ContractResultTable v-if="props.contractId" :controller="resultTableController"/>
      </div>
    </template>
  </DashboardCardV2>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, inject, onBeforeUnmount, onMounted, ref} from 'vue';
import router from "@/router";
import {ContractResultTableController} from "@/components/contract/ContractResultTableController";
import ContractResultTable from "@/components/contract/ContractResultTable.vue";
import DashboardCardV2 from "@/components/DashboardCardV2.vue";
import PlayPauseButtonV2 from "@/components/PlayPauseButtonV2.vue";

const props = defineProps({
  contractId: String,
})

const isMediumScreen = inject('isMediumScreen', true)

const computedContractId = computed(() => props.contractId ?? null)
const perPage = ref(isMediumScreen ? 10 : 5)

const showContractResults = computed(() => resultTableController.rows.value.length)

//
// resultTableController
//

const resultTableController = new ContractResultTableController(router, computedContractId, perPage)
onMounted(() => resultTableController.mount())
onBeforeUnmount(() => resultTableController.unmount())

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>