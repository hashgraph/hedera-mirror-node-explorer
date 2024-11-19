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

import {computed, ref, Ref, watch, WatchStopHandle} from "vue";
import {ContractAction, ResultDataType} from "@/schemas/MirrorNodeSchemas";
import {FunctionCallAnalyzer} from "@/utils/analyzer/FunctionCallAnalyzer";
import {AccountByAddressCache} from "@/utils/cache/AccountByAddressCache";
import {systemContractRegistry} from "@/schemas/SystemContractRegistry";

export class ContractActionAnalyzer {

    public readonly action: Ref<ContractAction | null>
    public readonly functionCallAnalyzer: FunctionCallAnalyzer
    public readonly toId: Ref<string | null> = ref(null)
    public readonly fromId: Ref<string | null> = ref(null)
    private readonly watchHandle: Ref<WatchStopHandle[]> = ref([])

    //
    // Public
    //

    public constructor(action: Ref<ContractAction | null>) {
        this.action = action
        this.functionCallAnalyzer = new FunctionCallAnalyzer(this.input, this.output, this.error, this.contractId)
    }

    public mount(): void {
        this.watchHandle.value = [
            watch(this.action, this.actionDidChange, {immediate: true}),
        ]
        this.functionCallAnalyzer.mount()
    }

    public unmount(): void {
        this.functionCallAnalyzer.unmount()
        for (const wh of this.watchHandle.value) {
            wh()
        }
        this.functionCallAnalyzer.unmount()
        this.toId.value = null
        this.fromId.value = null
    }

    //
    // Private
    //

    private readonly actionDidChange = async () => {

        // fromId
        try {
            if (this.action.value?.caller) { // We have the entity id :)
                this.fromId.value = this.action.value.caller
            } else if (this.action.value?.from) { // We have evm address only :|
                const r = await AccountByAddressCache.instance.lookup(this.action.value.from)
                this.fromId.value = r?.account ?? null
            } else { // We have nothing :(
                this.fromId.value = null
            }
        } catch {
            this.fromId.value = null
        }

        // toId
        try {
            if (this.action.value?.recipient) { // We have the entity id :)
                this.toId.value = this.action.value?.recipient
            } else if (this.action.value?.to) { // We have evm address only :|
                // => if it's a system contract, then id is computed
                // => else we must fetch contract by address and get its contract id
                const systemContractEntry = systemContractRegistry.lookupByAddress(this.action.value.to)
                if (systemContractEntry !== null) {
                    this.toId.value = systemContractEntry.contractId
                } else {
                    const r = await AccountByAddressCache.instance.lookup(this.action.value.to)
                    this.toId.value = r?.account ?? null
                }
            } else { // We have nothing :(
                this.toId.value = null
            }
        } catch {
            this.toId.value = null
        }

    }

    private readonly contractId = computed(() => this.action.value?.recipient ?? null)

    private readonly input = computed(() => this.action.value?.input ?? null)

    private readonly output = computed(() => {
        let result: string | null
        if (this.action?.value?.result_data_type == ResultDataType.OUTPUT) {
            result = this.action.value.result_data ?? null
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
