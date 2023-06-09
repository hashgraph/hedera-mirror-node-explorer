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
    <div :class="{'is-flex': isSmallScreen, 'h-is-text-size-3': !hasCustomFont, 'is-family-monospace': !hasCustomFont}"
         class="is-inline-block" style="line-height: 20px">
      <Copyable :content-to-copy="address ?? ''" :enable-copy="enableCopy">
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
    const evmAddress = ref<EthereumAddress|null>(null)

    onMounted(() => updateIdAndAddress())
    watch([() => props.address, () => props.id], async () => updateIdAndAddress())

    const updateIdAndAddress = () => {
      hederaId.value = props.id ?? evmAddress.value?.toEntityID()?.toString() ?? null
      evmAddress.value = EthereumAddress.parse(props.address ?? "")

      if (hederaId.value === null || evmAddress.value === null || evmAddress.value.isLongZeroForm()) {
        if (hederaId.value !== null) {
          AccountByIdCache.instance.lookup(hederaId.value)
              .then((account) => {
                if (account) {
                  evmAddress.value = EthereumAddress.parse(account?.evm_address ?? "")
                }
              })
              .finally(() => {
                if (evmAddress.value === null) {
                  evmAddress.value = EthereumAddress.parse(EntityID.parse(hederaId.value ?? '')?.toAddress() ?? '')
                }
              })
        } else if (evmAddress.value !== null) {
          AccountByAddressCache.instance.lookup(evmAddress.value.toString())
              .then((account) => {
                if (account) {
                  hederaId.value = account?.account ?? null
                  evmAddress.value = EthereumAddress.parse(account?.evm_address ?? "") ?? evmAddress.value
                }
              })
              .finally(() => {
                if (hederaId.value === null) {
                  hederaId.value = evmAddress.value?.toEntityID()?.toString() ?? null
                }
              })
        } else {
          // hederaId.value and evmAddress.value are both null - do nothing
        }
      }
      if (evmAddress.value === null) {
      }
      if (hederaId.value) {
        hederaId.value = systemContractRegistry.lookup(hederaId.value)?.description ?? hederaId.value
      }
    }

    const displayAddress = computed(
        () => props.compact
            ? evmAddress.value?.toCompactString(props.bytesKept)  ?? ""
            : evmAddress.value?.toString() ?? "")

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
      copyToClipboard
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style />
