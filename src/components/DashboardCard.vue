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
  <div :class="{'box': !isTouchDevice && isSmallScreen, 'h-box-border': !isTouchDevice && isSmallScreen}"
       style="height: 100%">
    <div class="is-flex is-align-items-center is-justify-content-space-between is-relative">
      <div>
        <slot name="title"></slot>
      </div>
      <div class="is-flex is-align-items-center is-justify-content-end">
        <div v-if="!isCollapsed">
          <slot name="control"></slot>
        </div>
        <img v-if="isCollapsible && isCollapsed" alt="Expand section"
             @click="toggleCollapsed" src="@/assets/arrow-down.svg">
        <img v-else-if="isCollapsible" alt="Collapse section" class="ml-4"
             @click="toggleCollapsed" src="@/assets/arrow-up.svg">
      </div>
    </div>

    <div>
      <slot name="subtitle"></slot>
    </div>

    <div v-if="!isCollapsed">
      <hr class="h-card-separator mb-3"/>

      <div v-if="slots.content" class="h-is-property-text">
        <slot name="content"></slot>
      </div>

      <div v-if="slots.mediaContent || slots.mediaDescription"
           class="h-is-property-text"
           :class="{'is-flex':isMediumScreen}"
           style="gap: 20px"
      >

        <div class="is-flex is-justify-content-center" :class="{'my-4':!isMediumScreen}">
          <slot name="mediaContent"></slot>
        </div>

        <div style="flex-grow: 0.8" :class="{'h-has-column-separator': isMediumScreen}">
          <slot name="mediaDescription"></slot>
        </div>

      </div>

      <div v-if="slots.leftContent || slots.rightContent" class="columns is-multiline h-is-property-text">

        <div :class="{'is-full': !isMediumScreen}" class="column is-6-desktop">
          <slot name="leftContent"></slot>
        </div>
        <div :class="{'h-has-column-separator':slots.rightContent&&isMediumScreen}" class="column is-6-desktop">
          <slot name="rightContent"></slot>
        </div>

      </div>

      <div v-if="!isSmallScreen" class="mb-5"/>

    </div>
    <p v-else class="mb-1"/>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onMounted, ref, useSlots} from "vue";
import {AppStorage} from "@/AppStorage";

export default defineComponent({
  name: "DashboardCard",

  props: {
    subtitle: Boolean,
    collapsibleKey: {
      type: String,
      default: ''
    },
    collapsed: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)
    const slots = useSlots()

    const isCollapsible = computed(() => props.collapsibleKey != '')
    const isCollapsed = ref(false)
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

    return {
      isSmallScreen,
      isMediumScreen,
      isTouchDevice,
      slots,
      isCollapsible,
      isCollapsed,
      toggleCollapsed
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>

td {
  border: black
}

</style>
