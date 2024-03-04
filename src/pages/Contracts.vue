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

  <section class="section" :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}">

    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Recent Contracts</span>
      </template>
      <template v-slot:control>
        <div class="is-flex is-justify-content-end is-align-items-center">
          <PlayPauseButton v-if="!filterVerified" :controller="contractTableController"/>
          <PlayPauseButton v-else :controller="verifiedContractsController"/>
          <span class="ml-5 mr-2">All</span>
          <o-field>
            <o-switch v-model="filterVerified">Verified</o-switch>
          </o-field>
        </div>
      </template>
      <template v-slot:content>
        <ContractTable v-if="!filterVerified" :controller="contractTableController"/>
        <VerifiedContractsTable
            v-else
            :controller="verifiedContractsController"
            :loaded="loaded"
            :overflow="overflow"
        />
      </template>
    </DashboardCard>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, ref} from 'vue';
import ContractTable from "@/components/contract/ContractTable.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import Footer from "@/components/Footer.vue";
import PlayPauseButton from "@/components/PlayPauseButton.vue";
import {ContractTableController} from "@/components/contract/ContractTableController";
import {useRouter} from "vue-router";
import VerifiedContractsTable from "@/components/account/VerifiedContractsTable.vue";
import {AllVerifiedContractsController} from "@/components/contract/AllVerifiedContractsController";

export default defineComponent({
  name: 'Contracts',

  props: {
    network: String
  },

  components: {
    VerifiedContractsTable,
    PlayPauseButton,
    Footer,
    DashboardCard,
    ContractTable
  },

  setup() {
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    const filterVerified = ref(false)

    //
    // ContractTableController
    //
    const perPage = computed(() => isMediumScreen ? 15 : 10)
    const contractTableController = new ContractTableController(useRouter(), perPage)
    const verifiedContractsController = new AllVerifiedContractsController()

    return {
      isSmallScreen,
      isTouchDevice,
      contractTableController,
      verifiedContractsController,
      loaded: verifiedContractsController.loaded,
      overflow: verifiedContractsController.overflow,
      filterVerified,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>