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
        <span class="h-is-primary-title">Transactions with ID </span>
        <span class="h-is-secondary-text">{{ normalizedTransactionId }}</span>
      </template>
      <template v-slot:control>
        <div class="is-flex is-align-items-flex-end">
          <PlayPauseButtonV2 v-model:state="transactionCacheState"/>
        </div>
      </template>
      <template v-slot:content>
        <TransactionByIdTable v-bind:transactions="transactions"/>
      </template>
    </DashboardCard>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted, watch} from 'vue';
import PlayPauseButtonV2 from "@/components/PlayPauseButtonV2.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import TransactionByIdTable from "@/components/transaction/TransactionByIdTable.vue";
import {normalizeTransactionId} from "@/utils/TransactionID";
import Footer from "@/components/Footer.vue";
import {EntityCacheStateV2} from "@/utils/EntityCacheV2";
import {TransactionByIdCache} from "@/components/transaction/TransactionByIdCache";

export default defineComponent({
  name: 'TransactionsById',

  props: {
    network: String,
    transactionId: String
  },

  components: {
    Footer,
    DashboardCard,
    PlayPauseButtonV2,
    TransactionByIdTable,
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    const normalizedTransactionId = computed(() => {
      return props.transactionId ? normalizeTransactionId(props.transactionId, true) : "?";
    })

    //
    // transactionCache
    //

    const transactionCache = new TransactionByIdCache();

    const setupTransactionCache = () => {
      transactionCache.transactionId.value = props.transactionId ?? null
      transactionCache.state.value = EntityCacheStateV2.Started
    }

    watch(() => props.transactionId, () => {
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
      normalizedTransactionId
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>