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

  <PageFrame>
    <template #pageContent>
      <DashboardCard>
        <template v-slot:title>
          <span class="h-is-primary-title">Popular tokens matching </span>
          <span class="h-is-secondary-text">"{{ name }}"</span>
        </template>
        <template v-slot:content>
          <TokensByPopularityTable :name="name"/>
        </template>
      </DashboardCard>
    </template>
  </PageFrame>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, PropType} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";
import PageFrame from "@/components/page/PageFrame.vue";
import TokensByPopularityTable from "@/components/token/TokensByPopularityTable.vue";

export default defineComponent({
  name: 'TokensByPopularity',

  props: {
    network: String,
    name: {
      type: String as PropType<string|null>,
      default: null
    }
  },

  components: {
    TokensByPopularityTable,
    PageFrame,
    DashboardCard,
  },
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
