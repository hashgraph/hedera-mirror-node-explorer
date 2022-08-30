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

  <section class="section" :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}">

    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Recent Accounts</span>
      </template>
      <template v-slot:content>
        <AccountTable v-bind:accounts="accounts"/>
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
import AccountTable from "@/components/account/AccountTable.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import Footer from "@/components/Footer.vue";
import {AccountCache} from "@/components/account/AccountCache";
import {EntityCacheStateV2} from "@/utils/EntityCacheV2";

export default defineComponent({
  name: 'Accounts',

  props: {
    network: String
  },

  components: {
    Footer,
    DashboardCard,
    AccountTable
  },

  setup() {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    const accountCache = new AccountCache()
    onMounted(() => {
      accountCache.state.value = EntityCacheStateV2.Started
    })
    onBeforeUnmount(() => {
      accountCache.state.value = EntityCacheStateV2.Stopped
    })

    return {
      isSmallScreen,
      isTouchDevice,
      accounts: accountCache.accounts,
      accountCache, // For testing purpose
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>