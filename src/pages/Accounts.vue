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
        <span class="h-is-primary-title">Recent Accounts</span>
      </template>
      <template v-slot:control>
        <PlayPauseButtonV3 v-bind:controller="accountTableController"/>
      </template>
      <template v-slot:content>
        <AccountTable :controller="accountTableController"/>
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
import AccountTable from "@/components/account/AccountTable.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import Footer from "@/components/Footer.vue";
import {AccountTableController} from "@/components/account/AccountTableController";
import PlayPauseButtonV3 from "@/utils/table/PlayPauseButtonV3.vue";
import {useRouter} from "vue-router";

export default defineComponent({
  name: 'Accounts',

  props: {
    network: String
  },

  components: {
    PlayPauseButtonV3,
    Footer,
    DashboardCard,
    AccountTable
  },

  setup() {
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    //
    // AccountTableController
    //
    const perPage = computed(() => isMediumScreen ? 15 : 10)
    const accountTableController = new AccountTableController(useRouter(), perPage)
    onMounted(() => accountTableController.mounted.value = true)
    onBeforeUnmount(() => accountTableController.mounted.value = false)

    return {
      isSmallScreen,
      isTouchDevice,
      accountTableController,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>