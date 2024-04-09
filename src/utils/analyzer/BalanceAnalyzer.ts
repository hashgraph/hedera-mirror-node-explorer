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
import {BalancesResponse, TokenBalance} from "@/schemas/HederaSchemas";
import {BalanceCache} from "@/utils/cache/BalanceCache";
import {Duration} from "@/utils/Duration";

export class BalanceAnalyzer {

    public readonly accountId = ref<string | null>(null)
    private readonly updatePeriod: number
    private readonly response: Ref<BalancesResponse | null> = ref(null)
    private readonly watchHandle: Ref<WatchStopHandle | null> = ref(null)
    private timeoutID = -1

    //
    // Public
    //

    public constructor(accountId = ref<string | null>(null), updatePeriod: number) {
        this.accountId = accountId
        this.updatePeriod = updatePeriod
    }

    public mount(): void {
        this.watchHandle.value = watch(this.accountId, this.accountIdDidChange, {immediate: true})
    }

    public unmount(): void {
        if (this.watchHandle.value !== null) {
            this.watchHandle.value()
            this.watchHandle.value = null
        }
        this.response.value = null
        this.balanceAge.value = null
        if (this.timeoutID != -1) {
            window.clearTimeout(this.timeoutID)
            this.timeoutID = -1
        }
    }

    public readonly mounted: ComputedRef<boolean> = computed(() => {
        return this.watchHandle.value !== null
    })

    public readonly hbarBalance: ComputedRef<number | null> = computed(() => {
        const allBalances = this.response.value?.balances
        return allBalances && allBalances.length >= 1 ? allBalances[0].balance : null
    })

    public readonly tokenBalances: ComputedRef<Array<TokenBalance>> = computed(() => {
        const allBalances = this.response.value?.balances
        return allBalances && allBalances.length >= 1 ? allBalances[0].tokens : []
    })

    public readonly balanceTimeStamp: ComputedRef<string | null> = computed(() => {
        return this.response.value?.timestamp ?? null
    })

    public readonly balanceAge: Ref<Duration | null> = ref(null)

    //
    // Private
    //

    private readonly accountIdDidChange = async (): Promise<void> => {
        if (this.accountId.value !== null) {
            try {
                const r = await BalanceCache.instance.lookup(this.accountId.value, true)
                this.response.value = Object.freeze(r)
            } catch {
                this.response.value = null
            } finally {
                this.balanceAge.value = this.balanceTimeStamp.value !== null
                    ? Duration.decompose(new Date().getTime() / 1000 - Number.parseFloat(this.balanceTimeStamp.value))
                    : null
                this.scheduleNextLookup()
            }
        } else {
            this.response.value = null
            this.balanceAge.value = null
        }
    }

    private scheduleNextLookup() {
        const accountId = this.accountId.value
        window.setTimeout(() => {
            if (this.accountId.value === accountId && this.watchHandle.value !== null) {
                this.timeoutID = -1
                this.accountIdDidChange().catch()
            } // else accountId has changed or analyzer has been unmounted during sleep
        }, this.updatePeriod)
    }
}