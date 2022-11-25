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

import {computed, ComputedRef, ref, Ref, watch, WatchStopHandle} from "vue";
import {SystemContractEntry, systemContractRegistry} from "@/schemas/SystemContractRegistry";
import {ethers} from "ethers";

export class FunctionCallAnalyzer {

    public readonly input: Ref<string|null>
    public readonly output: Ref<string|null>
    public readonly contractId: Ref<string|null>
    private readonly watchHandles: WatchStopHandle[] = []
    private readonly transactionDescription = ref<ethers.utils.TransactionDescription|null>(null)
    private readonly decodedFunctionResult = ref<ethers.utils.Result|null>(null)

    //
    // Public
    //

    public constructor(input: Ref<string|null>, output: Ref<string|null>, contractId: Ref<string|null>) {
        this.input = input
        this.output = output
        this.contractId = contractId
    }

    public mount(): void {
        this.watchHandles.push(
            watch([this.input, this.contractId], this.updateTransactionDescription, { immediate: true}),
            watch([this.output, this.transactionDescription], this.updateDecodedFunctionResult, { immediate: true}),
        )
    }

    public unmount(): void {
        for (const wh of this.watchHandles) {
            wh()
        }
        this.watchHandles.splice(0, this.watchHandles.length)
        this.transactionDescription.value = null
        this.decodedFunctionResult.value = null
    }

    public readonly functionHash: ComputedRef<string|null> = computed(() => {
        return this.transactionDescription.value?.sighash ?? null
    })

    public readonly signature: ComputedRef<string|null> = computed(() => {
        return this.transactionDescription.value?.signature ?? null
    })

    public readonly inputValues: ComputedRef<string[]> = computed(() => {
        const result: string[] = []
        if (this.transactionDescription.value) {
            for (const a of this.transactionDescription.value.args.values()) {
                result.push(JSON.stringify(a))
            }
        }
        return result
    })

    public readonly inputNames: ComputedRef<string[]> = computed(() => {
        const result: string[] = []
        if (this.transactionDescription.value) {
            for (const i of this.transactionDescription.value.functionFragment.inputs.values()) {
                result.push(i.name)
            }
        }
        return result
    })

    public readonly inputTypes: ComputedRef<string[]> = computed(() => {
        const result: string[] = []
        if (this.transactionDescription.value) {
            for (const i of this.transactionDescription.value.functionFragment.inputs.values()) {
                result.push(i.type)
            }
        }
        return result
    })

    public readonly outputValues: ComputedRef<string[]> = computed(() => {
        const result: string[] = []
        if (this.decodedFunctionResult.value) {
            for (const a of this.decodedFunctionResult.value.values()) {
                result.push(JSON.stringify(a))
            }
        }
        return result
    })

    public readonly outputNames: ComputedRef<string[]> = computed(() => {
        const result: string[] = []
        const fragmentOutputs = this.transactionDescription.value?.functionFragment.outputs
        if (fragmentOutputs) {
            for (const o of fragmentOutputs.values()) {
                result.push(o.name)
            }
        }
        return result
    })

    public readonly outputTypes: ComputedRef<string[]> = computed(() => {
        const result: string[] = []
        const fragmentOutputs = this.transactionDescription.value?.functionFragment.outputs
        if (fragmentOutputs) {
            for (const o of fragmentOutputs.values()) {
                result.push(o.type)
            }
        }
        return result
    })


    //
    // Private
    //

    private readonly systemContractEntry: ComputedRef<SystemContractEntry|null> = computed(() => {
        return this.contractId.value ? systemContractRegistry.lookup(this.contractId.value) : null
    })

    private readonly updateTransactionDescription = () => {
        if (this.systemContractEntry.value !== null && this.input.value !== null) {
            this.systemContractEntry.value.parseTransaction(this.input.value)
                .then((d: ethers.utils.TransactionDescription|null) => {
                    this.transactionDescription.value = d
                })
                .catch((error) => {
                    console.log("error=" + error)
                    this.transactionDescription.value = null
                })
        } else {
            this.transactionDescription.value = null
        }
    }

    private readonly updateDecodedFunctionResult = () => {
        if (this.systemContractEntry.value !== null && this.transactionDescription.value !== null && this.output.value !== null) {
            const functionFragment = this.transactionDescription.value.functionFragment
            this.systemContractEntry.value?.decodeFunctionResult(functionFragment, this.output.value)
                .then((result: ethers.utils.Result|null) => {
                    this.decodedFunctionResult.value = result
                })
                .catch(() => {
                    this.decodedFunctionResult.value = null
                })
        } else {
            this.decodedFunctionResult.value = null
        }
    }

}