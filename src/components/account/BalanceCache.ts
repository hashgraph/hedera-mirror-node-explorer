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

import {AutoRefreshLoader} from "@/utils/loader/AutoRefreshLoader"
import {BalancesResponse, TokenBalance} from "@/schemas/HederaSchemas";
import axios, {AxiosResponse} from "axios";
import {computed, Ref, ref} from "vue";

export class BalanceCache extends AutoRefreshLoader<BalancesResponse> {

    public readonly accountId = ref<string|null>(null)

    //
    // Public
    //

    public constructor(accountId = ref<string|null>(null), updatePeriod: number) {
        super(updatePeriod, AutoRefreshLoader.HUGE_COUNT)
        this.accountId = accountId
        this.watchAndReload([this.accountId])
    }

    public readonly hbarBalance: Ref<number|null> = computed(() => {
        const allBalances = this.response.value?.data?.balances
        return allBalances && allBalances.length >= 1 ? allBalances[0].balance : null
    })

    public readonly tokenBalances: Ref<Array<TokenBalance>> = computed(() => {
        const allBalances = this.response.value?.data?.balances
        return allBalances && allBalances.length >= 1 ? allBalances[0].tokens : []
    })

    public readonly balanceTimeStamp: Ref<string|null> = computed(() => {
        return this.response.value?.data?.timestamp ?? null
    })

    //
    // EntityCache
    //

    protected load(): Promise<AxiosResponse<BalancesResponse>|null> {
        let result: Promise<AxiosResponse<BalancesResponse>|null>
        if (this.accountId.value !== null) {
            const params = {
                'account.id': this.accountId.value,
                limit: 1,
            }
            result = axios.get<BalancesResponse>("api/v1/balances", { params: params} )
        } else {
            result = Promise.resolve(null)
        }
        return result
    }
}
