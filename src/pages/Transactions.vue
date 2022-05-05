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
          <PlayPauseButton v-model="cacheState"/>
          <TransactionTypeSelect v-model="selectedTransactionType"/>
        </div>
      </template>
      <template v-slot:table>
        <TransactionTable
            v-model:cacheState="cacheState"
            v-bind:transactionTypeFilter="selectedTransactionType"
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

import {defineComponent, inject, ref, watch} from 'vue';

import TransactionTable from "@/components/transaction/TransactionTable.vue";
import PlayPauseButton, {PlayPauseState} from "@/components/PlayPauseButton.vue";
import TransactionTypeSelect, {TransactionOption} from "@/components/transaction/TransactionTypeSelect.vue";
import {useRoute, useRouter} from "vue-router";
import {TransactionType} from "@/schemas/HederaSchemas";
import DashboardCard from "@/components/DashboardCard.vue";
import Footer from "@/components/Footer.vue";

export default defineComponent({
  name: 'Transactions',

  props: {
    network: String
  },

  components: {
    Footer,
    DashboardCard,
    TransactionTypeSelect,
    PlayPauseButton,
    TransactionTable,
  },

  setup() {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    const router = useRouter()
    const route = useRoute()
    const typeQuery = (route.query?.type as string ?? "").toUpperCase()

    const selectedTransactionType = ref<TransactionOption>(
        (Object.keys(TransactionType).indexOf(typeQuery) >= 0)
            ? typeQuery as TransactionOption
            : ""
    )

    const updateQuery = () => {
      router.replace({
        query: {type: selectedTransactionType.value.toLowerCase()}
      })
    }

    updateQuery()
    watch(selectedTransactionType, () => {
      updateQuery()
    })

    const cacheState = ref<PlayPauseState>(PlayPauseState.Play)

    return {isSmallScreen, isTouchDevice, selectedTransactionType, cacheState}
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>