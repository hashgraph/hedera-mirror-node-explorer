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

  <div @click="darkSelected = !darkSelected" :class="{'left': !darkSelected, 'right': darkSelected}">
    <img :src="imageURL" alt="theme switch"/>
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed} from "vue";
import {ThemeController} from "@/components/ThemeController.ts";
import moonURL from "@/assets/moon.svg"
import sunURL from "@/assets/sun.svg"

const darkSelected = ThemeController.inject().darkSelected
const imageURL = computed(() => darkSelected.value ? moonURL : sunURL)

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div {
  align-items: center;
  background: var(--text-secondary);
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  height: 24px;
  padding: 4px;
  width: 40px;
}

div.left {
  justify-content: flex-start;
}

div.right {
  justify-content: flex-end;
}

img {
  height: 16px;
  width: 16px;
}

</style>
