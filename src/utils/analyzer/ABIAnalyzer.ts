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

import {ContractAnalyzer} from "@/utils/analyzer/ContractAnalyzer";
import {computed, ref, watch, WatchStopHandle} from "vue";
import {LogicContractCache} from "@/utils/cache/LogicContractCache";
import {ContractResponse} from "@/schemas/HederaSchemas";
import {AdminContractCache} from "@/utils/cache/AdminContractCache";

export class ABIAnalyzer {

    public readonly contractAnalyzer: ContractAnalyzer
    private readonly logicContractAnalyzer: ContractAnalyzer
    private readonly adminContractAnalyzer: ContractAnalyzer
    private readonly logicContractResponse = ref<ContractResponse|null>(null)
    private readonly adminContractResponse = ref<ContractResponse|null>(null)
    private watchHandle: WatchStopHandle|null = null

    //
    // Public
    //

    public constructor(contractAnalyzer: ContractAnalyzer) {
        this.contractAnalyzer = contractAnalyzer
        this.logicContractAnalyzer = new ContractAnalyzer(this.logicContractId)
        this.adminContractAnalyzer = new ContractAnalyzer(this.adminContractId)
    }

    public mount(): void {
        this.watchHandle = watch(this.contractAnalyzer.contractId, this.contractIdDidChange, {immediate: true})
        this.logicContractAnalyzer.mount()
        this.adminContractAnalyzer.mount()
    }

    public unmount(): void {
        this.logicContractAnalyzer.unmount()
        this.adminContractAnalyzer.unmount()
        if (this.watchHandle !== null) {
            this.watchHandle()
            this.watchHandle = null
        }
        this.logicContractResponse.value = null
        this.adminContractResponse.value = null
    }

    public readonly logicContractId
        = computed(() => this.logicContractResponse.value?.contract_id ?? null)

    public readonly adminContractId
        = computed(() => this.adminContractResponse.value?.contract_id ?? null)

    public readonly logicInterface
        = computed(() => this.logicContractAnalyzer.interface.value)

    public readonly logicContractName
        = computed(() => this.logicContractAnalyzer.contractName.value)

    //
    // Private
    //

    private contractIdDidChange = async () => {
        const contractId = this.contractAnalyzer.contractId.value
        if (contractId !== null) {
            this.logicContractResponse.value = await LogicContractCache.instance.lookup(contractId)
            this.adminContractResponse.value = await AdminContractCache.instance.lookup(contractId)
        } else {
            this.logicContractResponse.value = null
            this.adminContractResponse.value = null
        }
    }
}