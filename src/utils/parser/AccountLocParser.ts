/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import {computed, ComputedRef, Ref, ref, watch, WatchStopHandle} from "vue";
import {PathParam} from "@/utils/PathParam";
import {EntityID} from "@/utils/EntityID";
import {EthereumAddress} from "@/utils/EthereumAddress";
import {AccountAlias} from "@/utils/AccountAlias";
import {AccountByIdCache} from "@/utils/cache/AccountByIdCache";
import {AccountBalanceTransactions, Key, TokenBalance} from "@/schemas/HederaSchemas";
import {networkRegistry} from "@/schemas/NetworkRegistry";
import router from "@/router";
import {NodeRegistry} from "@/components/node/NodeRegistry";
import {makeEthAddressForAccount} from "@/schemas/HederaUtils";
import {base32ToAlias, byteToHex} from "@/utils/B64Utils";
import {AccountByAddressCache} from "@/utils/cache/AccountByAddressCache";
import {AccountByAliasCache} from "@/utils/cache/AccountByAliasCache";

export class AccountLocParser {

    public readonly accountLoc: Ref<string|null>
    public readonly accountInfo: Ref<AccountBalanceTransactions|null> = ref(null)

    private watchHandle: Ref<WatchStopHandle|null> = ref(null)
    private readonly loadCounter: Ref<number> = ref(0)

    //
    // Public
    //

    public constructor(accountLoc: Ref<string|null>) {
        this.accountLoc = accountLoc
    }

    public mount(): void {
        this.watchHandle.value = watch(this.accountLocObj, this.accountLocObjDidChange, { immediate: true})
    }

    public unmount(): void {
        if (this.watchHandle.value !== null) {
            this.watchHandle.value()
            this.watchHandle.value = null
        }
        this.accountInfo.value = null
        this.loadCounter.value = 0
    }

    public remount(): void {
        if (this.watchHandle.value !== null) { // ie mounted
            if (this.accountInfo.value !== null) {
                // We tell all account caches to forget this account
                if (this.accountInfo.value.account) {
                    AccountByIdCache.instance.forget(this.accountInfo.value.account)
                }
                if (this.accountInfo.value.alias) {
                    AccountByAliasCache.instance.forget(this.accountInfo.value.alias)
                }
                const address = makeEthAddressForAccount(this.accountInfo.value)
                if (address) {
                    AccountByAddressCache.instance.forget(address)
                }
            }
            this.unmount()
            this.mount()
        }
    }

    public readonly isInactiveEvmAddress = computed(() => {
        const l = this.accountLocObj.value
        return l !== null
            && l instanceof EthereumAddress
            && this.accountInfo.value === null
            && this.loadCounter.value >= 1
    })

    public readonly accountId: ComputedRef<string|null>
        = computed(() => this.accountInfo.value?.account ?? null)

    public readonly accountChecksum: Ref<string|null> = computed(() =>
        this.accountId.value ? networkRegistry.computeChecksum(
            this.accountId.value,
            router.currentRoute.value.params.network as string
        ) : null)

    public readonly balance: Ref<number|null> = computed(() => this.accountInfo.value?.balance?.balance ?? null)

    public readonly createdTimestamp: Ref<string|null> = computed(() => this.accountInfo.value?.created_timestamp ?? null)

    public readonly key: Ref<Key|null> = computed(() => this.accountInfo.value?.key ?? null)

    public readonly tokens: Ref<TokenBalance[]|null> = computed(() => this.accountInfo.value?.balance?.tokens ?? null)

    public readonly stakedNodeId: Ref<number|null> = computed(() => this.accountInfo.value?.staked_node_id ?? null)

    public readonly stakedAccountId: Ref<string|null> = computed(() => this.accountInfo.value?.staked_account_id ?? null)

    public readonly stakePeriodStart: Ref<string|null> = computed(() => {
        const dateOptions = {
            weekDay: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
            minute: "numeric",
            second: "numeric",
            timeZoneName: "short",
            timeZone: "UTC"
        }
        const dateFormat = new Intl.DateTimeFormat("en-US", dateOptions)
        let result: string | null
        if (this.accountInfo.value?.stake_period_start) {
            result = dateFormat.format(Number.parseFloat(this.accountInfo.value.stake_period_start) * 1000)
        } else {
            result = null
        }
        return result
    })

    public readonly pendingReward: Ref<number|null> = computed(() => this.accountInfo.value?.pending_reward ?? null)

    public readonly accountDescription: Ref<string|null> = computed(() => {
        return NodeRegistry.getShortDescription(ref(null), this.accountId)
    })

    public readonly nodeId: Ref<number|null> = computed(() => {
        return NodeRegistry.getCursor(ref(null), this.accountId).node.value?.node_id ?? null
    })

    public readonly ethereumAddress = computed(() => {
        return this.accountInfo.value !== null ? makeEthAddressForAccount(this.accountInfo.value) : null
    })

    public readonly aliasByteString = computed(() => {
        const alias32 = this.accountInfo.value?.alias
        const aliasBytes = alias32 ? base32ToAlias(alias32) : null
        return aliasBytes !== null ? byteToHex(aliasBytes) : null
    })

    public readonly errorNotification: Ref<string|null> = computed(() => {
        let result: string|null
        const l = this.accountLoc.value
        const o = this.accountLocObj.value
        const a = this.accountInfo.value
        if (l !== null && this.watchHandle.value !== null) {
            if (o !== null) {
                if (a !== null) {
                    if (a.deleted == true) {
                        result = "Account is deleted"
                    } else {
                        result = null
                    }
                } else if (this.loadCounter.value >= 1) {
                    if (o instanceof EntityID) {
                        result = "Account with ID " + o + " was not found"
                    } else if (o instanceof EthereumAddress) {
                        result = "Own this account? " +
                            "Activate it by transferring any amount of ℏ or tokens to " + o.toCompactString() + '.'
                    } else { // o instanceof AccountAlias
                        result = "Account with alias " + o + " was not found"
                    }
                } else { // this.loadCounter.value === 0 => not loaded yet
                    result = null
                }
            } else {
                result = "Invalid account ID, address or alias: " + l
            }
        } else {
            result = null
        }
        return result
    })

    //
    // Private
    //

    private readonly accountLocObjDidChange = async () => {
        const l = this.accountLocObj.value
        if (l !== null) {
            try {
                if (l instanceof EntityID) {
                    this.accountInfo.value = await AccountByIdCache.instance.lookup(l.toString())
                } else if (l instanceof EthereumAddress) {
                    this.accountInfo.value = await AccountByAddressCache.instance.lookup(l.toString())
                } else { // l instanceof AccountAlias
                    this.accountInfo.value = await AccountByAliasCache.instance.lookup(l.toString())
                }
            } catch(error) {
                this.accountInfo.value = null
            } finally {
                this.loadCounter.value += 1
            }
        } else {
            this.accountInfo.value = null
        }
    }

    private readonly accountLocObj = computed(() => {
        let result: EntityID|EthereumAddress|AccountAlias|null
        if (this.accountLoc.value !== null) {
            result = PathParam.parseAccountLoc(this.accountLoc.value)
        } else {
            result = null
        }
        return result
    })

}