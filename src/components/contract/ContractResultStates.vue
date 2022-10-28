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

      <div class="columns" style="margin-bottom:0; font-size: 11px; font-weight: 700;">
        <div class="column is-2">Contract</div>
        <div class="column">Address</div>
        <div class="column">Value Read</div>
        <div class="column">Value Written</div>
      </div>
      <hr class="h-card-separator" style="margin-top: 0; margin-bottom: 20px; height: 1px"/>

      <template v-for="s in displayStateChanges" :key="s.index">
        <ContractResultStateChangeEntry :change="s"/>
        <hr class="h-card-separator" style="margin-top: 0; margin-bottom: 12px; height: 0.5px"/>
      </template>

    </template>

  </DashboardCard>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onMounted, PropType, ref, Ref, watch} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";
import {ContractResultStateChange} from "@/schemas/HederaSchemas";
import {ORUGA_MOBILE_BREAKPOINT} from '@/App.vue';
import {TransactionByTimestampLoader} from "@/components/transaction/TransactionByTimestampLoader";
import ContractResultStateChangeEntry from "@/components/contract/ContractResultStateChangeEntry.vue";

export interface DisplayStateChange {
  changes: ContractResultStateChange,
  header: boolean,
  balanceChange: number | null,
  slotType: string,
  slotDecimal: number | null
  valueReadType: string,
  valueReadDecimal: number | null
  valueReadString: string | null
  valueWrittenType: string,
  valueWrittenDecimal: number | null
  valueWrittenString: string | null
  valueChange: number | null,
  index: number
}

const NB_STATES_PER_PAGE = 3

export default defineComponent({

  name: 'ContractResultStates',

  components: {
    ContractResultStateChangeEntry,
    DashboardCard
  },

  props: {
    stateChanges: Object as PropType<Array<ContractResultStateChange> | undefined>,
    timeStamp: String
  },

  setup(props) {
    const isMediumScreen = inject('isMediumScreen', true)
    const isLargeScreen = inject('isLargeScreen', true)
    const isPaginated = computed(() => (props.stateChanges?.length??0) > NB_STATES_PER_PAGE)

    const transactionLoader = new TransactionByTimestampLoader(
        computed(() => props.timeStamp ?? null)
    )
    onMounted(() => transactionLoader.requestLoad())

    const displayStateChanges: Ref<Array<DisplayStateChange>> = ref([])
    onMounted(() => displayStateChanges.value = makeDisplayStateChanges())
    watch([() => props.stateChanges, transactionLoader.entity],
        () => displayStateChanges.value = makeDisplayStateChanges())

    const makeDisplayStateChanges = () => {
      const result: Array<DisplayStateChange> = []

      if (props.stateChanges) {
        for (const s of props.stateChanges) {

          let newItem: DisplayStateChange = {
            changes: {...s},
            header: true,
            balanceChange: null,
            slotType: 'DECIMAL',
            slotDecimal: makeDecimal(s.slot??""),
            valueReadType: 'DECIMAL',
            valueReadDecimal: makeDecimal(s.value_read??""),
            valueReadString: null,
            valueWrittenType: 'DECIMAL',
            valueWrittenDecimal: makeDecimal(s.value_written??""),
            valueWrittenString: null,
            valueChange: null,
            index: result.length
          }

          if (newItem.changes.value_read === '0x') {
            newItem.changes.value_read = '0x0000000000000000000000000000000000000000000000000000000000000000'
            newItem.valueReadDecimal = 0
          }
          if (newItem.changes.value_written === '0x') {
            newItem.changes.value_written = null
            newItem.valueWrittenDecimal = null
          }
          if (newItem.changes.slot === '0x') {
            newItem.changes.slot = '0x0000000000000000000000000000000000000000000000000000000000000000'
            newItem.slotDecimal = 0
          }
          if (result.length > 0 && s.address === (result[result.length - 1].changes.address)) {
            newItem.header = false
          } else {
            newItem.balanceChange = transactionLoader.lookupTransfer(s.contract_id ?? "")
          }
          newItem.valueChange = newItem.valueReadDecimal && newItem.valueWrittenDecimal
              ? newItem.valueWrittenDecimal - newItem.valueReadDecimal
              : null

          result.push(newItem)
        }
      }
      return result
    }

    const makeDecimal = (hexa: string): number|null => {
      hexa = hexa.replace(/^0x0+/, '');
      return (hexa.length <= 8) ? Number("0x"+ hexa) : null
    }

    return {
      isMediumScreen,
      isLargeScreen,
      isPaginated,
      displayStateChanges,
      NB_STATES_PER_PAGE,
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