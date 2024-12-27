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

  <PageFrameV2 page-title="Tokens by Name">
    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Tokens matching </span>
        <span class="h-is-secondary-text">"{{ name }}"</span>
      </template>
      <template v-slot:content>
        <TokensByNameTable :name="name"/>
      </template>
    </DashboardCard>
  </PageFrameV2>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, PropType} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";
import PageFrameV2 from "@/components/page/PageFrameV2.vue";
import TokensByNameTable from "@/components/token/TokensByNameTable.vue";

export default defineComponent({
  name: 'TokensByName',

  props: {
    network: String,
    name: {
      type: String as PropType<string|null>,
      default: null
    }
  },

  components: {
    TokensByNameTable,
    PageFrameV2,
    DashboardCard,
  },
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
