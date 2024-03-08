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

  <o-field>
    <o-select v-model="selectedFilter" class="h-is-text-size-1"  data-cy="select-type">
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

import {defineComponent, PropType} from "vue";
import {TransactionType} from "@/schemas/HederaSchemas";
import {makeTypeLabel} from "@/utils/TransactionTools";
import {TransactionTableControllerXL} from "@/components/transaction/TransactionTableControllerXL";
import {NftTransactionTableController} from "./NftTransactionTableController";

export default defineComponent({
  name: "TransactionFilterSelect",

  props: {
    controller: {
      type: Object as PropType<
        TransactionTableControllerXL | NftTransactionTableController
      >,
      required: true,
    },
    nftFilter: {
      type: Boolean,
      required: false,
    },
  },

  setup(props) {

    const makeFilterLabel = (filterValue: string): string => {
      return filterValue == "" ? "TYPES: ALL" : makeTypeLabel(filterValue as TransactionType)
    }

    return {
      filterValues: makeFilterValues(props.nftFilter),
      selectedFilter: props.controller.transactionType,
      makeFilterLabel,
    }
  }
});

export function makeFilterValues(nftFilter: boolean): string[] {
  let result = Object
    .keys(TransactionType)
    .sort((a, b) => {
      return makeTypeLabel(a as TransactionType) < makeTypeLabel(b as TransactionType) ? -1 : 1;
    })
  if (nftFilter) {
    result = result.filter(el => {
      return el === "CRYPTOTRANSFER" || el === "TOKENMINT" || el === "CRYPTOAPPROVEALLOWANCE" || el === "CRYPTODELETEALLOWANCE" || el === "TOKENWIPE" || el === "TOKENBURN" || el === "TOKENDELETION";
    })
  }
  result.splice(0, 0, "")
  return result
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
