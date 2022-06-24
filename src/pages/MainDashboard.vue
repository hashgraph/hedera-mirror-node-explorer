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
            <PlayPauseButtonV2 v-model:state="cryptoTransactionCacheState"/>
          </template>
          <template v-slot:table>
            <CryptoTransactionTable
                v-bind:transactions="cryptoTransactions"
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
            <PlayPauseButtonV2 v-model:state="contractCallTransactionCacheState"/>
          </template>
          <template v-slot:table>
            <ContractCallTransactionTable
                v-bind:transactions="contractCallTransactions"
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
            <PlayPauseButtonV2 v-model:state="messageTransactionCacheState"/>
          </template>
          <template v-slot:table>
            <MessageTransactionTable
                v-bind:transactions="messageTransactions"
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

import {defineComponent, inject, onBeforeUnmount, onMounted, watch} from 'vue';

import HbarMarketDashboard from "../components/dashboard/HbarMarketDashboard.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import PlayPauseButtonV2 from "@/components/PlayPauseButtonV2.vue";
import CryptoTransactionTable from "@/components/dashboard/CryptoTransactionTable.vue";
import MessageTransactionTable from "@/components/dashboard/MessageTransactionTable.vue";
import ContractCallTransactionTable from "@/components/dashboard/ContractCallTransactionTable.vue";
import {TransactionType} from "@/schemas/HederaSchemas";
import Footer from "@/components/Footer.vue";
import {TransactionCacheV2} from "@/components/transaction/TransactionCacheV2";
import {EntityCacheStateV2} from "@/utils/EntityCacheV2";

export default defineComponent({
  name: 'MainDashboard',

  components: {
    Footer,
    PlayPauseButtonV2,
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

    const cryptoTransactionCache = new TransactionCacheV2()
    cryptoTransactionCache.transactionType.value = TransactionType.CRYPTOTRANSFER

    const messageTransactionCache = new TransactionCacheV2()
    messageTransactionCache.transactionType.value = TransactionType.CONSENSUSSUBMITMESSAGE

    const contractCallTransactionCache = new TransactionCacheV2()
    contractCallTransactionCache.transactionType.value = TransactionType.CONTRACTCALL

    onMounted(() => {
      cryptoTransactionCache.state.value = EntityCacheStateV2.Started
      messageTransactionCache.state.value = EntityCacheStateV2.Started
      contractCallTransactionCache.state.value = EntityCacheStateV2.Started
    })

    onBeforeUnmount(() => {
      cryptoTransactionCache.state.value = EntityCacheStateV2.Stopped
      messageTransactionCache.state.value = EntityCacheStateV2.Stopped
      contractCallTransactionCache.state.value = EntityCacheStateV2.Stopped
    })

    watch(() => props.network, () => {
      cryptoTransactionCache.clear()
      messageTransactionCache.clear()
      contractCallTransactionCache.clear()
      cryptoTransactionCache.state.value = EntityCacheStateV2.Started
      messageTransactionCache.state.value = EntityCacheStateV2.Started
      contractCallTransactionCache.state.value = EntityCacheStateV2.Started
    })

    return {
      isSmallScreen,
      isTouchDevice,
      displaySideBySide,
      cryptoTransactions: cryptoTransactionCache.transactions,
      cryptoTransactionCacheState: cryptoTransactionCache.state,
      messageTransactions: messageTransactionCache.transactions,
      messageTransactionCacheState: messageTransactionCache.state,
      contractCallTransactions: contractCallTransactionCache.transactions,
      contractCallTransactionCacheState: contractCallTransactionCache.state,
      TransactionType}
  }

});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>