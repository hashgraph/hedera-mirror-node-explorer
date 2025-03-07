// SPDX-License-Identifier: Apache-2.0

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                     TEMPLATE                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>
  <DashboardCardV2
    v-if="showContractResults"
    collapsible-key="contractCalls"
  >
    <template #title>
      Recent Contract Calls
    </template>

    <template #left-control>
      <PlayPauseButton :controller="resultTableController" />
    </template>

    <template #content>
      <div id="contract-results-table">
        <ContractResultTable
          v-if="props.contractId"
          :controller="resultTableController"
        />
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
import PlayPauseButton from "@/components/PlayPauseButton.vue";

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
