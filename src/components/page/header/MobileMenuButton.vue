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
  <DropdownPanel v-model:deployed="showMobileMenu" :right-aligned="false">
    <template #button>
      <Menu :size="18" style="color: var(--text-primary)" @click="showMobileMenu = !showMobileMenu"/>
    </template>

    <template #panel>
      <div class="menu">
        <div class="menu-l1">
          <ThemeSwitch/>
          <X :size="18" style="color: var(--text-primary)" @click="showMobileMenu = false"/>
        </div>
        <TabBar vertical style="padding-left: 8px"/>
        <NetworkSelector/>
      </div>
    </template>
  </DropdownPanel>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {Menu, X} from 'lucide-vue-next';
import DropdownPanel from "@/components/DropdownPanel.vue";
import {ref} from "vue";
import TabBar from "@/components/page/header/TabBar.vue";
import NetworkSelector from "@/components/page/header/NetworkSelector.vue";
import ThemeSwitch from "@/components/ThemeSwitch.vue";

const showMobileMenu = ref(false)

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.menu {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: 24px;
  justify-content: stretch;
}

div.menu-l1 {
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding-left: 8px;
  width: 100%;
}

</style>
