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

import {computed, Ref} from "vue";
import {ContractAction, ResultDataType} from "@/schemas/HederaSchemas";
import {FunctionCallAnalyzer} from "@/utils/analyzer/FunctionCallAnalyzer";
import {decodeSolidityErrorMessage} from "@/schemas/HederaUtils";

export class ContractActionAnalyzer {

    public readonly action: Ref<ContractAction | undefined>
    public readonly functionCallAnalyzer: FunctionCallAnalyzer

    //
    // Public
    //

    public constructor(action: Ref<ContractAction | undefined>) {
        this.action = action
        this.functionCallAnalyzer = new FunctionCallAnalyzer(this.input, this.output, this.error, this.contractId)
    }

    public mount(): void {
        this.functionCallAnalyzer.mount()
    }

    public unmount(): void {
        this.functionCallAnalyzer.unmount()
    }

    public readonly errorMessage = computed(() => {
        let result: string | null
        if (this.action?.value?.result_data_type != ResultDataType.OUTPUT) {
            result = decodeSolidityErrorMessage(this.action?.value?.result_data ?? null)
        } else {
            result = null
        }
        return result
    })

    //
    // Private
    //

    private readonly contractId = computed(() => this.action.value?.recipient ?? null)

    private readonly input = computed(() => this.action.value?.input ?? null)

    private readonly output = computed(() => {
        let result: string | null
        if (this.action?.value?.result_data_type == ResultDataType.OUTPUT) {
            result = this.action?.value?.result_data ?? null
        } else {
            result = null
        }
        return result
    })

    public readonly error = computed(() => {
        let result: string | null
        if (this.action?.value?.result_data_type != ResultDataType.OUTPUT) {
            result = this.action?.value?.result_data ?? null
        } else {
            result = null
        }
        return result
    })
}
