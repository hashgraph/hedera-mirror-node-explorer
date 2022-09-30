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

  <o-field>
    <o-select v-model="selectedFilter" class="ml-2 h-is-text-size-1">
      <option v-for="f in filterValues" v-bind:key="f" v-bind:value="f">
        {{ makeFilterLabel(f) }}
      </option>
    </o-select>
  </o-field>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, PropType, ref, watch} from "vue";
import {TransactionType} from "@/schemas/HederaSchemas";
import {makeTypeLabel} from "@/utils/TransactionTools";
import {TransactionTableController} from "@/components/transaction/TransactionTableController";

export default defineComponent({
  name: "TransactionFilterSelect",

  props: {
    controller: {
      type: Object as PropType<TransactionTableController>,
      required: true
    }
  },

  setup(props) {

    const makeFilterLabel = (filterValue: string): string => {
      return filterValue == "" ? "TYPES: ALL" : makeTypeLabel(filterValue as TransactionType)
    }

    const selectedFilter = ref(props.controller.transactionTypeParam.value)
    watch(selectedFilter, () => {
      props.controller.changeTransactionType(selectedFilter.value)
    })

    return {
      filterValues: makeFilterValues(),
      selectedFilter,
      makeFilterLabel,
    }
  }
});

export function makeFilterValues(): string[] {
  const result = Object
    .keys(TransactionType)
    .sort((a, b) => {
      return makeTypeLabel(a as TransactionType) < makeTypeLabel(b as TransactionType) ? -1 : 1;
    })
  result.splice(0, 0, "")
  return result
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
