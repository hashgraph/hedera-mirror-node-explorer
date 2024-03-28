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

import {FunctionCallAnalyzer} from "@/utils/analyzer/FunctionCallAnalyzer"
import {ContractResultDetails} from "@/schemas/HederaSchemas"
import {EntityID} from "@/utils/EntityID"
import {computed, ref, Ref, watch, WatchStopHandle} from "vue"
import {decodeSolidityErrorMessage} from "@/schemas/HederaUtils";
import {ContractResultByTsCache} from "@/utils/cache/ContractResultByTsCache";
import {ContractByAddressCache} from "@/utils/cache/ContractByAddressCache";

export class ContractResultAnalyzer {

    public readonly timestamp: Ref<string|null>
    public readonly functionCallAnalyzer: FunctionCallAnalyzer
    public readonly contractResult: Ref<ContractResultDetails|null> = ref(null)
    public readonly toId: Ref<string|null> = ref(null)
    public readonly fromId: Ref<string|null> = ref(null)
    private readonly watchHandle: Ref<WatchStopHandle[]> = ref([])

    //
    // Public
    //

    public constructor(timestamp: Ref<string | null>) {
        this.timestamp = timestamp
        this.functionCallAnalyzer = new FunctionCallAnalyzer(this.input, this.output, this.error, this.toId)
    }

    public mount(): void {
        this.watchHandle.value = [
            watch(this.timestamp, this.updateContractResult, { immediate: true}),
        ]
        this.functionCallAnalyzer.mount()
    }

    public unmount(): void {
        this.functionCallAnalyzer.unmount()
        for (const wh of this.watchHandle.value) {
            wh()
        }
        this.watchHandle.value = []
        this.contractResult.value = null
        this.toId.value = null
        this.fromId.value = null
    }

    public readonly gasPrice = computed(() => {
      return this.contractResult.value?.gas_price
          ? Number(filter0x(this.contractResult.value?.gas_price))
          : null
    })

    public readonly maxFeePerGas = computed(() => {
      return this.contractResult.value?.max_fee_per_gas
          ? Number(filter0x(this.contractResult.value?.max_fee_per_gas))
          : null
    })

    public readonly maxPriorityFeePerGas = computed(() => {
      return this.contractResult.value?.max_priority_fee_per_gas
          ? Number(filter0x(this.contractResult.value?.max_priority_fee_per_gas))
          : null
    })

    public errorMessage = computed(
        () => decodeSolidityErrorMessage(this.contractResult.value?.error_message ?? null))

    public ethereumNonce = computed(
        () => this.contractResult.value?.nonce ?? null)

    public readonly contractType = computed(() => {
        let result: string|null
        const typeValue = this.contractResult.value?.type ?? null
        switch(typeValue) {
            case null:
                result = null
                break
            case 0:
                result = "Pre-Eip1559"
                break
            case 2:
                result = "Post-Eip1559"
                break
            default:
                result = typeValue.toString()
                break
        }
        return result
    })

    //
    // Private
    //

    private readonly input = computed(
        () => this.contractResult.value?.function_parameters ?? null)

    private readonly output = computed(
        () => this.contractResult.value?.call_result ?? null)

    private readonly error = computed(
        () => this.contractResult.value?.error_message ?? null)

    private readonly updateContractResult = async () => {
        if (this.timestamp.value !== null) {
            try {
                this.contractResult.value = await ContractResultByTsCache.instance.lookup(this.timestamp.value)
                await this.updateFromId()
                await this.updateToId()
            } catch {
                this.contractResult.value = null
            }
        } else {
            this.contractResult.value = null
        }
    }

    private readonly updateFromId = async () => {
        if (this.contractResult.value !== null) {
            if (this.contractResult.value.from !== null) {
                const entityID = EntityID.fromAddress(this.contractResult.value.from)
                this.fromId.value = entityID?.toString() ?? null
            } else {
                this.fromId.value = null
            }
        } else {
            this.fromId.value = null
        }
    }

    private readonly updateToId = async () => {
        if (this.contractResult.value !== null) {
            if (this.contractResult.value.contract_id !== null) {
                // Target contract id is specified in contract result
                this.toId.value = this.contractResult.value.contract_id
            } else if (this.contractResult.value.to !== null) {
                // Contract result does not specifies contract id but contract address
                // => we must fetch contract by address and get its contract id
                const contractResponse = await ContractByAddressCache.instance.lookup(this.contractResult.value.to)
                this.toId.value = contractResponse?.contract_id ?? null
            } else {
                // Emergency code
                this.toId.value = null
            }
        } else {
            this.toId.value = null
        }
    }
}

function filter0x(value: string|null|undefined): string|null|undefined {
    return value === '0x' ? '0' : value
}
