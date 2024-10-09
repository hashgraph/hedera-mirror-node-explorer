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
  <div>
    <template v-for="(c,i) in searchAgent.candidates.value" :key="i">
      <button class="button-as-link h-is-property-text"
              :class="{'h-is-hoverable': c.route !== null, 'has-text-grey': c.route === null || c.secondary}"
              @click="navigate(c)" :disabled="c.route === null" style="width: 100%">
        {{ c.description }}
        <span v-if="c.extra" class="has-text-grey">{{ c.extra }}</span>
        <span v-if="i == 0" style="float: right">&#x23ce;</span>
      </button>
    </template>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {PropType} from "vue";
import {SearchAgent, SearchCandidate} from "@/components/search/SearchAgent";
import router from "@/router";
import {SearchController} from "@/components/search/SearchController";

const props = defineProps({
  "searchController": {
    type: Object as PropType<SearchController>,
    required: true
  },
  "searchAgent": {
    type: Object as PropType<SearchAgent<unknown, unknown>>,
    required: true
  },
})


const navigate = (c: SearchCandidate<unknown>) => {
  if (c.route !== null) {
    props.searchController.inputText.value = "" // Hides SearchDropDown
    c.agent.willNavigate(c)
    router.push(c.route)
  }
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
