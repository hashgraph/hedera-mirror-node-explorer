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

import {computed, ref, watch} from "vue";
import {ethers} from "ethers";
import {AppStorage} from "@/AppStorage";
import {ContractCallRequest, ContractCallResponse} from "@/schemas/HederaSchemas";
import {ContractAnalyzer} from "@/utils/analyzer/ContractAnalyzer";
import {walletManager} from "@/router";
import axios from "axios";

export class ContractCallBuilder {

    public readonly fragment: ethers.FunctionFragment
    public readonly contractAnalyzer: ContractAnalyzer
    public readonly paramBuilders: ContractParamBuilder[]

    public readonly lastValue = ref<ethers.Result | null>(null)
    public readonly lastError = ref<unknown | null>(null)

    //
    // Public
    //

    public constructor(fragment: ethers.FunctionFragment, contractAnalyzer: ContractAnalyzer) {
        this.fragment = fragment
        this.contractAnalyzer = contractAnalyzer
        this.paramBuilders = []
        for (const i of this.fragment.inputs) {
            this.paramBuilders.push(new ContractParamBuilder(i, this))
        }
    }

    public readonly functionData = computed(() => {
        let paramDataList: unknown[] = []
        for (const b of this.paramBuilders) {
            const paramData = b.paramData.value
            if (paramData !== null) {
                paramDataList.push(paramData)
            }
        }

        let result: string | null
        const paramOK = paramDataList.length == this.paramBuilders.length
        const itf = this.contractAnalyzer.interface.value
        if (itf !== null && paramOK) {
            try {
                result = itf.encodeFunctionData(this.fragment, paramDataList)
            } catch {
                result = null
            }
        } else {
            result = null
        }
        return result
    })

    public readonly isGetter =
        () => this.fragment.stateMutability == "view"
            && this.fragment.inputs.length == 0
            && this.fragment.outputs.length >= 1

    public readonly isReadOnly =
        () => this.fragment.stateMutability == "view"
            || this.fragment.stateMutability == "pure"

    public readonly hasResult =
        () => this.fragment.outputs.length >= 1

    public readonly callOutput = computed(() => {
        let result: string
        const lastValue = this.lastValue.value
        const lastError = this.lastError.value
        if (lastError !== null) {
            result = lastError?.toString() ?? "Undefined error"
        } else if (lastValue !== null) {
            try {
                result = JSON.stringify(lastValue.length == 1 ? lastValue[0] : lastValue)
            } catch {
                result = lastValue.toString()
            }
        } else {
            result = " "
        }
        return result
    })

    public async execute(): Promise<void> {
        const contractId = this.contractAnalyzer.contractId.value
        const contractAddress = this.contractAnalyzer.contractAddress.value
        const itf = this.contractAnalyzer.interface.value
        const functionData = this.functionData.value
        if (contractId !== null && contractAddress !== null && itf !== null && functionData !== null) {
            try {
                let response: string | null
                if (this.isReadOnly()) {
                    response = await ContractCallBuilder.executeWithMirrorNode(contractAddress, functionData)
                } else {
                    response = await ContractCallBuilder.executeWithWallet(contractId, contractAddress, functionData)
                }
                this.lastValue.value = response !== null ? itf.decodeFunctionResult(this.fragment, response) : null
                this.lastError.value = null
            } catch (reason) {
                this.lastValue.value = null
                this.lastError.value = reason
            }
        } else {
            this.lastValue.value = null
            this.lastError.value = null
        }
        return Promise.resolve()
    }

    public saveInputParams() {
        for (const b of this.paramBuilders) {
            if (b.paramData.value) {
                AppStorage.setInputParam(b.paramData.value, this.fragment.selector, b.paramType.name)
            }
        }
    }

    //
    // Private
    //

    private static async executeWithMirrorNode(contractAddress: string, functionData: string): Promise<string> {
        const url = "api/v1/contracts/call"
        const body: ContractCallRequest = {
            data: functionData,
            to: contractAddress,
        }
        const response = await axios.post<ContractCallResponse>(url, body)
        return response.data.result
    }


    private static async executeWithWallet(contractId: string, contractAddress: string, functionData: string): Promise<string | null> {
        const callResult = await walletManager.callContract(contractId, contractAddress, functionData)
        return typeof callResult == "string" ? null : callResult.call_result
    }

}

export class ContractParamBuilder {

    public readonly paramType: ethers.ParamType
    public readonly callBuilder: ContractCallBuilder
    public readonly paramData = ref<unknown | null>(null)
    public readonly encodingError = ref<unknown | null>(null)

    public constructor(paramType: ethers.ParamType, callBuilder: ContractCallBuilder) {
        this.paramType = paramType
        this.callBuilder = callBuilder
        watch(this.paramData, this.updateEncodingError)
    }

    private readonly updateEncodingError = () => {
        if (this.paramData.value !== null) {
            try {
                ethers.AbiCoder.defaultAbiCoder().encode([this.paramType], [this.paramData.value])
                this.encodingError.value = null
            } catch (reason) {
                this.encodingError.value = reason
            }
        } else {
            this.encodingError.value = null
        }
    }
}