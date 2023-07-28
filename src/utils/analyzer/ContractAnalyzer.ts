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

import {computed, ComputedRef, ref, Ref, watch, WatchStopHandle} from "vue";
import {SystemContractEntry, systemContractRegistry} from "@/schemas/SystemContractRegistry";
import {ethers} from "ethers";
import {AssetCache} from "@/utils/cache/AssetCache";

export class ContractAnalyzer {

    public readonly contractId: Ref<string|null>
    private readonly watchHandle: Ref<WatchStopHandle|null> = ref(null)
    private readonly systemContractEntryRef: Ref<SystemContractEntry|null> = ref(null)
    private readonly interfaceRef: Ref<ethers.utils.Interface|null> = ref(null)

    //
    // Public
    //

    public constructor(contractId: Ref<string|null>) {
        this.contractId = contractId
    }

    public mount(): void {
        this.watchHandle.value = watch(this.contractId, this.contractIdDidChange, { immediate: true})
    }

    public unmount(): void {
        if (this.watchHandle.value !== null) {
            this.watchHandle.value()
            this.watchHandle.value = null
        }
        this.systemContractEntryRef.value = null
        this.interfaceRef.value = null
    }

    public readonly interface: ComputedRef<ethers.utils.Interface|null> = computed(
        () => this.interfaceRef.value)



    //
    // Private
    //

    private readonly contractIdDidChange = async() => {
        if (this.contractId.value !== null) {
            const sce = systemContractRegistry.lookup(this.contractId.value)
            if (sce !== null) {
                // This is a system contract
                this.systemContractEntryRef.value = sce
                try {
                    const asset = await AssetCache.instance.lookup(sce.abiURL) as { abi: ethers.utils.Fragment[]}
                    const i = new ethers.utils.Interface(asset.abi)
                    this.interfaceRef.value = Object.preventExtensions(i) // Because ethers does not like Ref introspection
                } catch {
                    this.interfaceRef.value = null
                }
            } else {
                // Check if contract metadata are available and fetch abi
                this.systemContractEntryRef.value = null
            }
        } else {
            this.systemContractEntryRef.value = null
        }
    }
}
