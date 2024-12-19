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
    <o-switch v-model="darkSelected">{{ darkSelected ? 'dark' : 'light' }}</o-switch>
  </o-field>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {onMounted, ref, watch} from "vue";
import {AppStorage} from "@/AppStorage.ts";

const darkSelected = ref(false)
onMounted(() => {
  darkSelected.value = AppStorage.getTheme() === 'dark'

})
onMounted(() => {
  watch(darkSelected, (dark) => {
    if (dark) {
      AppStorage.setTheme('dark')
      document.documentElement.style.setProperty('--theme-text-primary', 'var(--dark-text-primary)')
      document.documentElement.style.setProperty('--theme-text-secondary', 'var(--dark-text-secondary)')
      document.documentElement.style.setProperty('--h-theme-page-background-color', 'var(--dark-background-primary)')
      document.documentElement.style.setProperty('--h-theme-box-background-color', 'var(--dark-background-tertiary)')
      document.documentElement.style.setProperty('--theme-table-border', 'var(--dark-table-border)')
    } else {
      AppStorage.setTheme('light')
      document.documentElement.style.setProperty('--theme-text-primary', 'var(--light-text-primary)')
      document.documentElement.style.setProperty('--theme-text-secondary', 'var(--light-text-secondary)')
      document.documentElement.style.setProperty('--h-theme-page-background-color', 'var(--light-background-primary)')
      document.documentElement.style.setProperty('--h-theme-box-background-color', 'var(--light-background-tertiary)')
      document.documentElement.style.setProperty('--theme-table-border', 'var(--light-table-border)')
    }
  }, {immediate: true})
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped/>
