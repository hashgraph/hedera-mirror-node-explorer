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

  <DashboardCardV2 v-if="actions?.length" collapsible-key="callTrace">
    <template #title>
      <span>Call Trace</span>
    </template>

    <template v-if="isMediumScreen" #right-control>
      <ButtonView
          v-if="collapseAllVisible"
          id="collapseAllButton"
          :enabled="!collapseAllDisabled"
          :is-default="true"
          :size="ButtonSize.small"
          @action="collapseAll"
      >
        COLLAPSE ALL
      </ButtonView>
      <ButtonView
          v-else
          id="expandAllButton"
          :is-default="true"
          :size="ButtonSize.small"
          @action="expandAll"
      >
        EXPAND ALL
      </ButtonView>
    </template>

    <template #content>
      <ContractActionsTable
          :actions="actions"
          v-model:expandedActions="expandedActions"
          :analyzer="props.analyzer"
      />
    </template>
  </DashboardCardV2>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, inject, onBeforeUnmount, onMounted, PropType, Ref, ref} from 'vue';
import {ContractActionsLoader, ContractActionWithPath} from "@/components/contract/ContractActionsLoader";
import ContractActionsTable from "@/components/contract/ContractActionsTable.vue";
import {FunctionCallAnalyzer} from "@/utils/analyzer/FunctionCallAnalyzer";
import DashboardCardV2 from "@/components/DashboardCardV2.vue";
import ButtonView from "@/elements/ButtonView.vue";
import {ButtonSize} from "@/dialogs/core/DialogUtils.ts";

const props = defineProps({
  transactionIdOrHash: String,
  analyzer: {
    type: Object as PropType<FunctionCallAnalyzer>,
    required: true
  }
})

const isMediumScreen = inject('isMediumScreen', ref(false))

const contractActionsLoader = new ContractActionsLoader(computed(() => props.transactionIdOrHash ?? null))
onMounted(() => contractActionsLoader.mount())
onBeforeUnmount(() => contractActionsLoader.unmount())

const expandedActions: Ref<ContractActionWithPath[]> = ref([])

const collapseAllVisible = computed(() => {
  const actionCount = contractActionsLoader.actions.value?.length ?? 0
  return expandedActions.value.length >= 1 || actionCount == 0
})

const collapseAllDisabled = computed(() => {
  return expandedActions.value.length == 0
})

const collapseAll = (): void => {
  expandedActions.value.splice(0) // expandedActions must be muted for Oruga table to work properly
}

const expandAll = (): void => {
  collapseAll()
  for (const a of actions.value ?? []) {
    expandedActions.value.push(a) // expandedActions must be muted for Oruga table to work properly
  }
}

const actions = contractActionsLoader.actionsWithPath

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
