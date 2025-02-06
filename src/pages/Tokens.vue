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

  <PageFrameV2 page-title="Tokens">

    <div class="h-side-by-side-content">

      <DashboardCardV2>
        <template #title>
          <span>Recent NFTs</span>
        </template>
        <template #left-control>
          <PlayPauseButton :controller="nftTableController"/>
        </template>
        <template #content>
          <TokenTable :controller="nftTableController"/>
        </template>
      </DashboardCardV2>

      <DashboardCardV2>
        <template #title>
          <span>Recent Fungible Tokens</span>
        </template>
        <template #left-control>
          <PlayPauseButton :controller="tokenTableController"/>
        </template>
        <template #content>
          <TokenTable :controller="tokenTableController"/>
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
import TokenTable from "@/components/token/TokenTable.vue";
import PageFrameV2 from "@/components/page/PageFrameV2.vue";
import {TokenTableController} from "@/components/token/TokenTableController";
import {useRouter} from "vue-router";
import {TokenType} from "@/schemas/MirrorNodeSchemas";
import DashboardCardV2 from "@/components/DashboardCardV2.vue";
import PlayPauseButton from "@/components/PlayPauseButton.vue";

defineProps({
  network: String
})

const isMediumScreen = inject('isMediumScreen', true)

//
// NFT and TOKEN TableController
//
const perPage = ref(isMediumScreen ? 15 : 10)
const nftTableController = new TokenTableController(useRouter(), perPage, ref(TokenType.NON_FUNGIBLE_UNIQUE), "p1", "k1")
const tokenTableController = new TokenTableController(useRouter(), perPage, ref(TokenType.FUNGIBLE_COMMON), "p2", "k2")
onMounted(() => {
  nftTableController.mount()
  tokenTableController.mount()
})
onBeforeUnmount(() => {
  nftTableController.unmount()
  tokenTableController.unmount()
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
