/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2022 Hedera Hashgraph, LLC
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

import {EntityLoader} from "@/utils/loader/EntityLoader";
import {AccountBalanceTransactions, TokenBalance} from "@/schemas/HederaSchemas";
import {makeEthAddressForAccount} from "@/schemas/HederaUtils";
import {operatorRegistry} from "@/schemas/OperatorRegistry";
import {computed, Ref} from "vue";
import axios, {AxiosResponse} from "axios";
import {base32ToAlias, byteToHex} from "@/utils/B64Utils";
import {networkRegistry} from "@/schemas/NetworkRegistry";
import router from "@/router";

export class AccountLoader extends EntityLoader<AccountBalanceTransactions> {

    //
    // Public
    //

    public constructor(accountLocator: Ref<string|null>) {
        super()
        this.accountLocator = accountLocator
        this.watchAndReload([this.accountLocator])
    }

    public readonly accountLocator: Ref<string|null> // Entity Id or Alias or EVM Address

    public readonly accountId: Ref<string|null> = computed(() => this.entity.value?.account ?? null)

    public readonly accountChecksum: Ref<string|null> = computed(() =>
        this.accountId.value ? networkRegistry.computeChecksum(
            this.accountId.value,
            router.currentRoute.value.params.network as string
        ) : null)

    public readonly balance: Ref<number|null> = computed(() => this.entity.value?.balance?.balance ?? null)

    public readonly createdTimestamp: Ref<string|null> = computed(() => this.entity.value?.created_timestamp ?? null)

    public readonly tokens: Ref<[TokenBalance]|null> = computed(() => this.entity.value?.balance?.tokens ?? null)

    public readonly stakedNodeId: Ref<number|null> = computed(() => this.entity.value?.staked_node_id ?? null)

    public readonly stakedAccountId: Ref<string|null> = computed(() => this.entity.value?.staked_account_id ?? null)

    public readonly stakePeriodStart: Ref<string|null> = computed(() => this.entity.value?.stake_period_start ?? null)

    public readonly pendingReward: Ref<number|null> = computed(() => this.entity.value?.pending_reward ?? null)

    public readonly accountInfo: Ref<string|null> = computed(() => {
        return this.accountId.value !== null ? operatorRegistry.makeDescription(this.accountId.value) : null
    })

    public readonly nodeId: Ref<number|null> = computed(() => {
        return this.accountId.value !== null ? operatorRegistry.lookup(this.accountId.value)?.nodeId ?? null : null
    })

    public readonly ethereumAddress = computed(() => {
        return this.entity.value !== null ? makeEthAddressForAccount(this.entity.value) : null
    })

    public readonly aliasByteString = computed(() => {
        const alias32 = this.entity.value?.alias
        const aliasBytes = alias32 ? base32ToAlias(alias32) : null
        return aliasBytes !== null ? byteToHex(aliasBytes) : null
    })

    //
    // EntityLoader
    //

    protected async load(): Promise<AxiosResponse<AccountBalanceTransactions>|null> {
        let result: Promise<AxiosResponse<AccountBalanceTransactions>|null>
        if (this.accountLocator.value != null) {
            const url = "api/v1/accounts/" + this.accountLocator.value
            const params = {
                limit: 1
            }
            result = axios.get<AccountBalanceTransactions>(url, { params: params})
        } else {
            result = Promise.resolve(null)
        }
        return result
    }

}
