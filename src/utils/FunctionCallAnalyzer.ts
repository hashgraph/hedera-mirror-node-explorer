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
import {ethers} from "ethers";
import {ContractAnalyzer} from "@/utils/ContractAnalyzer";

export class FunctionCallAnalyzer {

    public readonly input: Ref<string|null>
    public readonly output: Ref<string|null>
    private readonly contractAnalyzer: ContractAnalyzer
    private readonly transactionDescription = ref<ethers.utils.TransactionDescription|null>(null)
    private readonly watchHandle: Ref<WatchStopHandle|null> = ref(null)

    //
    // Public
    //

    public constructor(input: Ref<string|null>, output: Ref<string|null>, contractId: Ref<string|null>) {
        this.input = input
        this.output = output
        this.contractAnalyzer = new ContractAnalyzer(contractId)
    }

    public mount(): void {
        this.watchHandle.value = watch(
            [this.input, this.contractAnalyzer.interface],
            this.updateTransactionDescription,
            { immediate: true})
        this.contractAnalyzer.mount()
    }

    public unmount(): void {
        this.contractAnalyzer.unmount()
        if (this.watchHandle.value !== null) {
            this.watchHandle.value()
            this.watchHandle.value = null
        }
        this.transactionDescription.value = null
    }

    public readonly functionHash: ComputedRef<string|null> = computed(() => {
        return this.transactionDescription.value?.sighash ?? null
    })

    public readonly signature: ComputedRef<string|null> = computed(() => {
        return this.transactionDescription.value?.signature ?? null
    })

    public readonly inputs: ComputedRef<NameTypeValue[]> = computed(() => {
        const result: NameTypeValue[] = []
        if (this.transactionDescription.value) {
            const args = this.transactionDescription.value.args
            const fragmentInputs = this.transactionDescription.value.functionFragment.inputs
            for (let i = 0, count = args.length; i < count; i += 1) {
                const value = args[i]
                const name = i < fragmentInputs.length ? fragmentInputs[i].name : "?"
                const type = i < fragmentInputs.length ? fragmentInputs[i].type : "?"
                result.push(new NameTypeValue(name, type, value))
            }
        }
        return result
    })

    public readonly outputs: ComputedRef<NameTypeValue[]> = computed(() => {
        const result: NameTypeValue[] = []
        if (this.decodedFunctionResult.value) {
            const results = this.decodedFunctionResult.value
            const fragmentOutputs = this.transactionDescription.value?.functionFragment.outputs ?? []
            for (let i = 0, count = results.length; i < count; i += 1) {
                const value = results[i]
                const name = i < fragmentOutputs.length ? fragmentOutputs[i].name : "?"
                const type = i < fragmentOutputs.length ? fragmentOutputs[i].type : "?"
                result.push(new NameTypeValue(name, type, value))
            }
        }
        return result
    })

    public readonly decodedFunctionResult: ComputedRef<ethers.utils.Result|null> = computed(() => {
        let result: ethers.utils.Result|null
        const td = this.transactionDescription.value
        const i = this.contractAnalyzer.interface.value
        const output = this.output.value
        if (td !== null && i !== null && output !== null) {
            result = i.decodeFunctionResult(td.functionFragment, output)
        } else {
            result = null
        }
        return result
    })

    //
    // Private
    //

    private readonly updateTransactionDescription = async () => {
        const i = this.contractAnalyzer.interface.value
        const input = this.input.value
        if (i !== null && input !== null) {
            const td = i.parseTransaction({data: input})
            this.transactionDescription.value = Object.preventExtensions(td) // Because ethers does not like Ref introspection
        } else {
            this.transactionDescription.value = null
        }
    }

}

export class NameTypeValue {
    public readonly name: string
    public readonly type: string
    public readonly value: unknown
    public constructor(name: string, type: string, value: unknown) {
        this.name = name
        this.type = type
        this.value = value
    }
}
