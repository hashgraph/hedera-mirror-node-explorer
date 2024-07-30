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

  <DashboardCard v-if="showContractResults" collapsible-key="contractCalls">
    <template v-slot:title>
      <p class="h-is-secondary-title">Recent Contract Calls</p>
    </template>

    <template v-slot:control>
      <div class="is-flex is-align-items-flex-end">
        <PlayPauseButton v-bind:controller="resultTableController"/>
      </div>
    </template>

    <template v-slot:content>
      <div id="contract-results-table">
        <ContractResultTable v-if="contractId" :controller="resultTableController"/>
      </div>
    </template>
  </DashboardCard>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted, ref} from 'vue';
import router from "@/router";
import DashboardCard from "@/components/DashboardCard.vue";
import {ContractResultTableController} from "@/components/contract/ContractResultTableController";
import PlayPauseButton from "@/components/PlayPauseButton.vue";
import ContractResultTable from "@/components/contract/ContractResultTable.vue";

export default defineComponent({
  name: 'ContractResultsSection',

  components: {ContractResultTable, PlayPauseButton, DashboardCard},

  props: {
    contractId: String,
  },

  setup: function (props) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)

    const computedContractId = computed(() => props.contractId || null)
    const perPage = ref(isMediumScreen ? 10 : 5)

    const showContractResults = computed(() => resultTableController.rows.value.length)

    //
    // resultTableController
    //

    const resultTableController = new ContractResultTableController(router, computedContractId, perPage)
    onMounted(() => resultTableController.mount())
    onBeforeUnmount(() => resultTableController.unmount())

    return {
      isTouchDevice,
      isSmallScreen,
      isMediumScreen,
      showContractResults,
      resultTableController
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>