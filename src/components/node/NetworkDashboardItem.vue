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

  <p v-if="isMediumScreen" class="h-is-property-text mb-1">{{ title }}</p>
  <p v-else class="h-is-text-size-3 mb-1">{{ title }}</p>
  <DashboardItem :is-numeric="false" :name="name" :value="value" :variation="variation"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject} from 'vue';
import DashboardItem from "@/components/dashboard/DashboardItem.vue";

export default defineComponent({
  name: 'NetworkDashboardItem',
  components: {DashboardItem},
  props: {
    title: String,
    name: String,
    value: String,
    variation: String
  },
  setup() {
    const isMediumScreen = inject('isMediumScreen', true)

    return {
      isMediumScreen
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
