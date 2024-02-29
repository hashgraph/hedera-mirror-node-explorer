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

export class VerifiedContractsController implements PlayPauseController {

    private contractsLookup: Lookup<string, VerifiedContractsBuffer | null>

    //
    // Public
    //

    public constructor(accountId: Ref<string | null>) {
        this.contractsLookup = VerifiedContractsByAccountCache.instance.makeLookup(accountId)
    }

    public readonly contracts: ComputedRef<Contract[]> = computed(() => {
        return this.contractsLookup.entity.value?.contracts ?? []
    })

    public capacity = 250

    public loaded = ref(false)
    public overflow = ref(false)

    public mount(): void {
        watch(this.contracts, ()=>console.log(`contracts.length: ${this.contracts.value.length}`))
        console.log(`VerifiedContractsController.mount`)
        this.contractsLookup.mount()
    }

    public unmount(): void {
        this.contractsLookup.unmount()
    }

    //
    // PlayPauseController
    //

    public autoRefresh: ComputedRef<boolean> = computed(() => this.autoRefreshRef.value)

    public startAutoRefresh(): void {

    }

    public stopAutoRefresh(): void  {

    }

    //
    // Private
    //

    private readonly autoRefreshRef: Ref<boolean> = ref(false)

    // private readonly errorHandler = (reason: unknown): void => {
    //     console.log("reason=" + reason)
    //     if (axios.isAxiosError(reason)) {
    //         const axiosError = reason as AxiosError
    //         console.log("url=" + axiosError.config?.url)
    //     }
    // }
}
