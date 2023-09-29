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

import {computed, ComputedRef, Ref, shallowRef, watch, WatchStopHandle} from "vue";
import {ContractResultLog} from "@/schemas/HederaSchemas";
import {ContractAnalyzer} from "@/utils/analyzer/ContractAnalyzer";
import {ethers} from "ethers";
import {NameTypeValue} from "@/utils/analyzer/FunctionCallAnalyzer";

export class ContractLogAnalyzer {

    public readonly log: Ref<ContractResultLog|null>
    private readonly contractAnalyzer: ContractAnalyzer
    private readonly logDescription = shallowRef<ethers.utils.LogDescription|null>(null)
    private watchHandle: WatchStopHandle|null = null

    //
    // Public
    //

    public constructor(log: Ref<ContractResultLog|null>) {
        this.log = log
        this.contractAnalyzer = new ContractAnalyzer(computed(() => log.value?.contract_id ?? null))
    }

    public mount(): void {
        this.watchHandle = watch([
            this.log,
            this.contractAnalyzer.interface
        ], this.updateLogDescription, { immediate: true})
        this.contractAnalyzer.mount()
    }

    public unmount(): void {
        this.contractAnalyzer.unmount()
        if (this.watchHandle !== null) {
            this.watchHandle()
            this.watchHandle = null
        }
        this.logDescription.value = null
    }

    public readonly signature = computed(
        () => this.logDescription.value?.signature ?? null)

    public readonly args: ComputedRef<NameTypeValue[]> = computed(() => {
        const result: NameTypeValue[] = []
        if (this.logDescription.value) {
            const args = this.logDescription.value.args
            const fragmentInputs = this.logDescription.value.eventFragment.inputs
            for (let i = 0; i < args.length; i+= 1) {
                const value = args[i]
                const name = i < fragmentInputs.length ? fragmentInputs[i].name : "?"
                const type = i < fragmentInputs.length ? fragmentInputs[i].type : "?"
                result.push(new NameTypeValue(name, type, value))
            }
        }
        return result
    })

    //
    // Private
    //

    private readonly updateLogDescription = () => {
        const i = this.contractAnalyzer.interface.value
        const l = this.log.value
        if (i !== null && l !== null && l.topics && l.data) {
            try {
                this.logDescription.value = i.parseLog({topics: l.topics, data: l.data})
            } catch {
                this.logDescription.value = null
            }
        } else {
            this.logDescription.value = null
        }
    }

}
