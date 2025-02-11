/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2024 Hedera Hashgraph, LLC
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
import {BalancesResponse, TokenBalance} from "@/schemas/MirrorNodeSchemas";
import {BalanceCache} from "@/utils/cache/BalanceCache";
import {Duration} from "@/utils/Duration";
import {EntityLoader} from "@/utils/loader/EntityLoader.ts";

export class BalanceAnalyzer extends EntityLoader<BalancesResponse> {

    public readonly accountId = ref<string | null>(null)
    private watchStopHandle: WatchStopHandle | null = null

    //
    // Public
    //

    public constructor(accountId = ref<string | null>(null), updatePeriod: number) {
        super(updatePeriod, EntityLoader.HUGE_COUNT /* refresh forever */)
        this.accountId = accountId
    }

    public readonly hbarBalance: ComputedRef<number | null> = computed(() => {
        const allBalances = this.entity.value?.balances
        return allBalances && allBalances.length >= 1 ? allBalances[0].balance : null
    })

    public readonly tokenBalances: ComputedRef<Array<TokenBalance>> = computed(() => {
        const allBalances = this.entity.value?.balances
        return allBalances && allBalances.length >= 1 ? allBalances[0].tokens : []
    })

    public readonly balanceTimeStamp: ComputedRef<string | null> = computed(() => {
        return this.entity.value?.timestamp ?? null
    })

    public readonly balanceAge: Ref<Duration | null> = computed(() => {
        return this.balanceTimeStamp.value !== null
            ? Duration.decompose(new Date().getTime() / 1000 - Number.parseFloat(this.balanceTimeStamp.value))
            : null
    })

    //
    // EntityLoader
    //

    public mount(): void {
        super.mount()
        this.watchStopHandle = watch(this.accountId, () => {
            this.pause()
            this.resume()
        })
    }

    public unmount(): void {
        if (this.watchStopHandle != null) {
            this.watchStopHandle()
            this.watchStopHandle = null
        }
        super.unmount()
    }

    protected async load(): Promise<BalancesResponse | null> {
        let result: BalancesResponse|null
        if (this.accountId.value !== null) {
            result = await BalanceCache.instance.lookup(this.accountId.value, true)
        } else {
            result = null
        }
        return Promise.resolve(result)
    }
}
