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
            <div class="shy-scope mr-1" style="display: inline-block; position: relative;">
                <span class="has-text-grey">{{ nonSignificantPart }}</span>
                <span>{{ significantPart }}</span>
                <div v-if="address" id="shyCopyButton" class="shy"
                     style="position: absolute; left: 0; top: 0; width: 100%; height: 100%">
                    <div style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.50)"></div>
                    <div v-if="enableCopy"
                         style="position: absolute; display: inline-block; left: 50%; top: 50%; transform: translate(-50%, -50%);">
                        <button class="button is-dark h-is-text-size-3"
                                v-on:click.stop="copyToClipboard">Copy to Clipboard
                        </button>
                    </div>
                </div>
            </div>
            <span v-if="entityId && showId">
        <span>(</span>
        <router-link v-if="isContract" :to="{name: 'ContractDetails', params: {contractId: entityId}}">{{
            entityId
            }}</router-link>
        <router-link v-else-if="isAccount" :to="{name: 'AccountDetails', params: {accountId: entityId}}">{{
            entityId
            }}</router-link>
        <span v-else>{{ entityId }}</span>
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

import {computed, defineComponent, inject, Ref, ref, watch} from "vue";
import {initialLoadingKey} from "@/AppKeys";
import {systemContractRegistry} from "@/schemas/SystemContractRegistry";
import {AccountByAddressCache} from "@/utils/cache/AccountByAddressCache";
import {EthereumAddress} from "@/utils/EthereumAddress";
import {AccountBalanceTransactions} from "@/schemas/HederaSchemas";

export default defineComponent({
    name: "EVMAddress",
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

        const evmAddress = computed(() => EthereumAddress.parse(props.address ?? ""))

        const displayAddress = computed(
            () => props.compact
                ? evmAddress.value?.toCompactString(props.bytesKept) ?? ""
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

        const account: Ref<AccountBalanceTransactions | null> = ref(null)
        watch(() => props.address, async () => {
            if (props.showId && evmAddress.value && !evmAddress.value.toEntityID()) {
                account.value = await AccountByAddressCache.instance.lookup(evmAddress.value.toString())
            } else {
                account.value = null
            }
        })

        const entityId = computed(() => {
            let result: string | null
            if (props.showId) {
                if (props.id) {
                    result = props.id
                } else if (evmAddress.value) {
                    result = evmAddress.value?.toEntityID()?.toString() ?? null
                } else {
                    result = null
                }
                if (result) {
                    result = systemContractRegistry.lookup(result)?.description ?? result
                } else {
                    result = account.value?.account ?? null
                }
            } else {
                result = null
            }
            return result
        })

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
            entityId,
            copyToClipboard
        }
    }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

.shy {
    display: none
}

.shy-scope:hover > .shy {
    display: block;
}

</style>
