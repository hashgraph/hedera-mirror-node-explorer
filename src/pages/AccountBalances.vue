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
        <span class="h-is-primary-title">Token Balances for Account </span>
        <span class="h-is-secondary-text">{{ accountId }}</span>
      </template>
      <template v-slot:content>
        <BalanceTable v-bind:balances="tokenBalances"/>
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
import BalanceTable from "@/components/account/BalanceTable.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import Footer from "@/components/Footer.vue";
import {BalanceCache} from "@/utils/cache/BalanceCache";

export default defineComponent({

  name: 'AccountBalances',

  components: {
    Footer,
    DashboardCard,
    BalanceTable
  },

  props: {
    accountId: String,
    network: String
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    //
    // balanceLookup
    //
    const balanceLookup = BalanceCache.instance.makeLookup(computed(() => props.accountId ?? null))
    onMounted(() => balanceLookup.mount())
    onBeforeUnmount(() => balanceLookup.unmount())

    const tokenBalances = computed(() => {
        const allBalances = balanceLookup.entity.value?.balances
        return allBalances && allBalances.length >= 1 ? allBalances[0].tokens : []
    })

    return {
      isSmallScreen,
      isTouchDevice,
      tokenBalances,
    }
  }
});

</script>

<style/>