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
import {ContractAnalyzer} from "@/utils/analyzer/ContractAnalyzer";

export class FunctionCallAnalyzer {

    public readonly input: Ref<string|null>
    public readonly output: Ref<string|null>
    public readonly error: Ref<string|null>
    private readonly contractAnalyzer: ContractAnalyzer
    private readonly transactionDescription = ref<ethers.utils.TransactionDescription|null>(null)
    private readonly errorDescription = ref<ErrorDescription|null>(null) // Where is ethers.utils.ErrorDescription ?
    private readonly watchHandle: Ref<WatchStopHandle[]> = ref([])

    //
    // Public
    //

    public constructor(input: Ref<string|null>, output: Ref<string|null>, error: Ref<string|null>, contractId: Ref<string|null>) {
        this.input = input
        this.output = output
        this.error = error
        this.contractAnalyzer = new ContractAnalyzer(contractId)
    }

    public mount(): void {
        this.watchHandle.value = [
            watch([this.input, this.contractAnalyzer.interface], this.updateTransactionDescription, { immediate: true}),
            watch([this.error, this.contractAnalyzer.interface], this.updateErrorDescription, { immediate: true})
        ]
        this.contractAnalyzer.mount()
    }

    public unmount(): void {
        this.contractAnalyzer.unmount()
        for (const wh of this.watchHandle.value) {
            wh()
        }
        this.watchHandle.value = []
        this.transactionDescription.value = null
    }

    public readonly functionHash: ComputedRef<string|null> = computed(() => {
        return this.transactionDescription.value?.sighash ?? null
    })

    public readonly signature: ComputedRef<string|null> = computed(() => {
        return this.transactionDescription.value?.signature ?? null
    })

    public readonly errorSignature: ComputedRef<string|null> = computed(() => {
        return this.errorDescription.value?.signature ?? null
    })

    public readonly errorHash: ComputedRef<string|null> = computed(() => {
        return this.errorDescription.value?.sighash ?? null
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

    public readonly errorInputs: ComputedRef<NameTypeValue[]> = computed(() => {
        const result: NameTypeValue[] = []
        if (this.decodedFunctionError.value !== null) {
            const results = this.decodedFunctionError.value
            const fragmentInputs = this.errorDescription.value?.errorFragment.inputs ?? []
            for (let i = 0, count = results.length; i < count; i += 1) {
                const value = results[i]
                const name = i < fragmentInputs.length ? fragmentInputs[i].name : "?"
                const type = i < fragmentInputs.length ? fragmentInputs[i].type : "?"
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
            try {
                result = i.decodeFunctionResult(td.functionFragment, output)
            } catch {
                result = null
            }
        } else {
            result = null
        }
        return result
    })

    public readonly decodedFunctionError: ComputedRef<ethers.utils.Result|null> = computed(() => {
        let result: ethers.utils.Result|null
        const d = this.errorDescription.value
        const i = this.contractAnalyzer.interface.value
        const error = this.error.value
        if (d !== null && i !== null && error !== null) {
            try {
                // result = i.decodeErrorResult(d.errorFragment, error)
                const bytes = ethers.utils.arrayify(error)
                result = ethers.utils.defaultAbiCoder.decode(d.errorFragment.inputs, bytes.slice(4))
            } catch {
                result = null
            }
        } else {
            result = null
        }
        return result
    })

    private readonly updateTransactionDescription = async () => {
        const i = this.contractAnalyzer.interface.value
        const input = this.input.value
        if (i !== null && input !== null) {
            try {
                const td = i.parseTransaction({data: input})
                this.transactionDescription.value = Object.preventExtensions(td) // Because ethers does not like Ref introspection
            } catch {
                this.transactionDescription.value = null
            }
        } else {
            this.transactionDescription.value = null
        }
    }

    private readonly updateErrorDescription = async() => {
        const i = this.contractAnalyzer.interface.value
        const error = this.error.value
        if (i !== null && error !== null) {
            try {
                const ed = i.parseError(error)
                this.errorDescription.value = Object.preventExtensions(ed)
            } catch(reason) {
                this.errorDescription.value = null
            }
        } else {
            this.errorDescription.value = null
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

export interface ErrorDescription {
    readonly errorFragment: ethers.utils.ErrorFragment
    readonly name: string
    readonly args: ethers.utils.Result
    readonly signature: string
    readonly sighash: string
}
