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

  <SelectView
      v-bind:model-value="selectedFilter"
      @update:model-value="handleOption($event)"
      :small="true"
      data-cy="select-type"
  >
    <option v-for="f in filterValues" v-bind:key="f" v-bind:value="f">
      {{ makeFilterLabel(f) }}
    </option>
  </SelectView>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent} from "vue";
import {TransactionType} from "@/schemas/MirrorNodeSchemas";
import {makeTypeLabel} from "@/utils/TransactionTools";
import SelectView from "@/components/SelectView.vue";

export default defineComponent({
  name: "TransactionFilterSelect",
  components: {SelectView},

  props: {
    selectedFilter: {
      type: String,
      required: true,
    },
    nftFilter: {
      type: Boolean,
      required: false,
    },
  },

  setup(props, context) {
    const makeFilterLabel = (filterValue: string): string => {
      return filterValue == "" ? "TYPES: ALL" : makeTypeLabel(filterValue as TransactionType)
    }

    const handleOption = (option: string) => context.emit('update:selectedFilter', option)

    const filterValues = computed(() => {
      let result = Object
          .keys(TransactionType)
          .sort((a, b) => {
            return makeTypeLabel(a as TransactionType) < makeTypeLabel(b as TransactionType) ? -1 : 1;
          })
      if (props.nftFilter) {
        result = result.filter(el => {
          return el === TransactionType.CRYPTOTRANSFER
              || el ===TransactionType.TOKENMINT
              || el ===TransactionType.CRYPTOAPPROVEALLOWANCE
              || el ===TransactionType.CRYPTODELETEALLOWANCE
              || el ===TransactionType.TOKENWIPE
              || el ===TransactionType.TOKENAIRDROP
              || el ===TransactionType.TOKENBURN
              || el ===TransactionType.TOKENCANCELAIRDROP
              || el ===TransactionType.TOKENCLAIMAIRDROP
              || el ===TransactionType.TOKENREJECT
              || el ===TransactionType.TOKENDELETION;
        })
      }
      result.splice(0, 0, "")
      return result
    })

    return {
      filterValues,
      makeFilterLabel,
      handleOption,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
