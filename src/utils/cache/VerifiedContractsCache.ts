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

import {Contract, ContractsResponse} from "@/schemas/HederaSchemas";
import {SingletonCache, SingletonLookup} from "@/utils/cache/base/SingletonCache";
import axios, {AxiosResponse} from "axios";
import {routeManager} from "@/router";
import {computed, ComputedRef, ref, Ref} from "vue";
import {PlayPauseController} from "@/components/PlayPauseButton.vue";

export class VerifiedContractsCache extends SingletonCache<Contract[]> {

    private static MAX_ITERATIONS = 5
    private static ITERATION_LIMIT = 100
    private candidates: Contract[] = []

    public static MAX_CANDIDATES = VerifiedContractsCache.ITERATION_LIMIT * VerifiedContractsCache.MAX_ITERATIONS
    public static readonly instance = new VerifiedContractsCache()

    //
    // SingletonCache
    //

    public async lookup(): Promise<Contract[]> {
        return this.load()
    }

    public clear(): void {
        super.clear()
        this.candidates = []
    }

    public makeLookup(): VerifiedContractsLookup {
        return new VerifiedContractsLookup(this)
    }

    protected async load(): Promise<Contract[]> {
        console.log('VerifiedContractsCache.load')
        let result: Contract[] = []
        const sourcifySetup = routeManager.currentNetworkEntry.value.sourcifySetup!

        if (sourcifySetup !== null && sourcifySetup.activate) {
            const isRefresh = this.candidates.length > 0
            let loadedContracts: Contract[] = []
            let nextURL: string | null = "api/v1/contracts"
            let iteration = 0

            while (nextURL !== null && iteration < VerifiedContractsCache.MAX_ITERATIONS) {
                const params = {
                    limit: VerifiedContractsCache.ITERATION_LIMIT,
                    order: 'desc',
                    'contract.id': isRefresh ? `gt:${this.candidates[0].contract_id}` : undefined
                }
                const response: AxiosResponse<ContractsResponse> =
                    await axios.get<ContractsResponse>(nextURL, {params: iteration === 0 ? params : undefined})
                loadedContracts = loadedContracts.concat(response.data.contracts ?? [])
                nextURL = response.data.links?.next ?? null
                iteration += 1
            }

            this.candidates = loadedContracts.concat(this.candidates).slice(0, VerifiedContractsCache.MAX_CANDIDATES)

            if (this.candidates.length > 0) {

                const addressesToCheck: string[] = []
                this.candidates.forEach((c) => addressesToCheck.push(c.evm_address))
                const verifiedAddresses: string[] = []

                const baseURL = sourcifySetup.makeCheckAllByAddressURL()
                const MAX_VERIFICATIONS = 100
                for (let i = 0; i < addressesToCheck.length; i += MAX_VERIFICATIONS) {
                    const queryParams = new URLSearchParams();
                    queryParams.append('chainIds', sourcifySetup.chainID.toString());
                    queryParams.append('addresses', addressesToCheck.slice(i, i + MAX_VERIFICATIONS).join());
                    const requestURL = `${baseURL}?${queryParams.toString()}`;

                    const sourcifyResponse: AxiosResponse<Array<any>> = await axios.get<Array<any>>(requestURL)
                    if (sourcifyResponse.data) {
                        for (const r of sourcifyResponse.data) {
                            if ('chainIds' in r) {
                                verifiedAddresses.push(r.address.toLowerCase())
                            }
                        }
                    }
                }

                for (const c of this.candidates) {
                        if (verifiedAddresses.includes(c.evm_address)) {
                            result.push(c)
                        }
                }
            }
        }
        return Promise.resolve(result)
    }
}

export class VerifiedContractsLookup extends SingletonLookup<Contract[]> implements PlayPauseController {

    private updatePeriod = 10000
    private timeoutID = -1
    private maxRefreshCount = 10
    private refreshCount = 0
    private autoRefreshRef: Ref<boolean> = ref(false)

    constructor(cache: VerifiedContractsCache) {
        super(cache)
    }

    public mount(): void {
        this.startAutoRefresh()
    }

    public unmount(): void {
        this.entity.value = null
        this.stopAutoRefresh()
    }

    //
    // PlayPauseController
    //

    public autoRefresh : ComputedRef<boolean> = computed(() => this.autoRefreshRef.value)

    public startAutoRefresh(): void {
        if (!this.autoRefreshRef.value) {
            this.autoRefreshRef.value = true
            this.refreshCount = 0
            this.refresh()
        }
    }

    public stopAutoRefresh(): void  {
        if (this.autoRefreshRef.value) {
            this.autoRefreshRef.value = false
            if (this.timeoutID != -1) {
                window.clearTimeout(this.timeoutID)
                this.timeoutID = -1
            }
        }
    }

    private scheduleNextRefresh(): void  {
        this.timeoutID = window.setTimeout(() => this.refresh(), this.updatePeriod)
    }

    private async refresh(): Promise<void> {
        this.refreshCount += 1
        console.log(`Refresh iteration ${this.refreshCount}`)
        if (this.refreshCount < this.maxRefreshCount) {
            this.scheduleNextRefresh()
        } else {
            this.autoRefreshRef.value = false
        }
        this.entity.value = await this.cache.lookup()
        return Promise.resolve()
    }
}
