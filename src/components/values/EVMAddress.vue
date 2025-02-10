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
  <div v-if="evmAddress">
    <div class="evm-address">
      <Copyable :content-to-copy="evmAddress ?? ''" :enable-copy="enableCopy">
        <template v-slot:content>
          <div class="has-text-grey h-is-monospace" style="display: inline">
            {{ (props.compact || !isSmallScreen) ? nonSignificantCompact : nonSignificantFull }}
          </div>
          <div class="h-is-monospace" style="margin-right: 4px; display: inline">
            {{ (props.compact || !isSmallScreen) ? significantCompact : significantFull }}
          </div>
        </template>
      </Copyable>
      <span v-if="entityId && showId">
        <span style="word-wrap: break-word">(</span>
        <router-link v-if="verified && !showType" :to="routeManager.makeRouteToContract(entityId)">
          <span>{{ contractName }}</span>
        </router-link>
        <router-link v-else-if="systemContract !== null" :to="routeManager.makeRouteToContract(entityId)">
          <span>{{ displayId }}</span>
        </router-link>
        <ContractLink v-else-if="entityLinkType === ExtendedEntityType.CONTRACT" :contract-id="entityId"/>
        <AccountLink v-else-if="entityLinkType === ExtendedEntityType.ACCOUNT" :account-id="entityId"/>
        <TokenLink v-else-if="entityLinkType === ExtendedEntityType.TOKEN" :token-id="entityId"/>
        <span v-else>{{ displayId }}</span>
        <span style="margin-right: 4px">)</span>
        <span v-if="verified && !showType" class="icon is-small has-text-success">
          <i class="fas fa-check-circle"></i>
        </span>
      </span>
    </div>
    <div v-if="showType" class="address-type">
      <div class="has-text-grey">{{ entityType }}</div>
      <template v-if="verified">
        <div class="h-is-extra-text">
          {{ contractName }}
        </div>
        <div class="icon is-small has-text-success">
          <i class="fas fa-check-circle"></i>
        </div>
      </template>
    </div>
  </div>
  <div v-else-if="initialLoading"/>
  <div v-else-if="showNone" class="has-text-grey">None</div>
  <div v-else></div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, inject, onBeforeUnmount, onMounted, PropType, ref, watch} from "vue";
import {initialLoadingKey} from "@/AppKeys";
import {SystemContractEntry, systemContractRegistry} from "@/schemas/SystemContractRegistry";
import {AccountByAddressCache} from "@/utils/cache/AccountByAddressCache";
import {EthereumAddress} from "@/utils/EthereumAddress";
import Copyable from "@/elements/Copyable.vue";
import {ContractByAddressCache} from "@/utils/cache/ContractByAddressCache";
import {ContractAnalyzer, GlobalState} from "@/utils/analyzer/ContractAnalyzer";
import {routeManager} from "@/router";
import ContractLink from "@/components/values/link/ContractLink.vue";
import AccountLink from "@/components/values/link/AccountLink.vue";
import TokenLink from "@/components/values/link/TokenLink.vue";

enum ExtendedEntityType { UNDEFINED, ACCOUNT, CONTRACT, TOKEN }

const props = defineProps({
  address: {
    type: String as PropType<string | null>,
    default: null
  },
  id: {
    type: String as PropType<string | null>,
    default: null
  },
  entityType: {
    type: String as PropType<string | null>,
    default: null
  },
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
  enableCopy: {
    type: Boolean,
    default: true
  },
  showNone: {
    type: Boolean,
    default: true
  },
})

const initialLoading = inject(initialLoadingKey, ref(false))
const isSmallScreen = inject('isSmallScreen', ref(true))

const entityLinkType = ref<ExtendedEntityType>(ExtendedEntityType.UNDEFINED)
const evmAddress = ref<string | null>(null)
const entityId = ref<string | null>(null)
const systemContract = ref<SystemContractEntry | null>(null)
const ethereumAddress = computed(() => EthereumAddress.parse(evmAddress.value ?? ''))
const derivedEntityId = computed(() => ethereumAddress.value?.toEntityID()?.toString() ?? null)

