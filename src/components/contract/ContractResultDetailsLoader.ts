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

import {ContractResultDetails, ContractResultsResponse} from "@/schemas/HederaSchemas";
import {EntityLoader} from "@/utils/loader/EntityLoader";
import axios, {AxiosResponse} from "axios";
import {computed, Ref} from "vue";
import {EntityID} from "@/utils/EntityID";

export class ContractResultDetailsLoader extends EntityLoader<ContractResultDetails> {

    public readonly contractId: Ref<string|null>
    public readonly timestamp: Ref<string|null>
    public readonly transactionIdOrHash: Ref<string|null>

    //
    // Public
    //

    public constructor(contractIdOrAddress: Ref<string|null>,
                       timestamp: Ref<string|null>,
                       transactionIdOrHash: Ref<string|null>) {
        super()
        this.contractId = contractIdOrAddress
        this.timestamp = timestamp
        this.transactionIdOrHash = transactionIdOrHash
        this.watchAndReload([this.contractId, this.timestamp, this.transactionIdOrHash])
    }

    public readonly actualContractId = computed(() => {
        let result: string|null
        if (this.entity.value !== null) {
            const entityID = EntityID.fromAddress(this.entity.value?.to)
            result = entityID !== null ? entityID.toString() : null
        } else {
            result = null
        }
        return result
    })

    public functionParameters = computed(() => {
        return this.entity.value?.function_parameters ?? null
    })

    public callResult = computed(() => {
        return this.entity.value?.call_result ?? null
    })

    //
    // EntityLoader
    //

    protected async load(): Promise<AxiosResponse<ContractResultDetails> | null> {
        let result: Promise<AxiosResponse<ContractResultDetails> | null>
        let contractId = this.contractId.value

        if (contractId === null && this.timestamp.value !== null) {
            const parameters = {
                timestamp: this.timestamp.value,
                internal: true
            }
            const response = await axios.get<ContractResultsResponse>("api/v1/contracts/results", {params: parameters});
            if (response.data.results) {
                contractId = response.data.results[0].contract_id ?? null
            }
        }

        if (contractId !== null && this.timestamp.value !== null) {
            result = axios.get<ContractResultDetails>(
                "api/v1/contracts/" + contractId + "/results/" + this.timestamp.value);

        } else if (this.transactionIdOrHash.value !== null) {
            result = axios.get<ContractResultDetails>("api/v1/contracts/results/" + this.transactionIdOrHash.value);
        } else {
            result = Promise.resolve(null)
        }
        return result
    }
}
