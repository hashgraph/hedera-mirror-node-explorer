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

import {computed, ComputedRef, ref, Ref, watch} from "vue";
import {PlayPauseController} from "@/components/PlayPauseButton.vue";
import {Contract} from "@/schemas/HederaSchemas";
import {VerifiedContractsBuffer, VerifiedContractsByAccountCache} from "@/utils/cache/VerifiedContractsByAccountCache";
import {Lookup} from "@/utils/cache/base/EntityCache";
import axios, {AxiosError} from "axios";

export class VerifiedContractsController implements PlayPauseController {

    private contractsLookup: Lookup<string, VerifiedContractsBuffer | null>

    //
    // Public
    //

    public contracts: Ref<Contract[]> = ref([])
    public capacity = VerifiedContractsBuffer.MAX_CANDIDATES
    public overflow = computed(() => this.contractsLookup.entity.value?.overflow ?? false)
    public loaded = computed(() => this.contractsLookup.entity.value != null)

    public constructor(accountId: Ref<string | null>) {
        this.contractsLookup = VerifiedContractsByAccountCache.instance.makeLookup(accountId)
        watch(
            this.contractsLookup.entity,
            () => this.contracts.value = this.contractsLookup.entity.value?.contracts ?? []
        )
    }


    public mount(): void {
        this.contractsLookup.mount()
        this.refresh()
    }

    public unmount(): void {
        this.cancelNextRefresh()
        this.contractsLookup.unmount()
    }

    //
    // PlayPauseController
    //

    public readonly autoRefresh: ComputedRef<boolean> = computed(() => this.autoRefreshRef.value)

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
            this.cancelNextRefresh()
        }
    }

    //
    // Private
    //

    private updatePeriod = 10000
    private timeoutID = -1
    private maxRefreshCount = 10
    private refreshCount = 0
    private autoRefreshRef: Ref<boolean> = ref(false)

    private async refresh(): Promise<void> {
        this.autoRefreshRef.value = true
        if (this.contractsLookup.entity.value != null) {
            this.contractsLookup.entity.value.update().catch(this.errorHandler)
            this.contractsLookup.entity.value.contracts.forEach((c) => {
                if (!this.contracts.value.includes(c)) {
                    this.contracts.value.unshift(c)
                }
            })
        }
        this.refreshCount += 1
        if (this.refreshCount < this.maxRefreshCount) {
            this.scheduleNextRefresh()
        } else {
            this.autoRefreshRef.value = false
        }
        return Promise.resolve()
    }

    private scheduleNextRefresh(): void  {
        this.timeoutID = window.setTimeout(
            () => this.refresh(),
            this.updatePeriod
        )
    }

    private cancelNextRefresh(): void {
        if (this.timeoutID != -1) {
            window.clearTimeout(this.timeoutID)
            this.timeoutID = -1
        }
    }

    private readonly errorHandler = (reason: unknown): void => {
        console.log("reason=" + reason)
        if (axios.isAxiosError(reason)) {
            const axiosError = reason as AxiosError
            console.log("url=" + axiosError.config?.url)
        }
    }
}
