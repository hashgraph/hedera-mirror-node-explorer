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

      <div v-for="s in displayStateChanges" :key="s.changes.contract_id">
        <div class="is-flex is-align-items-baseline">
          <ContractLink :contract-id="s.changes.contract_id"></ContractLink>
          <EVMAddress :address="s.changes.address" :compact="false" class="ml-3"/>
          <span class="mb-2 h-is-text-size-3">
            <span class="ml-4 mr-2">Contract HBar Balance Difference:</span>
            <HbarAmount :amount="s.balanceChange" :colored="true" :show-extra="true"/>
          </span>
        </div>
        <hr class="h-card-separator" style="margin-bottom: 12px; margin-top: 0"/>

        <div class="columns" style="margin-bottom:0">

          <div class="column is-2 py-1"></div>

          <div class="column py-1">
            <HexaValue :byte-string="s.changes.slot"/>
            <div class="h-is-extra-text h-is-text-size-2">
              {{ 'Decimal: ' + Number(s.changes.slot) }}
            </div>
          </div>

          <div class="column py-1">
            <HexaValue :byte-string="s.changes.value_read" :show-none="true"/>
            <div :class="{'is-invisible': isNaN(Number(s.changes.value_read))}"
                 class="h-is-extra-text h-is-text-size-2">
              {{ 'Decimal: ' + Number(s.changes.value_read) }}
            </div>
          </div>

          <div class="column py-1">
            <HexaValue :byte-string="s.changes.value_written" :show-none="true"/>
            <div :class="{'is-invisible': isNaN(Number(s.changes.value_written))}"
                 class="h-is-extra-text h-is-text-size-2">
              <span>{{ 'Decimal: ' + Number(s.changes.value_written) }}</span>
              <span v-if="s.valueChange" class="ml-2">{{ '(Difference: ' + s.valueChange + ')' }}</span>
            </div>
          </div>

        </div>
        <hr class="h-card-separator" style="margin-top: 0; margin-bottom: 8px; height: 0.5px"/>
      </div>

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
import EVMAddress from "@/components/values/EVMAddress.vue";
import {ORUGA_MOBILE_BREAKPOINT} from '@/App.vue';
import HexaValue from "@/components/values/HexaValue.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";
import {TransactionByTimestampLoader} from "@/components/transaction/TransactionByTimestampLoader";
import ContractLink from "@/components/values/ContractLink.vue";


export interface DisplayStateChange {
  changes: ContractResultStateChange,
  balanceChange: number | null,
  addressType: string,
  valueReadType: string,
  valueWrittenType: string,
  valueChange: number | null
}

const NB_STATES_PER_PAGE = 10

export default defineComponent({

  name: 'ContractResultStates',

  components: {
    ContractLink,
    HbarAmount,
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
      let previousContract: string|null = null

      if (props.stateChanges) {
        for (const s of props.stateChanges) {
          const valueRead = Number(s.value_read)
          const valueWritten = Number(s.value_written)
          result.push({
            changes: s,
            balanceChange: null,
            addressType: 'DECIMAL',
            valueReadType: 'DECIMAL',
            valueWrittenType: 'DECIMAL',
            valueChange: !isNaN(valueRead) && !isNaN(valueWritten) ? valueWritten - valueRead : null
          })
          if (previousContract && previousContract === s.contract_id) {
            result[result.length - 1].changes.contract_id = null
          } else {
            result[result.length - 1].balanceChange = transactionLoader.lookupTransfer(s.contract_id ?? "")
          }
          previousContract = s.contract_id ?? null
        }
      }
      return result
    }

    return {
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