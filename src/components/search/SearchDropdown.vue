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
  <div style="position: relative" ref="root">
    <div v-if="searchController.visible.value" class="box" style="position: absolute; display: flex; flex-direction: column; gap: 1rem; width: 100%; top: 5px; left: 0; z-index: 10; border: 0.5px solid white; padding: 16px 12px;">
      <template v-for="c in searchController.candidates.value" :key="c.description">
        <EntityLink :route="c.route" :will-navigate="willNavigate">{{ c.description }}</EntityLink>
      </template>
      <div v-if="searchController.candidateCount.value == 0 && !searchController.loading.value" class="has-text-grey">
        No match
      </div>
    </div>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {onBeforeUnmount, onMounted, PropType, ref} from "vue";
import {SearchController} from "@/components/search/SearchController";
import EntityLink from "@/components/values/link/EntityLink.vue";

const props = defineProps({
  "searchController": {
    type: Object as PropType<SearchController>,
    required: true
  }
})

const willNavigate = () => {
  props.searchController.inputText.value = "" // Hides SearchDropDown
}

const root = ref<HTMLElement|null>(null)
const isInside = (target: Node) => root.value !== null && root.value.contains(target)

const onMouseDown = (ev: MouseEvent) => {
  if (ev.target instanceof Node && !isInside(ev.target)) {
    props.searchController.inputText.value = "" // Hides SearchDropdown
  }
}
onMounted(() => {
  document.addEventListener("mousedown", onMouseDown)
})
onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onMouseDown)
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped/>