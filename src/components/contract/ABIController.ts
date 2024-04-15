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
import {ethers} from "ethers";
import {ABIAnalyzer} from "@/utils/analyzer/ABIAnalyzer";

export class ABIController {

    public readonly abiAnalyzer: ABIAnalyzer
    private readonly mode: Ref<ABIMode>

    //
    // Public
    //

    public constructor(abiAnalyzer: ABIAnalyzer, mode: Ref<ABIMode>) {
        this.abiAnalyzer = abiAnalyzer
        this.mode = mode
    }

    public readonly logicModeAvailable = computed(
        () => this.abiAnalyzer.logicInterface.value !== null)

    public readonly targetInterface = computed(() => {
        let result: ethers.Interface|null
        switch(this.mode.value) {
            case ABIMode.Normal:
                result = this.abiAnalyzer.contractAnalyzer.interface.value
                break
            case ABIMode.Logic:
                result = this.abiAnalyzer.logicInterface.value
                break
            default:
                result = null
                break
        }
        return result
    })

    public readonly targetContractName = computed(() => {
        let result: string|null
        switch(this.mode.value) {
            case ABIMode.Normal:
                result = this.abiAnalyzer.contractAnalyzer.contractName.value
                break
            case ABIMode.Logic:
                result = this.abiAnalyzer.logicContractName.value
                break
            default:
                result = null
                break
        }
        return result
    })

}

export enum ABIMode {
    Normal= "normal",
    Logic = "logic",
}