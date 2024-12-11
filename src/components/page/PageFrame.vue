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

  <section class="section is-top-section" :class="{'is-medium-screen': isMediumScreen}">
    <TopNavBar/>
  </section>

  <hr v-if="!props.onMainDashboardPage" class="h-has-background-color" style="margin: 0; height: 4px"/>

  <slot name="pageContent"/>

  <Footer :keep-background="props.keepFooterBackground"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {inject} from "vue";
import Footer from "@/components/page/Footer.vue";
import TopNavBar from "@/components/page/TopNavBar.vue";

const props = defineProps({
  onMainDashboardPage: {
    type: Boolean,
    default: false
  },
  keepFooterBackground: {
    type: Boolean,
    default: false
  }
})
const isMediumScreen = inject('isMediumScreen', true)

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

section.section.is-top-section {
  padding-top: 0;
  padding-bottom: 0;
  background-image: url("assets/block-chain-bg.png");
  background-repeat: no-repeat;
  background-size: 104px
}

section.section.is-top-section.is-medium-screen {
  padding-bottom: 30px;
  background-size: 112px
}

</style>
