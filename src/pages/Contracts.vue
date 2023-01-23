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

  <section class="section" :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}">

    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Recent Contracts</span>
      </template>
      <template v-slot:control>
        <PlayPauseButton :controller="contractTableController"/>
      </template>
      <template v-slot:content>
        <ContractTable :controller="contractTableController"/>
      </template>
    </DashboardCard>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted} from 'vue';
import ContractTable from "@/components/contract/ContractTable.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import Footer from "@/components/Footer.vue";
import PlayPauseButton from "@/components/PlayPauseButton.vue";
import {ContractTableController} from "@/components/contract/ContractTableController";
import {useRouter} from "vue-router";

export default defineComponent({
  name: 'Contracts',

  props: {
    network: String
  },

  components: {
    PlayPauseButton,
    Footer,
    DashboardCard,
    ContractTable
  },

  setup() {
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    //
    // ContractTableController
    //
    const perPage = computed(() => isMediumScreen ? 15 : 10)
    const contractTableController = new ContractTableController(useRouter(), perPage)
    onMounted(() => contractTableController.mount())
    onBeforeUnmount(() => contractTableController.unmount())

    return {
      isSmallScreen,
      isTouchDevice,
      contractTableController,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>