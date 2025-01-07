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
  <div class="card-root">
    <div class="card-header">
      <div class="left-header">
        <div class="card-title">
          <slot name="title"/>
        </div>
        <slot name="left-control" v-if="!isCollapsed"/>
      </div>
      <div class="right-header">
        <slot name="right-control" v-if="!isCollapsed"/>
        <img v-if="isCollapsed" alt="Expand" @click="toggleCollapsed" :src="arrowDownURL">
        <img v-else alt="Collapse" @click="toggleCollapsed" :src="arrowUpURL">
      </div>
    </div>

    <slot name="subtitle"/>

    <div v-if="!isCollapsed">
      <slot name="content" v-if="slots.content"/>

      <div v-if="slots.mediaContent || slots.mediaDescription" class="media-content">
        <slot name="mediaContent"/>
        <div v-if="isMediumScreen" class="h-has-column-separator"/>
        <slot name="mediaDescription"/>
      </div>

      <div v-if="slots.leftContent || slots.rightContent" class="split-content">
        <slot name="leftContent"/>
        <div v-if="slots.rightContent&&isMediumScreen" class="h-has-column-separator"/>
        <slot name="rightContent"/>
      </div>
    </div>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, inject, onMounted, ref, useSlots} from "vue";
import {AppStorage} from "@/AppStorage";
import arrowDownLightURL from "@/assets/arrow-down-light.svg"
import arrowDownDarkURL from "@/assets/arrow-down-dark.svg"
import arrowUpLightURL from "@/assets/arrow-up-light.svg"
import arrowUpDarkURL from "@/assets/arrow-up-dark.svg"
import {ThemeController} from "@/components/ThemeController.ts";

const props = defineProps({
  subtitle: Boolean,
  collapsibleKey: {
    type: String,
    default: ''
  },
  collapsed: {
    type: Boolean,
    default: false
  }
})

const isMediumScreen = inject('isMediumScreen', true)
const slots = useSlots()

const isCollapsible = computed(() => props.collapsibleKey != '')
const isCollapsed = ref(false)

const darkSelected = ThemeController.inject().darkSelected
const arrowUpURL = computed(() => darkSelected.value ? arrowUpDarkURL : arrowUpLightURL)
const arrowDownURL = computed(() => darkSelected.value ? arrowDownDarkURL : arrowDownLightURL)

onMounted(() => {
  if (isCollapsible.value) {
    const userPref = AppStorage.getCollapsedState(props.collapsibleKey)
    isCollapsed.value = userPref != null ? userPref : props.collapsed
  }
})
const toggleCollapsed = () => {
  const newValue = !isCollapsed.value
  if (newValue === props.collapsed) {
    AppStorage.setCollapsedState(props.collapsibleKey, null)
  } else {
    AppStorage.setCollapsedState(props.collapsibleKey, newValue)
  }
  isCollapsed.value = newValue
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.card-root {
  background-color: var(--background-tertiary);
  border: 1px solid var(--table-border);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 32px;
}

div.card-header {
  align-items: flex-start;
  border-bottom: 1px solid var(--network-theme-color);
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding-bottom: 16px;
}

div.left-header {
  align-items: center;
  display: flex;
  gap: 12px;
  height: 26px;
  justify-content: flex-start;
}

div.card-title {
  color: var(--text-primary);
  font-family: 'Styrene A Web', serif;
  font-size: 20px;
  font-weight: 500;
  height: 26px;
  margin: 0;
}

div.right-header {
  align-items: center;
  display: flex;
  gap: 16px;
  height: 26px;
  justify-content: flex-end;
}

</style>
