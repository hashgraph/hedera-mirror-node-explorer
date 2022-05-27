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
        <span class="h-is-primary-title">Transactions with ID </span>
        <span class="h-is-secondary-text">{{ normalizedTransactionId }}</span>
      </template>
      <template v-slot:control>
        <div class="is-flex is-align-items-flex-end">
          <PlayPauseButton v-model="cacheState"/>
        </div>
      </template>
      <template v-slot:table>
        <TransactionByIdTable
            v-bind:transaction-id="transactionId"
            v-model:cacheState="cacheState"
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
import PlayPauseButton, {PlayPauseState} from "@/components/PlayPauseButton.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import TransactionByIdTable from "@/components/transaction/TransactionByIdTable.vue";
import {normalizeTransactionId} from "@/utils/TransactionID";
import Footer from "@/components/Footer.vue";

export default defineComponent({
  name: 'TransactionsById',

  props: {
    network: String,
    transactionId: String
  },

  components: {
    Footer,
    DashboardCard,
    PlayPauseButton,
    TransactionByIdTable,
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    const cacheState = ref<PlayPauseState>(PlayPauseState.Play)

    const normalizedTransactionId = computed(() => {
      return props.transactionId ? normalizeTransactionId(props.transactionId, true) : "?";
    })

    return {isSmallScreen, isTouchDevice, cacheState, normalizedTransactionId}
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>