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
  <ul v-if="props.tabIds.length >= 1" style="padding: 0; margin: 0;">
    <li
        :class="{'is-active':selectedTab === tab,'sub-tab': props.subTabs}"
        v-for="(tab, i) in props.tabIds"
        :key="tab"
        :id="'tab-' + tab"
        @click="handleSelect(tab, true)"
    >
      <a>
        {{ props.tabLabels[i] ?? tab }}
      </a>
    </li>
  </ul>
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
  },
  subTabs: {
    type: Boolean,
    default: false
  },
  compact: {  // NOTE: compact is ignored when subTabs===true
    type: Boolean,
    default: false
  }
})

const selectedTab = defineModel("selectedTab", {
  type: String as PropType<string | null>,
  default: null
})

const interactiveSelection = ref<boolean>(true) // true because initial value must be preserved

const handleSelect = (tab: string | null, interactive: boolean) => {
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

<style scoped>

ul {
  align-items: center;
  column-gap: 16px;
  display: flex;
}

li {
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  line-height: 18px;
  padding: 8px 8px;
}

li.sub-tab {
  font-size: 12px;
  line-height: 15px;
}

li.is-active {
  background-color: var(--tab-background);
}

a {
  color: var(--text-secondary);
}

.is-active a {
  color: var(--text-primary);
  font-weight: 700;
}

</style>
