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

  <DashboardCard v-if="stateChanges?.length && isSmallScreen" class="h-card" collapsible-key="stateChanges">
    <template v-slot:title>
      <span class="h-is-secondary-title">Contract States Accessed & Changed</span>
    </template>

    <template v-slot:control v-if="displayStateChanges.length > 5">
      <SelectView v-model="pageSize" :small="true">
        <option v-for="n of actualSizeOptions" :key="n" :value="n">
          {{ (n >= displayStateChanges?.length) ? 'Show all items' : 'Show ' + n + ' items' }}
        </option>
      </SelectView>
    </template>

    <template v-slot:content>

      <div class="columns" style="margin-bottom:0; font-size: 11px; font-weight: 700;">
        <div class="column is-1">Contract</div>
        <div class="column">Address</div>
        <div class="column">Value Read</div>
        <div class="column">Value Written</div>
      </div>
      <hr class="h-card-separator" style="margin-top: 0; margin-bottom: 20px; height: 1px"/>

      <div v-for="s in nbChangeDisplayed" :key="s">
        <ContractResultStateChangeEntry :change="displayStateChanges[changeCursor + s - 1]" :timestamp="timeStamp"/>
        <hr class="h-card-separator" style="margin-top: 0; margin-bottom: 12px; height: 0.5px"/>
      </div>

      <div v-if="isPaginated" class="is-flex is-justify-content-flex-end">
        <o-pagination
            :total="stateChanges.length"
            v-model:current="currentPage"
            :range-before="1"
            :range-after="1"
            :per-page="pageSize"
            aria-next-label="Next page"
            aria-previous-label="Previous page"
            aria-page-label="Page"
            aria-current-label="Current page"
        >
        </o-pagination>
      </div>

    </template>

  </DashboardCard>

  <DashboardCard v-else-if="stateChanges?.length" class="h-card" collapsible-key="stateChanges">
    <template v-slot:title>
      <div class="h-is-secondary-title">Contract States Accessed & Changed</div>
    </template>

    <template v-slot:content>
      <div class="h-is-tertiary-text-text has-text-grey">
        <span>Not available on this screen size</span>
      </div>
    </template>
  </DashboardCard>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted, PropType, ref, Ref, watch} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";
import {ContractResultStateChange} from "@/schemas/MirrorNodeSchemas";
import {ORUGA_MOBILE_BREAKPOINT} from "@/BreakPoints";
import {TransactionByTsCache} from "@/utils/cache/TransactionByTsCache";
import ContractResultStateChangeEntry from "@/components/contract/ContractResultStateChangeEntry.vue";
import {AppStorage} from "@/AppStorage";
import SelectView from "@/components/SelectView.vue";

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

const DEFAULT_PAGE_SIZE = 10

export default defineComponent({

  name: 'ContractResultStates',

  components: {
    SelectView,
    ContractResultStateChangeEntry,
    DashboardCard
  },

  props: {
    stateChanges: Object as PropType<Array<ContractResultStateChange> | undefined>,
    timeStamp: String
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const sizeOptions: Array<number> = [5, 10, 15, 20, 30, 50, 100]
    const actualSizeOptions: Ref<Array<number>> = ref([])

    const currentPage = ref(1)
    const pageSize = ref(AppStorage.getStatesTablePageSize() ?? DEFAULT_PAGE_SIZE)
    watch(pageSize, () => {
      AppStorage.setStatesTablePageSize(pageSize.value)
      currentPage.value = 1
    })

    onMounted(() => updatePageSize())
    watch(() => props.stateChanges, () => updatePageSize())
    const updatePageSize = () => {
      let options: Array<number> = sizeOptions
      for (let i = 0; i < options.length - 1; i++) {
        if (options[i] > (props.stateChanges?.length ?? 0)) {
          options = options.slice(0, i + 1)
          pageSize.value = Math.min(pageSize.value, options[i])
          break
        }
      }
      actualSizeOptions.value = options
    }

    const isPaginated = computed(
        () => displayStateChanges?.value.length && displayStateChanges?.value.length > pageSize.value)
    const changeCursor = computed(() => (currentPage.value - 1) * pageSize.value)
    watch(changeCursor, () => displayStateChanges.value[changeCursor.value].header = true)
    const nbChangeDisplayed = computed(() => {
      return displayStateChanges?.value.length
          ? Math.min(pageSize.value, displayStateChanges?.value.length - changeCursor.value)
          : 0
    })

    const transactionLookup = TransactionByTsCache.instance.makeLookup(computed(() => props.timeStamp ?? null))
    onMounted(() => transactionLookup.mount())
    onBeforeUnmount(() => transactionLookup.unmount())

    const displayStateChanges: Ref<Array<DisplayStateChange>> = ref([])
    onMounted(() => displayStateChanges.value = makeDisplayStateChanges())
    watch([() => props.stateChanges, transactionLookup.entity],
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
            slotDecimal: makeDecimal(s.slot ?? ""),
            valueReadType: 'DECIMAL',
            valueReadDecimal: makeDecimal(s.value_read ?? ""),
            valueReadString: null,
            valueWrittenType: 'DECIMAL',
            valueWrittenDecimal: makeDecimal(s.value_written ?? ""),
            valueWrittenString: null,
            valueChange: null,
            index: result.length
          }

          if (newItem.changes.value_written === '0x') {
            newItem.changes.value_written = null
            newItem.valueWrittenDecimal = null
          }

          if (result.length > 0 && s.address === (result[result.length - 1].changes.address)) {
            newItem.header = false
          } else {
            newItem.balanceChange = lookupTransfer(s.contract_id ?? "")
          }

          newItem.valueChange = newItem.valueReadDecimal && newItem.valueWrittenDecimal
              ? newItem.valueWrittenDecimal - newItem.valueReadDecimal
              : null

          result.push(newItem)
        }
      }
      return result
    }

    const lookupTransfer = (contractId: string) => {
      let result = null
      const transaction = transactionLookup.entity.value
      if (transaction !== null) {
        for (const t of transaction.transfers ?? []) {
          if (t.account === contractId) {
            result = t.amount
            break
          }
        }
      }
      return result
    }

    const makeDecimal = (hexa: string): number | null => {
      let result
      if (hexa) {
        hexa = hexa.replace(/^0x0+/, '');
        result = (hexa.length === 0) ? 0 : (hexa.length <= 13) ? Number("0x" + hexa) : null
      } else {
        result = null
      }
      return result
    }

    return {
      isSmallScreen,
      displayStateChanges,
      actualSizeOptions,
      currentPage,
      isPaginated,
      changeCursor,
      pageSize,
      nbChangeDisplayed,
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
