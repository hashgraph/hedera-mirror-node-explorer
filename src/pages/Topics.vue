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

  <hr class="h-top-banner" style="margin: 0; height: 4px"/>

  <section class="section" :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}">

    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Recent Topics</span>
      </template>
      <template v-slot:table>
        <TopicTable v-bind:transactions="transactions"/>
      </template>
    </DashboardCard>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, onBeforeUnmount, onMounted, watch} from 'vue';
import TopicTable from "@/components/topic/TopicTable.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import Footer from "@/components/Footer.vue";
import {TransactionCacheV2} from "@/components/transaction/TransactionCacheV2";
import {TransactionResult, TransactionType} from "@/schemas/HederaSchemas";
import {EntityCacheStateV2} from "@/utils/EntityCacheV2";

export default defineComponent({
  name: 'Topics',

  props: {
    network: String
  },

  components: {
    Footer,
    DashboardCard,
    TopicTable
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    const transactionCache = new TransactionCacheV2()
    transactionCache.transactionType.value = TransactionType.CONSENSUSCREATETOPIC
    transactionCache.transactionResult.value = TransactionResult.SUCCESS

    onMounted(() => {
      transactionCache.state.value = EntityCacheStateV2.Started
    })

    watch(() => props.network, () => {
      transactionCache.clear()
    })

    onBeforeUnmount(() => {
      transactionCache.state.value = EntityCacheStateV2.Stopped
    })

    return {
      transactions: transactionCache.transactions,
      isSmallScreen,
      isTouchDevice,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>