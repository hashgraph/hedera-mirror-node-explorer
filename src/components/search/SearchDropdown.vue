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
  <div style="position: relative" data-cy="searchDropdown">
    <div v-if="searchController.visible.value"
         class="box" style="position: absolute; display: flex; flex-direction: column; gap: 4px; width: 100%; top: 5px; left: 0; z-index: 10; border: 0.5px solid white; padding: 10px">
      <SearchTabs :search-controller="searchController" v-model:selected-agent-id="selectedAgentId"/>
      <SearchSection v-if="selectedAgent !== null" :search-controller="searchController" :search-agent="selectedAgent"/>
      <template v-if="searchController.loadingDomainNameSearchAgents.value.length >= 1">
        <hr v-if="searchController.visibleAgents.value.length >= 1" class="h-card-separator m-0" style="height:1px"/>
        <template v-for="a in searchController.domainNameSearchAgents" :key="a.id">
          <div v-if="a.loading.value" class="has-text-grey h-is-property-text">
            Connecting to {{ a.provider.providerAlias }}…
          </div>
        </template>
      </template>
      <div v-if="searchController.candidateCount.value == 0 && !searchController.loading.value" class="has-text-grey h-is-property-text">
        No match
        <span class="icon fas fa-question-circle has-text-grey h-is-hoverable is-small mt-1 ml-1" style="cursor:pointer" @click="navigateToHelp"/>
      </div>
      <div v-if="!searchController.loading.value" data-cy="searchCompleted" style="display: none"/>
    </div>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, PropType} from "vue";
import {SearchController} from "@/components/search/SearchController";
import router, {routeManager} from "@/router";
import SearchTabs from "@/components/search/SearchTabs.vue";
import SearchSection from "@/components/search/SearchSection.vue";
import {SearchAgent} from "@/components/search/SearchAgent";

const props = defineProps({
  "searchController": {
    type: Object as PropType<SearchController>,
    required: true
  }
})

const selectedAgentId = defineModel("selectedAgentId", {
  type: String as PropType<string|null>,
  default: null
})

const selectedAgent = computed(() => {
  let result: SearchAgent<unknown, unknown>|null
  if (selectedAgentId.value !== null) {
    result = props.searchController.findAgentById(selectedAgentId.value)
  } else {
    result = null
  }
  return result
})

const navigateToHelp = () => {
  props.searchController.inputText.value = "" // Hides SearchDropDown
  router.push(routeManager.makeRouteToSearchHelp())
}


</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped/>
