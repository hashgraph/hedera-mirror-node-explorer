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
  <div v-if="evmAddress">
    <div :class="{'is-flex': isSmallScreen, 'h-is-text-size-3': !hasCustomFont, 'is-family-monospace': !hasCustomFont}"
         class="is-inline-block" style="line-height: 20px">
      <Copyable :content-to-copy="evmAddress ?? ''" :enable-copy="enableCopy">
        <template v-slot:content>
          <span class="has-text-grey">{{ nonSignificantPart }}</span>
          <span>{{ significantPart }}</span>
        </template>
      </Copyable>
      <span v-if="hederaId && showId">
        <span class="ml-1">(</span>
        <router-link v-if="isContract" :to="{name: 'ContractDetails', params: {contractId: hederaId}}">{{ hederaId }}</router-link>
        <router-link v-else-if="isAccount" :to="{name: 'AccountDetails', params: {accountId: hederaId}}">{{ hederaId }}</router-link>
        <span v-else>{{ hederaId }}</span>
        <span>)</span>
      </span>
    </div>
    <div v-if="showType" class="h-is-extra-text h-is-text-size-2">{{ entityType }}</div>
  </div>
  <div v-else-if="initialLoading"/>
  <div v-else-if="showNone" class="has-text-grey">None</div>
  <div v-else></div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onMounted, ref, watch} from "vue";
import {initialLoadingKey} from "@/AppKeys";
import {systemContractRegistry} from "@/schemas/SystemContractRegistry";
import {AccountByAddressCache} from "@/utils/cache/AccountByAddressCache";
import {EthereumAddress} from "@/utils/EthereumAddress";
import {AccountByIdCache} from "@/utils/cache/AccountByIdCache";
import Copyable from "@/components/Copyable.vue";
import {EntityID} from "@/utils/EntityID";
import {makeEthAddressForAccount} from "@/schemas/HederaUtils";
import {AccountBalanceTransactions} from "@/schemas/HederaSchemas";

export default defineComponent({
  name: "EVMAddress",
  components: {Copyable},
  props: {
    address: String,
    id: String,
    entityType: String,
    showId: {
      type: Boolean,
      default: true
    },
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
    },
    hasCustomFont: {
      type: Boolean,
      default: false
    },
    enableCopy: {
      type: Boolean,
      default: true
    },
    showNone: {
      type: Boolean,
      default: true
    },
  },

  setup(props) {
    const initialLoading = inject(initialLoadingKey, ref(false))
    const isSmallScreen = inject('isSmallScreen', ref(false))

    const isContract = computed(() => props.entityType === 'CONTRACT')
    const isAccount = computed(() => props.entityType === 'ACCOUNT')

    const hederaId = ref<string|null>(null)
    const evmAddress = ref<string|null>(null)
    const ethereumAddress = computed( () => EthereumAddress.parse(evmAddress.value ?? ''))

    onMounted(() => updateIdAndAddress())
    watch([() => props.address, () => props.id], () => updateIdAndAddress())

    const updateIdAndAddress = async () => {
      hederaId.value = props.id ?? null
      evmAddress.value = props.address ?? null
      let account: AccountBalanceTransactions|null

      if (hederaId.value === null || evmAddress.value === null || ethereumAddress.value?.isLongZeroForm()) {
        if (hederaId.value !== null) {
          account = await AccountByIdCache.instance.lookup(hederaId.value)
        } else if (evmAddress.value !== null) {
          account = await AccountByAddressCache.instance.lookup(evmAddress.value.toString())
        } else {
          account = null
        }
        if (account) {
          hederaId.value = account?.account
          evmAddress.value = makeEthAddressForAccount(account) ?? evmAddress.value
        }
      }
      if (hederaId.value === null) {
        hederaId.value = ethereumAddress.value?.toEntityID()?.toString() ?? null
      }
      if (evmAddress.value === null) {
        evmAddress.value = EntityID.parse(hederaId.value ?? '')?.toAddress() ?? null
      }
      if (hederaId.value) {
        hederaId.value = systemContractRegistry.lookup(hederaId.value)?.description ?? hederaId.value
      }
    }

    const displayAddress = computed(
        () => props.compact
            ? ethereumAddress.value?.toCompactString(props.bytesKept)  ?? ""
            : ethereumAddress.value?.toString() ?? "")

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

    const copyToClipboard = (): void => {
      if (evmAddress.value) {
        navigator.clipboard.writeText(evmAddress.value.toString())
      }
    }

    return {
      isSmallScreen,
      isContract,
      isAccount,
      initialLoading,
      nonSignificantPart,
      significantPart,
      hederaId,
      evmAddress,
      copyToClipboard
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style />
