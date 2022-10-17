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

  <DashboardCard v-if="stateChanges?.length" class="h-card">
    <template v-slot:title>
      <span class="h-is-secondary-title">Contract States Accessed & Changed</span>
    </template>

    <template v-slot:content>

      <o-table
          :data="displayStateChanges"
          :paginated="false"

          :hoverable="false"
          :narrowed="true"
          :striped="false"
          :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"

          aria-current-label="Current page"
          aria-next-label="Next page"
          aria-page-label="Page"
          aria-previous-label="Previous page"
      >

        <o-table-column v-slot="props" field="contract" label="Contract">
          <EVMAddress :id="props.row.changes.contract_id" :address="props.row.changes.address" :compact="false"/>
        </o-table-column>

        <o-table-column v-slot="props" field="slot" label="Address">
          <HexaValue :byte-string="props.row.changes.slot"/>
        </o-table-column>

        <o-table-column v-slot="props" field="value_read" label="Value Read">
          <HexaValue :byte-string="props.row.changes.value_read" :show-none="true"/>
        </o-table-column>

        <o-table-column v-slot="props" field="value_written" label="Value Written">
          <HexaValue :byte-string="props.row.changes.value_written" :show-none="true"/>
        </o-table-column>

      </o-table>

    </template>

  </DashboardCard>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, onMounted, PropType, ref, Ref, watch} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";
import {ContractResultStateChange} from "@/schemas/HederaSchemas";
import EVMAddress from "@/components/values/EVMAddress.vue";
import {ORUGA_MOBILE_BREAKPOINT} from '@/App.vue';
import HexaValue from "@/components/values/HexaValue.vue";


export interface DisplayStateChange {
  changes: ContractResultStateChange,
  addressType: string,
  valueReadType: string,
  valueWrittenType: string,
  valueChange: number | null
}

export default defineComponent({

  name: 'ContractResultStates',

  components: {
    HexaValue,
    EVMAddress,
    DashboardCard
  },

  props: {
    stateChanges: Object as PropType<Array<ContractResultStateChange> | undefined>,
    timeStamp: String
  },

  setup(props) {
    const isLargeScreen = inject('isLargeScreen', true)

    // const transactionLoader = new TransactionByTimestampLoader(
    //     computed(() => props.timeStamp ?? null)
    // )
    // onMounted(() => transactionLoader.requestLoad())

    const displayStateChanges: Ref<Array<DisplayStateChange>> = ref([])
    onMounted(() => displayStateChanges.value = makeDisplayStateChanges())
    watch(() => props.stateChanges, () => makeDisplayStateChanges())

    const makeDisplayStateChanges = () => {
      const result: Array<DisplayStateChange> = []
      let previousContract: string|null = null

      if (props.stateChanges) {
        for (const s of props.stateChanges) {
          result.push({
            changes: s,
            addressType: 'DECIMAL',
            valueReadType: 'DECIMAL',
            valueWrittenType: 'DECIMAL',
            valueChange: null
          })
          if (previousContract && previousContract === s.contract_id) {
            result[result.length - 1].changes.contract_id = null
          }
          previousContract = s.contract_id ?? null
        }
      }
      return result
    }

    return {
      isLargeScreen,
      displayStateChanges,
      ORUGA_MOBILE_BREAKPOINT
    }
  },
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>
</style>