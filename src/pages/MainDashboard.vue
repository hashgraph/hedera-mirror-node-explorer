<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2024 Hedera Hashgraph, LLC
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

  <PageFrameV2 page-title="Dashboard">

    <div class="columns">

      <div class="column">
        <DashboardCard data-cy="cryptoTransfers">
          <template v-slot:title>
            <span class="h-is-secondary-title">Crypto Transfers</span>
          </template>
          <template v-slot:control>
            <PlayPauseButton v-bind:controller="cryptoTableController"/>
          </template>
          <template v-slot:content>
            <CryptoTransactionTable v-bind:controller="cryptoTableController"/>
          </template>
        </DashboardCard>
      </div>

    </div>

    <div class="columns is-multiline">

      <div class="column" :class="{'is-full':!isXLargeScreen}">
        <DashboardCard data-cy="smartContractCalls">
          <template v-slot:title>
            <span class="h-is-secondary-title">Smart Contract Calls</span>
          </template>
          <template v-slot:control>
            <PlayPauseButton v-bind:controller="contractTableController"/>
          </template>
          <template v-slot:content>
            <ContractCallTransactionTable v-bind:controller="contractTableController"/>
          </template>
        </DashboardCard>
      </div>

      <div class="column">
        <DashboardCard data-cy="hcsMessages">
          <template v-slot:title>
            <span class="h-is-secondary-title">HCS Messages</span>
          </template>
          <template v-slot:control>
            <PlayPauseButton v-bind:controller="messageTableController"/>
          </template>
          <template v-slot:content>
            <MessageTransactionTable v-bind:controller="messageTableController"/>
          </template>
        </DashboardCard>
      </div>

    </div>

  </PageFrameV2>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, onBeforeUnmount, onMounted, ref, watch} from 'vue';

import HbarMarketDashboard from "../components/dashboard/HbarMarketDashboard.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import PlayPauseButton from "@/components/PlayPauseButton.vue";
import CryptoTransactionTable from "@/components/dashboard/CryptoTransactionTable.vue";
import MessageTransactionTable from "@/components/dashboard/MessageTransactionTable.vue";
import ContractCallTransactionTable from "@/components/dashboard/ContractCallTransactionTable.vue";
import {TransactionType} from "@/schemas/MirrorNodeSchemas";
import PageFrameV2 from "@/components/page/PageFrameV2.vue";
import {TransactionTableController} from "@/components/transaction/TransactionTableController";
import {useRouter} from "vue-router";

export default defineComponent({
  name: 'MainDashboard',

  components: {
    PageFrameV2,
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
    const isXLargeScreen = inject('isXLargeScreen', true)

    const router = useRouter()
    const topPageSize = ref(5)
    const bottomPageSize = ref(5)

    const cryptoTableController = new TransactionTableController(
        router, topPageSize, TransactionType.CRYPTOTRANSFER, "", null, "p1", "k1")

    const messageTableController = new TransactionTableController(
        router, bottomPageSize, TransactionType.CONSENSUSSUBMITMESSAGE, "", null, "p2", "k2")

    const contractTableController = new TransactionTableController(
        router, bottomPageSize, TransactionType.CONTRACTCALL, "", null, "p3", "k3")

    onMounted(() => {
      cryptoTableController.mount()
      messageTableController.mount()
      contractTableController.mount()
    })

    onBeforeUnmount(() => {
      cryptoTableController.unmount()
      messageTableController.unmount()
      contractTableController.unmount()
    })

    watch(() => props.network, () => {
      cryptoTableController.reset()
      messageTableController.reset()
      contractTableController.reset()
      cryptoTableController.startAutoRefresh()
      messageTableController.startAutoRefresh()
      contractTableController.startAutoRefresh()
    })

    return {
      isXLargeScreen,
      cryptoTableController,
      messageTableController,
      contractTableController,
      TransactionType
    }
  }

});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
