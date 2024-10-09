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
<!--                                                     TEMPLATE                                                 -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>
  <Tabs :tab-ids=tabIds :tab-labels=tabLabels v-model:selected-tab="selectedAgentId" :compact="true"/>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import Tabs from "@/components/Tabs.vue"
import {computed, PropType} from "vue"
import {SearchController} from "@/components/search/SearchController";


const props = defineProps({
  searchController: {
    type: Object as PropType<SearchController>,
    required: true
  }
})

const selectedAgentId = defineModel("selectedAgentId", {
  type: String as PropType<string|null>,
  default: null
})

const selectableAgents = computed(() => props.searchController.visibleAgents.value)

const tabIds = computed(() => {
  const result: string[] = []
  for (const a of selectableAgents.value) {
    result.push(a.id)
  }
  return result
})

const tabLabels = computed(() => {
  const result: string[] = []
  for (const a of selectableAgents.value) {
    result.push(a.title)
  }
  return result
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
