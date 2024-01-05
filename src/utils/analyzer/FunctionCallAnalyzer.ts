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
    private readonly transactionDescription = ref<ethers.TransactionDescription|null>(null)
    private readonly transactionDecodingFailure = ref<unknown>(null)
    private readonly outputResult = ref<ethers.Result|null>(null)
    private readonly outputDecodingFailure = ref<unknown>(null)
    private readonly errorDescription = ref<ethers.ErrorDescription|null>(null) // Where is ethers.utils.ErrorDescription ?
    private readonly errorDecodingFailure = ref<unknown>(null)
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
            watch([this.output, this.transactionDescription], this.updateOutputResult, { immediate: true}),
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
        this.transactionDecodingFailure.value = null
        this.outputResult.value = null
        this.outputDecodingFailure.value = null
        this.errorDescription.value = null
        this.errorDecodingFailure.value = null
    }

    public readonly normalizedInput: ComputedRef<string|null> = computed(() => {
        return this.input.value == "0x" ? null : this.input.value
    })

    public readonly normalizedOutput: ComputedRef<string|null> = computed(() => {
        return this.output.value == "0x" ? null : this.output.value
    })

    public readonly normalizedError: ComputedRef<string|null> = computed(() => {
        return this.error.value == "0x" ? null : this.error.value
    })

    public readonly functionHash: ComputedRef<string|null> = computed(() => {
        return this.transactionDescription.value?.selector ?? null
    })

    public readonly signature: ComputedRef<string|null> = computed(() => {
        return this.transactionDescription.value?.signature ?? null
    })

    public readonly errorSignature: ComputedRef<string|null> = computed(() => {
        return this.errorDescription.value?.signature ?? null
    })

    public readonly errorHash: ComputedRef<string|null> = computed(() => {
        return this.errorDescription.value?.selector ?? null
    })

    public readonly inputs: ComputedRef<NameTypeValue[]> = computed(() => {
        const result: NameTypeValue[] = []
        if (this.transactionDescription.value) {
            const args = this.transactionDescription.value.args
            const fragmentInputs = this.transactionDescription.value.fragment.inputs
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
        if (this.outputResult.value !== null) {
            const results = this.outputResult.value
            const fragmentOutputs = this.transactionDescription.value?.fragment.outputs ?? []
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
        if (this.errorDescription.value !== null) {
            const results = this.errorDescription.value.args
            const fragmentInputs = this.errorDescription.value?.fragment.inputs ?? []
            for (let i = 0, count = results.length; i < count; i += 1) {
                const value = results[i]
                const name = i < fragmentInputs.length ? fragmentInputs[i].name : "?"
                const type = i < fragmentInputs.length ? fragmentInputs[i].type : "?"
                result.push(new NameTypeValue(name, type, value))
            }
        }
        return result
    })

    public readonly inputDecodingStatus = computed(() => {
        let result: string|null
        if (this.transactionDecodingFailure.value !== null) {
            result = this.makeDecodingErrorMessage(this.transactionDecodingFailure.value)
        } else {
            result = null
        }
        return result
    })

    public readonly outputDecodingStatus = computed(() => {
        let result: string|null

        if (this.transactionDecodingFailure.value !== null && this.normalizedOutput.value !== null) {
            result = this.makeDecodingErrorMessage(this.transactionDecodingFailure.value)
        } else if (this.outputDecodingFailure.value !== null) {
            result = this.makeDecodingErrorMessage(this.outputDecodingFailure.value)
        } else {
            result = null
        }
        return result
    })

    public readonly errorDecodingStatus = computed(() => {
        let result: string|null
        if (this.errorDecodingFailure.value !== null) {
            result = this.makeDecodingErrorMessage(this.errorDecodingFailure.value)
        } else {
            result = null
        }
        return result
    })

    //
    // Private
    //

    private makeDecodingErrorMessage(failure: unknown): string {
        const f = failure as ethers.EthersError
        return "Decoding Error (" + f.shortMessage + ")"
    }

    private readonly updateTransactionDescription = async () => {
        const i = this.contractAnalyzer.interface.value
        const input = this.normalizedInput.value
        if (i !== null && input !== null) {
            try {
                const td = i.parseTransaction({data: input})
                this.transactionDescription.value = Object.preventExtensions(td) // Because ethers does not like Ref introspection
                this.transactionDecodingFailure.value = null
            } catch(failure) {
                this.transactionDescription.value = null
                this.transactionDecodingFailure.value = failure
            }
        } else {
            this.transactionDescription.value = null
            this.transactionDecodingFailure.value = null
        }
    }

    private readonly updateOutputResult = () => {
        const td = this.transactionDescription.value
        const i = this.contractAnalyzer.interface.value
        const output = this.normalizedOutput.value
        if (td !== null && i !== null && output !== null) {
            try {
                this.outputResult.value = i.decodeFunctionResult(td.fragment as ethers.FunctionFragment, output)
                this.outputDecodingFailure.value = null
            } catch(failure) {
                this.outputResult.value = null
                this.outputDecodingFailure.value = failure
            }
        } else {
            this.outputResult.value = null
            this.outputDecodingFailure.value = null
        }
    }

    private readonly updateErrorDescription = async() => {
        const i = this.contractAnalyzer.interface.value
        const error = this.normalizedError.value
        if (i !== null && error !== null && error !== "0x") {
            try {
                const ed = i.parseError(error)
                this.errorDescription.value = Object.preventExtensions(ed)
                this.errorDecodingFailure.value = null
            } catch(failure) {
                this.errorDescription.value = null
                this.errorDecodingFailure.value = failure
            }
        } else {
            this.errorDescription.value = null
            this.errorDecodingFailure.value = null
        }
    }

}

export class NameTypeValue {
    public readonly name: string
    public readonly type: string
    public readonly value: unknown
    public readonly indexed: boolean | null
    public constructor(name: string, type: string, value: unknown, indexed: boolean|null = null) {
        this.name = name
        this.type = type
        this.value = value
        this.indexed = indexed
    }
}
