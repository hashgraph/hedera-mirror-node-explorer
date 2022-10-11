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
  <div v-if="address">
    <span class="is-family-monospace h-is-text-size-3">
      <span class="has-text-grey">{{ nonSignificantPart }}</span>
      <span>{{ significantPart }}</span>
      <span v-if="id" class="ml-1">
        <span>(</span>
        <router-link v-if="isContract" :to="{name: 'ContractDetails', params: {contractId: id}}">{{ id }}</router-link>
        <router-link v-else :to="{name: 'AccountDetails', params: {accountId: id}}">{{ id }}</router-link>
        <span>)</span>
      </span>
    </span>
    <div v-if="showType" class="h-is-extra-text h-is-text-size-2">{{ idType }}</div>
  </div>
  <div v-else-if="initialLoading"/>
  <div v-else class="has-text-grey">None</div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, ref} from "vue";
import {initialLoadingKey} from "@/AppKeys";

export default defineComponent({
  name: "EVMAddress",
  props: {
    address: String,
    id: String,
    idType: String,
    showType: {
      type: Boolean,
      default: false
    },
    bytesKept: {
      type: Number,
      default: -1
    }
  },

  setup(props) {
    const initialLoading = inject(initialLoadingKey, ref(false))

    const isContract = computed(() => props.idType === 'CONTRACT')

    const displayAddress = computed(() => {
      let result: string
      if (props.bytesKept !== -1  && props.address?.slice(0, 2) === "0x" && props.address.length === 42) {
        result = "0x…" + props.address.slice(-props.bytesKept)
      } else {
        result = props.address ?? ""
      }
      return result
    })

    const nonSignificantSize = computed(() => {
      let i: number
      for (i = 0; i < displayAddress.value.length; i++) {
        const c = displayAddress.value[i]
        if (c !== '0' && c !== 'x' && c !== '…') {
          break
        }
      }
      return i
    })

    const nonSignificantPart = computed(
        () => displayAddress.value?.slice(0, nonSignificantSize.value))

    const significantPart = computed(
        () => displayAddress.value?.slice(nonSignificantSize.value))

    return {
      isContract,
      initialLoading,
      nonSignificantPart,
      significantPart
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
