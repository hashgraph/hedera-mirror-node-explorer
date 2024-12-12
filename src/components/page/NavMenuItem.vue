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
  <router-link :to="props.targetRoute" :replace="isMobile"
               class="button is-ghost h-is-navbar-item h-is-dense"
               :class="classObject">{{ props.tabId }}</router-link>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, PropType} from "vue";
import {RouteLocationRaw} from "vue-router";
import {routeManager} from "@/router.ts";

const props = defineProps({
  tabId: {
    type: String,
    required: true
  },
  targetRoute: {
    type: Object as PropType<RouteLocationRaw>,
    required: true
  },
  isMobile: {
    type: Boolean,
    default: false
  },
  isFirst: {
    type: Boolean,
    default: false
  }
})

const isRimmed = computed(
    () => props.tabId === routeManager.currentTabId.value)

const classObject = computed(() => ({
  "is-rimmed": isRimmed.value,
  "is-first": props.isFirst,
  "h-is-mobile-navbar-item": props.isMobile
}))

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
