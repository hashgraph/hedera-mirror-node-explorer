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

import {EntityCacheV2} from "@/utils/EntityCacheV2";
import {BalancesResponse, TokenBalance} from "@/schemas/HederaSchemas";
import axios, {AxiosResponse} from "axios";
import {computed, Ref, ref, watch} from "vue";

export class BalanceCache extends EntityCacheV2<BalancesResponse> {

    public readonly accountId = ref<string|null>(null)
    private readonly limit: number

    //
    // Public
    //

    public constructor(limit = 100, updatePeriod: number|null = null) {
        super(updatePeriod)
        this.limit = limit
        watch(this.accountId, () => this.clear())
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

    protected load(): Promise<AxiosResponse<BalancesResponse>> {
        const params = {
            'account.id': this.accountId.value,
            limit: this.limit,
            order: 'asc'
        }
        return axios.get<BalancesResponse>("api/v1/balances", { params: params} )
    }
}
