<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2022 Hedera Hashgraph, LLC
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

  <DashboardCard v-if="actions?.length" class="h-card">
    <template v-slot:title>
      <span class="h-is-secondary-title">Call Trace</span>
    </template>

    <template v-slot:control>
      <div class="is-flex is-justify-content-flex-end is-align-items-baseline">
        <button v-if="collapseAllVisible" id="collapseAllButton" :disabled="collapseAllDisabled"
                class="button is-white is-small ml-4" @click="collapseAll">COLLAPSE ALL
        </button>
        <button v-else id="expandAllButton"
                class="button is-white is-small ml-4" @click="expandAll">EXPAND ALL
        </button>
      </div>
    </template>

    <template v-slot:content>
      <ContractActionsTable :actions="actions" v-model:expandedActions="expandedActions"/>
    </template>
  </DashboardCard>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, onMounted, Ref, ref} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";
import {ContractActionsLoader} from "@/components/contract/ContractActionsLoader";
import ContractActionsTable from "@/components/contract/ContractActionsTable.vue";
import {ContractAction} from "@/schemas/HederaSchemas";

export default defineComponent({

  name: 'ContractResultTrace',

  components: {
    ContractActionsTable,
    DashboardCard
  },

  props: {
    transactionIdOrHash: String
  },

  setup(props) {
    // const isSmallScreen = inject('isSmallScreen', true)
    // const isTouchDevice = inject('isTouchDevice', false)

    const contractActionsLoader = new ContractActionsLoader(computed(() => props.transactionIdOrHash ?? null))
    onMounted(() => contractActionsLoader.requestLoad())

    const expandedActions: Ref<ContractAction[]> = ref([])
    const collapseAllVisible = computed(() => {
      const actionCount = contractActionsLoader.actions.value?.length ?? 0
      return expandedActions.value.length >= 1 || actionCount == 0
    })
    const collapseAllDisabled = computed(() => {
      return expandedActions.value.length == 0
    })
    const collapseAll = (): void => {
      expandedActions.value = []
    }
    const expandAll = (): void => {
      expandedActions.value = contractActionsLoader.actions.value ?? []
    }

    return {
      actions: contractActionsLoader.actions,
      expandedActions,
      collapseAll,
      expandAll,
      collapseAllVisible,
      collapseAllDisabled,
    }
  },
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

.columns button {
  vertical-align: initial;
}

.button.is-small {
  font-size: 0.65rem;
}

</style>