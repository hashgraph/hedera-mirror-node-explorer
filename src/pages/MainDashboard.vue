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

  <HbarMarketDashboard/>

  <section class="section" :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}">

    <div class="columns">

      <div class="column">
        <DashboardCard data-cy="cryptoTransfers">
          <template v-slot:title>
            <span class="h-is-primary-subtitle">Crypto Transfers</span>
          </template>
          <template v-slot:control>
            <PlayPauseButton
                v-model="CryptoTransactionCacheState"/>
          </template>
          <template v-slot:table>
            <CryptoTransactionTable
                v-model:cacheState="CryptoTransactionCacheState"
                v-bind:nb-items="6"
            />
          </template>
        </DashboardCard>
      </div>

    </div>

    <div class="columns is-multiline">

      <div class="column" :class="{'is-full': !displaySideBySide}">
        <DashboardCard data-cy="smartContractCalls">
          <template v-slot:title>
            <span class="h-is-primary-subtitle">Smart Contract Calls</span>
          </template>
          <template v-slot:control>
            <PlayPauseButton
                v-model="ContractCallTransactionCacheState"/>
          </template>
          <template v-slot:table>
            <ContractCallTransactionTable
                v-model:cacheState="ContractCallTransactionCacheState"
                v-bind:nb-items="6"
            />
          </template>
        </DashboardCard>
      </div>

      <div class="column">
        <DashboardCard data-cy="hcsMessages">
          <template v-slot:title>
            <span class="h-is-primary-subtitle">HCS Messages</span>
          </template>
          <template v-slot:control>
            <PlayPauseButton
                v-model="MessageTransactionCacheState"/>
          </template>
          <template v-slot:table>
            <MessageTransactionTable
                v-model:cacheState="MessageTransactionCacheState"
                v-bind:nb-items="6"
            />
          </template>
        </DashboardCard>
      </div>

    </div>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, ref, watch} from 'vue';

import HbarMarketDashboard from "../components/dashboard/HbarMarketDashboard.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import PlayPauseButton, {PlayPauseState} from "@/components/PlayPauseButton.vue";
import CryptoTransactionTable from "@/components/dashboard/CryptoTransactionTable.vue";
import MessageTransactionTable from "@/components/dashboard/MessageTransactionTable.vue";
import ContractCallTransactionTable from "@/components/dashboard/ContractCallTransactionTable.vue";
import {TransactionType} from "@/schemas/HederaSchemas";
import Footer from "@/components/Footer.vue";

export default defineComponent({
  name: 'MainDashboard',

  components: {
    Footer,
    PlayPauseButton,
    DashboardCard,
    CryptoTransactionTable,
    MessageTransactionTable,
    ContractCallTransactionTable,
    HbarMarketDashboard,
  },

  props: {
    network: String
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)
    const displaySideBySide = inject('isLargeScreen', true)

    const CryptoTransactionCacheState = ref<PlayPauseState>(PlayPauseState.Play)
    const MessageTransactionCacheState = ref<PlayPauseState>(PlayPauseState.Play)
    const ContractCallTransactionCacheState = ref<PlayPauseState>(PlayPauseState.Play)

    watch(() => props.network, () => {
      // We don't want to wait for table periodic refresh => we trigger a full reload
      window.location.reload();
    })

    return {
      isSmallScreen,
      isTouchDevice,
      displaySideBySide,
      CryptoTransactionCacheState,
      MessageTransactionCacheState,
      ContractCallTransactionCacheState,
      TransactionType}
  }

});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>