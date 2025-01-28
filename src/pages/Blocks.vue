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

  <PageFrameV2 page-title="Blocks">

    <div class="page-container">
      <DashboardCardV2>
        <template #title>
          <span>Blocks</span>
        </template>
        <template #left-control>
          <PlayPauseButton :controller="blockTableController"/>
        </template>
        <template #content>
          <BlockTable :controller="blockTableController"/>
        </template>
      </DashboardCardV2>
    </div>

  </PageFrameV2>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {inject, onBeforeUnmount, onMounted, ref} from 'vue';
import PageFrameV2 from "@/components/page/PageFrameV2.vue";
import BlockTable from "@/components/block/BlockTable.vue";
import {BlockTableController} from "@/components/block/BlockTableController";
import {useRouter} from "vue-router";
import DashboardCardV2 from "@/components/DashboardCardV2.vue";
import PlayPauseButton from "@/components/PlayPauseButton.vue";

defineProps({
  network: String
})

const isMediumScreen = inject('isMediumScreen', true)

// BlockTableController
const pageSize = ref(isMediumScreen ? 15 : 5)
const blockTableController = new BlockTableController(useRouter(), pageSize)
onMounted(() => blockTableController.mount())
onBeforeUnmount(() => blockTableController.unmount())

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.page-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-left: 32px;
  margin-right: 32px;
}

</style>
