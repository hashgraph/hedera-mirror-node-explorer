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
        <span class="h-is-primary-title">Recent Transactions</span>
      </template>
      <template v-slot:control>
        <div class="is-flex is-align-items-flex-end">
          <PlayPauseButtonV2 v-model:state="transactionCacheState"/>
          <TransactionFilterSelect v-model:filter="selectedTransactionFilter"/>
        </div>
      </template>
      <template v-slot:table>
        <TransactionTableV2 v-bind:transactions="transactions"/>
      </template>
    </DashboardCard>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted, ref, watch} from 'vue';

import TransactionTableV2 from "@/components/transaction/TransactionTableV2.vue";
import PlayPauseButtonV2 from "@/components/PlayPauseButtonV2.vue";
import TransactionFilterSelect from "@/components/transaction/TransactionFilterSelect.vue";
import {useRoute, useRouter} from "vue-router";
import DashboardCard from "@/components/DashboardCard.vue";
import Footer from "@/components/Footer.vue";
import {TransactionCacheV2} from "@/components/transaction/TransactionCacheV2";
import {EntityCacheStateV2} from "@/utils/EntityCacheV2";

export default defineComponent({
  name: 'Transactions',

  props: {
    network: String
  },

  components: {
    Footer,
    DashboardCard,
    TransactionFilterSelect,
    PlayPauseButtonV2,
    TransactionTableV2,
  },

  setup() {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    const router = useRouter()
    const route = useRoute()

    //
    // transaction filter selection
    //

    const selectedTransactionFilter = ref("")
    const updateQuery = () => {
      router.replace({
        query: {type: selectedTransactionFilter.value.toLowerCase()}
      })
    }
    watch(selectedTransactionFilter, () => {
      updateQuery()
    })

    //
    // transactionCache
    //

    const transactionCache = new TransactionCacheV2();

    const setupTransactionCache = () => {
      transactionCache.transactionType.value = transactionFilterFromRoute.value
      transactionCache.state.value = EntityCacheStateV2.Started
      selectedTransactionFilter.value = transactionFilterFromRoute.value
    }

    const transactionFilterFromRoute = computed(() => {
      return (route.query?.type as string ?? "").toUpperCase()
    })
    watch(transactionFilterFromRoute, () => {
      setupTransactionCache()
    })
    onMounted(() => {
      setupTransactionCache()
    })
    onBeforeUnmount(() => {
      transactionCache.state.value = EntityCacheStateV2.Stopped
    })

    return {
      isSmallScreen,
      isTouchDevice,
      transactions: transactionCache.transactions,
      transactionCacheState: transactionCache.state,
      selectedTransactionFilter,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>