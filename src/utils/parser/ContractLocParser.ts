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
import {ContractResponse} from "@/schemas/HederaSchemas";
import {EntityID} from "@/utils/EntityID";
import {EthereumAddress} from "@/utils/EthereumAddress";
import {PathParam} from "@/utils/PathParam";
import {ContractByIdCache} from "@/utils/cache/ContractByIdCache";
import {ContractByAddressCache} from "@/utils/cache/ContractByAddressCache";

export class ContractLocParser {

    public readonly contractLoc: Ref<string | null>
    public readonly contractResponse: Ref<ContractResponse | null> = ref(null)

    private watchHandle: Ref<WatchStopHandle | null> = ref(null)
    private readonly loadCounter: Ref<number> = ref(0)

    //
    // Public
    //

    public constructor(contractLoc: Ref<string | null>) {
        this.contractLoc = contractLoc
    }

    public mount(): void {
        this.watchHandle.value = watch(this.contractLocObj, this.contractLocObjDidChange, {immediate: true})
    }

    public unmount(): void {
        if (this.watchHandle.value !== null) {
            this.watchHandle.value()
            this.watchHandle.value = null
        }
        this.contractResponse.value = null
        this.loadCounter.value = 0
    }

    public readonly contractId: ComputedRef<string | null>
        = computed(() => this.contractResponse.value?.contract_id ?? null)

    public readonly ethereumAddress: ComputedRef<string | null>
        = computed(() => this.contractResponse.value?.evm_address ?? null)

    public readonly entity: ComputedRef<ContractResponse | null>
        = computed(() => this.contractResponse.value ?? null)

    public readonly errorNotification: ComputedRef<string | null> = computed(() => {
        let result: string | null
        const l = this.contractLoc.value
        const o = this.contractLocObj.value
        const r = this.contractResponse.value
        if (l !== null && this.watchHandle.value !== null) {
            if (o !== null) {
                if (r !== null) {
                    if (r.deleted) {
                        result = "Contract is deleted"
                    } else {
                        result = null
                    }
                } else if (this.loadCounter.value >= 1) {
                    if (o instanceof EntityID) {
                        result = "Contract with ID " + o + " was not found"
                    } else { // o instanceof Ethereum address
                        result = "Contract with address " + o + " was not found"
                    }
                } else { // this.loadCounter.value === 0 => not loaded yet
                    result = null
                }
            } else {
                result = "Invalid contract ID or address: " + l
            }
        } else {
            result = null
        }
        return result
    })

    //
    // Private
    //

    private readonly contractLocObjDidChange = async () => {
        const l = this.contractLocObj.value
        if (l !== null && this.watchHandle.value !== null) {
            try {
                if (l instanceof EntityID) {
                    this.contractResponse.value = await ContractByIdCache.instance.lookup(l.toString())
                } else {
                    this.contractResponse.value = await ContractByAddressCache.instance.lookup(l.toString())
                }
            } catch (error) {
                this.contractResponse.value = null
            } finally {
                this.loadCounter.value += 1
            }
        } else {
            this.contractResponse.value = null
        }
    }

    private readonly contractLocObj = computed(() => {
        let result: EntityID | EthereumAddress | null
        if (this.contractLoc.value !== null && this.watchHandle.value !== null) {
            result = PathParam.parseContractLoc(this.contractLoc.value)
        } else {
            result = null
        }
        return result
    })

}
