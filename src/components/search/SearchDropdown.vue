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
    <div v-if="searchController.visible.value" class="box" style="position: absolute; display: flex; flex-direction: column; gap: 1rem; width: 100%; top: 5px; left: 0; z-index: 10; border: 0.5px solid white; padding: 16px 12px;">
      <template v-for="(c,i) in searchController.candidates.value" :key="c.description">
        <button class="button-as-link h-is-property-text"
                :class="{'h-is-hoverable': !c.nonExistent, 'has-text-grey': c.nonExistent}"
                @click="navigate(c)" :disabled="c.nonExistent">
          {{ c.description }}
          <span v-if="c.extra" class="has-text-grey">{{ c.extra }}</span>
          <span v-if="i == 0" style="float: right">&#x23ce;</span>
        </button>
      </template>
      <template v-for="a in searchController.domainNameSearchAgents" :key="a.constructor.name">
        <div v-if="a.loading.value" class="has-text-grey h-is-property-text">
          Connecting to {{ a.provider.providerAlias }}…
        </div>
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

import {PropType} from "vue";
import {SearchController} from "@/components/search/SearchController";
import {SearchCandidate} from "@/components/search/SearchAgent";
import router, {routeManager} from "@/router";

const props = defineProps({
  "searchController": {
    type: Object as PropType<SearchController>,
    required: true
  }
})

const navigate = (c: SearchCandidate<unknown>) => {
  props.searchController.inputText.value = "" // Hides SearchDropDown
  c.agent.willNavigate(c)
  router.push(c.route)
}

const navigateToHelp = () => {
  props.searchController.inputText.value = "" // Hides SearchDropDown
  router.push(routeManager.makeRouteToSearchHelp())
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>
.button-as-link {
  background: none!important;
  border: none;
  padding: 0!important;
  text-align: left;
  color: white;
  cursor: pointer;
}
</style>