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

  <PageFrameV2 page-title="Mirror Explorer Routes">

    <DashboardCard class="h-card">
      <template v-slot:title>
        <span class="h-is-primary-title">Mirror Explorer Routes</span>
      </template>
      <template v-slot:content>
        <o-collapse
            v-for="(route, index) of routes"
            :key="index"
            class="card"
            animation="slide"
            :open="isOpen.includes(index)"
            @open="isOpen.push(index)">
          <template #trigger="props">
            <Property class="trigger" aria-controls="contentIdForA11y1" id="dashboard" wide-name>
              <template v-slot:name>
                <span class="has-text-weight-bold">{{ route.title }}</span>
              </template>
              <template v-slot:value>
                <StringValue class="value" :string-value="route.subtitle"/>
                <o-icon :icon="props.open ? 'caret-up' : 'caret-down'"/>
              </template>
            </Property>
          </template>
          <div class="content">
            <div>{{ route.description }}</div>
            <div v-if="route.data" style="margin-top: 17px; margin-bottom: 8px">Data Displayed:</div>
            <div style="margin-left: 17px" v-for="d of route.data" :key="d">{{ d }}</div>
          </div>
        </o-collapse>
      </template>
    </DashboardCard>

  </PageFrameV2>

</template>

<script lang="ts">

import {defineComponent, ref} from "vue";
import DashboardCard from "@/components/DashboardCard.vue";
import Property from "@/components/Property.vue";
import StringValue from "@/components/values/StringValue.vue";
import {CoreConfig} from "@/config/CoreConfig.ts";
import PageFrameV2 from "@/components/page/PageFrameV2.vue";

export default defineComponent({
  name: 'RoutingSpec',
  components: {PageFrameV2, StringValue, Property, DashboardCard},
  props: {},

  setup() {
    const cryptoName = CoreConfig.inject().cryptoName

    const isOpen = ref<number[]>([])

    const routes = ref([
      {
        title: "/{network}/dashboard",
        subtitle: "Dashboard",
        description: `Displays general information about ${cryptoName} and tables showing recent transfers, contract calls, and HCS messages.`,
        data: [
          cryptoName + " Price",
          cryptoName + " Market Cap",
          cryptoName + " Released",
          cryptoName + " Total",
          "Recent Cypto Transfers",
          "Recent Smart Contract Calls",
          "Recent HCS Messages",
        ]
      },
      {
        title: "/{network}/transaction/{transactionTimestampOrHash}",
        subtitle: "Transaction details",
        description: "Displays details of transaction with the given timestamp.",
        data: [
          "Type",
          "Consensus at",
          "Transaction Hash",
          "Block",
          "Node Submitted To",
          "Memo",
          "Topic ID",
          "Payer Account",
          "Charged Fee",
          "Max Fee",
          "Valid Duration",
          "Transaction Nonce",
          "Scheduled",
          cryptoName + " Transfers",
          "Additional data is displayed based on transaction type"
        ]
      },
      {
        title: "/{network}/account/{accountId}",
        subtitle: "Account Details",
        description: "Displays details of transaction with the given account ID.",
        data: [
          "Account ID",
          "EVM Address",
          "Balances",
          "Staked To",
          "Pending Rewards",
          "Memo",
          "Create Transaction",
          "Expires at",
          "Auto Renew Period",
          "Max. Auto. Association",
          "Receiver Sig. Required",
          "Admin Key",
          "Ethereum Nonce",
          "Recent Transactions",
          "Allowances",
          "Recent Staking Rewards"
        ]
      },
      {
        title: "/{network}/address/{accountAddress}",
        subtitle: "Account Details by Address",
        description: "Displays details of transaction with the given account address.",
        data: [
          "Account ID",
          "EVM Address",
          "Balances",
          "Staked To",
          "Pending Rewards",
          "Memo",
          "Create Transaction",
          "Expires at",
          "Auto Renew Period",
          "Max. Auto. Association",
          "Receiver Sig. Required",
          "Admin Key",
          "Ethereum Nonce",
          "Recent Transactions",
          "Allowances",
          "Recent Staking Rewards"
        ]
      },
      {
        title: "/{network}/token/{tokenId}",
        subtitle: "Token Details",
        description: "Displays details of token with the given token ID.",
        data: [
          "Token ID",
          "EVM Address",
          "Name",
          "Symbol",
          "Memo",
          "Expires at",
          "Auto Renew Period",
          "Auto Renew Account",
          "Freeze Default",
          "Pause Status",
          "Treasury Account",
          "Created at",
          "Modified at",
          "Total Supply",
          "Initial Supply",
          "Max Supply",
          "Decimals",
          "Admin Key",
          "KYC Key",
          "Freeze Key",
          "Wipe Key",
          "Supply Key",
          "Fee Schedule Key",
          "Pause Key",
          "Balances or NFT Holders table depending on token type",
        ]
      },
      {
        title: "/{network}/contract/{contractId}",
        subtitle: "Contract Details",
        description: "Displays details of NFT with the given contract ID.",
        data: [
          "Contract ID",
          "EVM Address",
          "Balances",
          "Admin Key",
          "Memo",
          "Create Transaction",
          "Expires at",
          "Auto Renew Period",
          "Auto Renew Account",
          "Max. Auto. Association",
          "Obtainer",
          "Proxy Account",
          "Valid From",
          "Valid until",
          "Contract Nonce",
          "File",
          "Verification Status",
          "Contract Name",
          "Compiler Version",
          "IPFS Hash",
          "Runtime Bytecode",
          "Recent Contract Calls"
        ]
      },
      {
        title: "/{network}/block/{blockNumberOrHash}",
        subtitle: "Block Details",
        description: "Displays details of block with the given block number.",
        data: [
          "No. Transactions",
          "Hash",
          "From Timestamp",
          "To Timestamp",
          "Gas Used",
          "Record File Name",
          "Block Transactions",
        ]
      },
    ])


    return {
      isOpen,
      routes
    }
  }
})

</script>

<style scoped>

.trigger {
  padding: 5px;
  border: solid 1px;
  margin: 0 !important;
  margin-top: 20px !important;
}

.value {
  margin-right: 5px;
}

.content {
  padding: 17px;
  margin-top: -1px;
  margin-bottom: 20px;
  border: solid 1px;
  background-color: #202020;
}

.version {
  background-color: transparent;
}
</style>
