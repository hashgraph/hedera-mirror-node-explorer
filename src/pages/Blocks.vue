<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2022 Hedera Hashgraph, LLC
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

  <section :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}" class="section">

    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Blocks</span>
      </template>
      <template v-slot:control>
        <div class="is-flex is-align-items-flex-end">
          <PlayPauseButtonV2 v-model:state="cacheState"/>
        </div>
      </template>
      <template v-slot:table>
        <BlockTable :blocks="blocks"/>
      </template>
    </DashboardCard>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, onBeforeUnmount, onMounted} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";
import Footer from "@/components/Footer.vue";
import BlockTable from "@/components/block/BlockTable.vue";
import {BlockCache} from "@/components/block/BlockCache";
import {EntityCacheStateV2} from "@/utils/EntityCacheV2";
import PlayPauseButtonV2 from "@/components/PlayPauseButtonV2.vue";

export default defineComponent({
  name: 'Blocks',

  props: {
    network: String
  },

  components: {
    PlayPauseButtonV2,
    BlockTable,
    Footer,
    DashboardCard
  },

  setup() {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    // BlockCache
    const blockCache = new BlockCache()
    onMounted(() => blockCache.state.value = EntityCacheStateV2.Started)
    onBeforeUnmount(() => blockCache.state.value = EntityCacheStateV2.Stopped)

    return {
      isSmallScreen,
      isTouchDevice,
      blocks: blockCache.blocks,
      cacheState: blockCache.state
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>