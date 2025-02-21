<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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
  <router-link v-if="isXLargeScreen && productLogoURL !== null" :to="routeManager.makeRouteToMainDashboard()">
    <img alt="Product Logo" :src="productLogoURL"/>
  </router-link>
  <router-link v-else-if="productMiniLogoURL !== null" :to="routeManager.makeRouteToMainDashboard()">
    <img class="mini-logo" alt="Product Logo" :src="productMiniLogoURL"/>
  </router-link>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {routeManager} from "@/router.ts"
import {ThemeController} from "@/components/ThemeController.ts";
import {inject} from "vue";

const productLogoURL = ThemeController.inject().productLogoURL
const productMiniLogoURL = ThemeController.inject().productMiniLogoURL
const isXLargeScreen = inject('isXLargeScreen', true)

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

img {
  height: auto;
  max-width: 130px;
}

img.mini-logo {
  max-width: 32px;
}

</style>
