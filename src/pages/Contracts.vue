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
        <div class="h-is-primary-title">{{ filterVerified ? 'Recent Verified Contracts' : 'Recent Contracts' }}</div>
      </template>
      <template v-if="filterVerified" v-slot:subtitle>
        <div class="has-text-grey">{{ 'in the last ' + VerifiedContractsCache.MAX_CANDIDATES + ' contracts' }}</div>
      </template>
      <template v-slot:control>
        <div class="is-flex is-justify-content-end is-align-items-center" style="line-height: 1rem">
          <PlayPauseButton v-if="!filterVerified" :controller="contractTableController"/>
          <PlayPauseButton v-else :controller="contractsLookup"/>
          <span class="ml-5 mr-2">All</span>
          <o-field>
            <o-switch v-model="filterVerified">Verified</o-switch>
          </o-field>
        </div>
      </template>
      <template v-slot:content>
        <ContractTable v-if="!filterVerified" :controller="contractTableController"/>
        <VerifiedContractTable v-else :contracts-lookup="contractsLookup"/>
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
import EmptyTable from "@/components/EmptyTable.vue";
import VerifiedContractTable from "@/components/contract/VerifiedContractTable.vue";
import {VerifiedContractsCache} from "@/utils/cache/VerifiedContractsCache";

export default defineComponent({
  name: 'Contracts',
    computed: {
        VerifiedContractsCache() {
            return VerifiedContractsCache
        }
    },

  props: {
    network: String
  },

  components: {
      VerifiedContractTable,
      EmptyTable,
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

    //
    // VerifiedContractsCache
    //
    const contractsLookup = VerifiedContractsCache.instance.makeLookup()

    return {
      isSmallScreen,
      isTouchDevice,
      filterVerified,
      contractTableController,
      contractsLookup,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>