onMounted(() => updateIdAndAddress())
watch([() => props.address, () => props.id, () => props.entityType], () => updateIdAndAddress())

const updateIdAndAddress = async () => {
  entityLinkType.value = ExtendedEntityType.UNDEFINED
  evmAddress.value = props.address ?? null
  entityId.value = props.id ?? derivedEntityId.value

  if (props.entityType === "ACCOUNT") {
    if (ethereumAddress.value?.isLongZeroForm() || entityId.value === null) {
      await updateFromAccount()
    }
  } else if (props.entityType === "CONTRACT") {
    if (!await updateFromSystemContract()) {
      if (!await updateFromContract()) {
        entityLinkType.value = ExtendedEntityType.TOKEN
      }
    }
  } else { // props.entityType undefined
    if (!await updateFromSystemContract()) {
      if (!await updateFromContract()) {
        if (!await updateFromAccount()) {
          entityLinkType.value = ExtendedEntityType.TOKEN
        }
      }
    }
  }
}

const updateFromSystemContract = async (): Promise<boolean> => {
  systemContract.value = derivedEntityId.value !== null ? systemContractRegistry.lookup(derivedEntityId.value) : null
  return Promise.resolve(systemContract.value !== null)
}

const updateFromAccount = async (): Promise<boolean> => {
  const account = props.address !== null ? await AccountByAddressCache.instance.lookup(props.address) : null
  if (account !== null) {
    entityLinkType.value = ExtendedEntityType.ACCOUNT
    evmAddress.value = account.evm_address
    entityId.value = account.account
  } else {
    entityLinkType.value = ExtendedEntityType.UNDEFINED
    evmAddress.value = null
    entityId.value = null
  }
  return Promise.resolve(account !== null)
}

const updateFromContract = async (): Promise<boolean> => {
  const contract = props.address !== null ? await ContractByAddressCache.instance.lookup(props.address) : null
  if (contract !== null) {
    entityLinkType.value = ExtendedEntityType.CONTRACT
    evmAddress.value = contract.evm_address
    entityId.value = contract.contract_id
  } else {
    entityLinkType.value = ExtendedEntityType.UNDEFINED
    evmAddress.value = null
    entityId.value = null
  }
  return Promise.resolve(contract !== null)
}

const displayId = computed(
    () => systemContract.value !== null ? systemContract.value.description : entityId.value)

const compactForm = computed(() => ethereumAddress.value?.toCompactString(props.bytesKept) ?? "")
const nonSignificantCompact = computed(() => compactForm.value.slice(0, nonSignificantSize(compactForm.value)))
const significantCompact = computed(() => compactForm.value.slice(nonSignificantSize(compactForm.value)))

const fullForm = computed(() => ethereumAddress.value?.toString() ?? "")
const nonSignificantFull = computed(() => fullForm.value.slice(0, nonSignificantSize(fullForm.value)))
const significantFull = computed(() => fullForm.value.slice(nonSignificantSize(fullForm.value)))

const nonSignificantSize = (address: string) => {
  let i: number
  for (i = 0; i < address.length; i++) {
    const c = address[i]
    if (c !== '0' && c !== 'x' && c !== '…') {
      break
    }
  }
  return i
}

const contractAnalyzer = new ContractAnalyzer(entityId)
onMounted(() => contractAnalyzer.mount())
onBeforeUnmount(() => contractAnalyzer.unmount())

const contractName = computed(() => contractAnalyzer.contractName.value)
const verified = computed(() => contractAnalyzer.globalState.value !== GlobalState.Unverified)

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.evm-address {
  display: inline-block;
  line-height: 20px;
  word-wrap: break-word;
}

div.address-type {
  display: flex;
  gap: 4px;
}

</style>
