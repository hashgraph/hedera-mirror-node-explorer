<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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
    <div :class="{'is-flex': isSmallScreen}" class="is-flex-wrap-wrap is-family-monospace h-is-text-size-3">
      <span class="has-text-grey">{{ nonSignificantPart }}</span>
      <span class="mr-1">{{ significantPart }}</span>
      <br/>
      <span v-if="entityId">
        <span>(</span>
        <router-link v-if="isContract" :to="{name: 'ContractDetails', params: {contractId: entityId}}">{{ entityId }}</router-link>
        <router-link v-else-if="isAccount" :to="{name: 'AccountDetails', params: {accountId: entityId}}">{{ entityId }}</router-link>
        <span v-else>{{ entityId }}</span>
        <span>)</span>
      </span>
    </div>
    <div v-if="showType" class="h-is-extra-text h-is-text-size-2">{{ entityType }}</div>
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
import {EntityID} from "@/utils/EntityID";
import {systemContractRegistry} from "@/schemas/SystemContractRegistry";

export default defineComponent({
  name: "EVMAddress",
  props: {
    address: String,
    id: String,
    entityType: String,
    showType: {
      type: Boolean,
      default: false
    },
    compact: {
      type: Boolean,
      default: false
    },
    bytesKept: {
      type: Number,
      default: 6
    }
  },

  setup(props) {
    const initialLoading = inject(initialLoadingKey, ref(false))
    const isSmallScreen = inject('isSmallScreen', ref(false))

    const isContract = computed(() => props.entityType === 'CONTRACT')
    const isAccount = computed(() => props.entityType === 'ACCOUNT')

    const displayAddress = computed(() => {
      let result: string
      if (props.compact  && props.address?.slice(0, 2) === "0x" && props.address.length === 42) {
        result = "0x" + props.address[2] + "…" + props.address.slice(-props.bytesKept)
      } else {
        result = props.address?.slice(0, 2) === "0x"
            ? props.address
            : props.address ? "0x" + props.address : ""
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

    const entityId = computed(() => {
      let result
      if (props.id) {
        result = props.id
      } else if (props.address) {
        const entity = EntityID.fromAddress(props.address)
        result = entity ? entity.toString() : null
      } else {
        result = null
      }
      if (result) {
        result = systemContractRegistry.lookup(result)?.description ?? result
      }
      return result
    })

    return {
      isSmallScreen,
      isContract,
      isAccount,
      initialLoading,
      nonSignificantPart,
      significantPart,
      entityId
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
