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

  <o-field>
    <o-switch v-model="darkSelected">
      <span style="color: var(--network-theme-color)">
        {{ darkSelected ? 'dark' : 'light' }}
      </span>
    </o-switch>
  </o-field>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {onMounted, ref, watch} from "vue";
import {AppStorage} from "@/AppStorage.ts";
import {NetworkConfig} from "@/config/NetworkConfig.ts";

const networkConfig = NetworkConfig.inject()

const darkSelected = ref(false)
onMounted(() => {
  darkSelected.value = AppStorage.getTheme() === 'dark'

})
onMounted(() => {
  watch(darkSelected, (dark) => {
    if (dark) {
      AppStorage.setTheme('dark')
      document.documentElement.style.setProperty('--text-primary', 'var(--dark-text-primary)')
      document.documentElement.style.setProperty('--text-secondary', 'var(--dark-text-secondary)')
      document.documentElement.style.setProperty('--background-primary', 'var(--dark-background-primary)')
      document.documentElement.style.setProperty('--background-tertiary', 'var(--dark-background-tertiary)')
      document.documentElement.style.setProperty('--table-border', 'var(--dark-table-border)')
      document.documentElement.style.setProperty('--network-theme-color', 'var(--dark-network-theme-color)')
    } else {
      AppStorage.setTheme('light')
      document.documentElement.style.setProperty('--text-primary', 'var(--light-text-primary)')
      document.documentElement.style.setProperty('--text-secondary', 'var(--light-text-secondary)')
      document.documentElement.style.setProperty('--background-primary', 'var(--light-background-primary)')
      document.documentElement.style.setProperty('--background-tertiary', 'var(--light-background-tertiary)')
      document.documentElement.style.setProperty('--table-border', 'var(--light-table-border)')
      document.documentElement.style.setProperty('--network-theme-color', 'var(--light-network-theme-color)')
    }
  }, {immediate: true})
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped/>
