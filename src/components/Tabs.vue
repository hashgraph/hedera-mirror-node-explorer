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
  <div class="is-flex is-justify-content-space-between is-align-items-center mt-5 mb-4">
    <div class="tabs is-toggle h-is-property-text mb-1">
      <ul>
        <li v-for="(tab, i) in tabIds" :key="tab" :class="{'is-active':selectedTab === tab}">
          <a :id="'tab-' + tab" :style="{fontWeight: selectedTab === tab ? 500 : 300}"
             @click="handleSelect(tab, true)">
            <span>{{ tabLabels[i] ?? tab }}</span>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {PropType, ref, watch} from "vue";

const props = defineProps({
  tabIds: {
    type: Array as PropType<string[]>,
    required: true
  },
  tabLabels: {
    type: Array as PropType<string[]>,
    default: [] as string[] /* to please eslint */
  }
})

const selectedTab = defineModel("selectedTab", {
  type: String as PropType<string|null>,
  default: null
})
const interactiveSelection = ref<boolean>(true) // true because initial value must be preserved

const handleSelect = (tab: string|null, interactive: boolean) => {
  selectedTab.value = tab
  interactiveSelection.value = interactive
}

const adjustSelectedTab = () => {
  if (props.tabIds.length >= 1) {
    if (selectedTab.value === null || props.tabIds.indexOf(selectedTab.value) == -1 || !interactiveSelection.value) {
      handleSelect(props.tabIds[0], false)
    } // else selectedTab remains unchanged
  } else {
    handleSelect(null, false)
  }
}

watch(() => props.tabIds, adjustSelectedTab, {immediate: true})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>