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

  <PageFrameV2 page-title="Block Details">

    <DashboardCard collapsible-key="blockDetails">
      <template v-slot:title>
        <span class="h-is-primary-title">Block {{ block?.number?.toString() ?? "" }}</span>
      </template>

      <template v-slot:control>
        <div class="is-flex is-justify-content-flex-end is-align-items-center">
          <button
              id="prev-block-button"
              :disabled="disablePreviousButton"
              class="button is-white is-small"
              @click="handlePreviousBlock"
          >
            &lt; {{ isSmallScreen ? 'PREV. BLOCK' : 'PREV.'}}
          </button>
          <button
              id="next-block-button"
              :disabled="disableNextButton"
              class="button is-white is-small ml-4"
              @click="handleNextBlock"
          >
            {{ isSmallScreen ? 'NEXT BLOCK' : 'NEXT'}} &gt;
          </button>
        </div>
      </template>

      <template v-slot:content>

        <NotificationBanner v-if="notification" :message="notification"/>

        <div class="columns h-is-property-text">
          <div class="column">
            <Property id="count">
              <template v-slot:name>No. Transactions</template>
              <template v-slot:value>
                <PlainAmount :amount="block?.count"/>
              </template>
            </Property>
            <Property id="blockHash">
              <template v-slot:name>Hash</template>
              <template v-slot:value>
                <KeyValue :key-bytes="block?.hash" :show-none="true" key-type="SHA384"/>
              </template>
            </Property>
            <Property id="fromTimestamp">
              <template v-slot:name>From Timestamp</template>
              <template v-slot:value>
                <TimestampValue :show-none="true" :timestamp="block?.timestamp?.from"/>
              </template>
            </Property>
            <Property id="toTimestamp">
              <template v-slot:name>To Timestamp</template>
              <template v-slot:value>
                <TimestampValue :show-none="true" :timestamp="block?.timestamp?.to ?? undefined"/>
              </template>
            </Property>
            <Property id="gasUsed">
              <template v-slot:name>Gas Used</template>
              <template v-slot:value>
                <PlainAmount :amount="block?.gas_used"/>
              </template>
            </Property>
            <Property id="recordFileName">
              <template v-slot:name>Record File Name</template>
              <template v-slot:value>
                <StringValue :string-value="block?.name"/>
              </template>
            </Property>
          </div>
        </div>
      </template>
    </DashboardCard>

    <DashboardCard id="blockTransactions" collapsible-key="blockTransactions">
      <template v-slot:title>
        <span class="h-is-secondary-title">Block Transactions</span>
      </template>
      <template v-slot:content>
        <BlockTransactionTable :transactions="transactions"/>
      </template>
    </DashboardCard>

    <MirrorLink :network="network" entityUrl="blocks" :loc="blockHon"/>
  </PageFrameV2>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import {BlockLocParser} from "@/utils/parser/BlockLocParser";
import DashboardCard from "@/components/DashboardCard.vue";
import NotificationBanner from "@/components/NotificationBanner.vue";
import Property from "@/components/Property.vue";
import TimestampValue from "@/components/values/TimestampValue.vue";
import StringValue from "@/components/values/StringValue.vue";
import KeyValue from "@/components/values/KeyValue.vue";
import PageFrameV2 from "@/components/page/PageFrameV2.vue";
import PlainAmount from "@/components/values/PlainAmount.vue";
import BlockTransactionTable from "@/components/block/BlockTransactionTable.vue";
import {TransactionGroupByBlockCache} from "@/utils/cache/TransactionGroupByBlockCache";
import {routeManager} from "@/router";
import MirrorLink from "@/components/MirrorLink.vue";

export default defineComponent({

  name: 'BlockDetails',

  components: {
    MirrorLink,
    BlockTransactionTable,
    PlainAmount,
    DashboardCard,
    NotificationBanner,
    Property,
    PageFrameV2,
    StringValue,
    TimestampValue,
    KeyValue,
  },

  props: {
    blockHon: String,
    network: String
  },

  setup(props) {
    const nullHash = "0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
    const isSmallScreen = inject('isSmallScreen', true)

    //
    // block
    //
    const blockLocParser = new BlockLocParser(computed(() => props.blockHon ?? null))
    onMounted(() => blockLocParser.mount())
    onBeforeUnmount(() => blockLocParser.unmount())

    //
    // transactions
    //
    const transactionsLookup = TransactionGroupByBlockCache.instance.makeLookup(blockLocParser.blockNumber)
    onMounted(() => transactionsLookup.mount())
    onBeforeUnmount(() => transactionsLookup.unmount())
    const transactions = computed(() => transactionsLookup.entity.value ?? [])

    const disablePreviousButton = ref(true)
    const disableNextButton = ref(true)
    watch(blockLocParser.block, () => {
      disablePreviousButton.value = (blockLocParser.errorNotification.value != null) || (blockLocParser.block.value?.previous_hash === nullHash)
      disableNextButton.value = blockLocParser.errorNotification.value != null
    })
    const handlePreviousBlock = () => {
      const currentBlockNumber = blockLocParser.blockNumber.value ?? 0
      routeManager.routeToBlock(currentBlockNumber - 1)
    }
    const handleNextBlock = () => {
      const currentBlockNumber = blockLocParser.blockNumber.value ?? 0
      routeManager.routeToBlock(currentBlockNumber + 1)
    }

    return {
      isSmallScreen,
      block: blockLocParser.block,
      transactions,
      notification: blockLocParser.errorNotification,
      disablePreviousButton,
      disableNextButton,
      handlePreviousBlock,
      handleNextBlock,
    }
  }
});

</script>

<style/>
