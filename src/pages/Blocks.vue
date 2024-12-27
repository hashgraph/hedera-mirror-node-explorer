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
    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Blocks</span>
      </template>
      <template v-slot:control>
        <PlayPauseButton v-bind:controller="blockTableController"/>
      </template>
      <template v-slot:content>
        <BlockTable :controller="blockTableController"/>
      </template>
    </DashboardCard>
  </PageFrameV2>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, onBeforeUnmount, onMounted, ref} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";
import PageFrameV2 from "@/components/page/PageFrameV2.vue";
import BlockTable from "@/components/block/BlockTable.vue";
import PlayPauseButton from "@/components/PlayPauseButton.vue";
import {BlockTableController} from "@/components/block/BlockTableController";
import {useRouter} from "vue-router";

export default defineComponent({
  name: 'Blocks',

  props: {
    network: String
  },

  components: {
    PlayPauseButton,
    BlockTable,
    PageFrameV2,
    DashboardCard
  },

  setup() {
    const isMediumScreen = inject('isMediumScreen', true)

    // BlockTableController
    const pageSize = ref(isMediumScreen ? 15 : 5)
    const blockTableController = new BlockTableController(useRouter(), pageSize)
    onMounted(() => blockTableController.mount())
    onBeforeUnmount(() => blockTableController.unmount())

    return {
      blockTableController
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
