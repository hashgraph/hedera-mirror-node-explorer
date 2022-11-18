/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2022 Hedera Hashgraph, LLC
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

import {EntityLoader} from "@/utils/loader/EntityLoader";
import {ContractResponse} from "@/schemas/HederaSchemas";
import {computed, Ref} from "vue";
import axios, {AxiosResponse} from "axios";

export class ContractLoader extends EntityLoader<ContractResponse> {

    private readonly contractLocator: Ref<string|null> // Contract Id or EVM Address

    //
    // Public
    //

    public constructor(contractLocator: Ref<string|null>) {
        super()
        this.contractLocator = contractLocator
        this.watchAndReload([this.contractLocator])
    }

    public readonly contractId = computed(() => {
        return this.entity.value?.contract_id ?? null
    })

    public readonly obtainerId = computed(() => {
        return this.entity.value?.obtainer_id ?? null
    })

    public readonly proxyAccountId = computed(() => {
        return this.entity.value?.proxy_account_id ?? null
    })

    //
    // EntityLoader
    //

    protected async load(): Promise<AxiosResponse<ContractResponse>|null> {
        let result: Promise<AxiosResponse<ContractResponse>|null>
        if (this.contractLocator.value != null) {
            result = axios.get<ContractResponse>("api/v1/contracts/" + this.contractLocator.value)
        } else {
            result = Promise.resolve(null)
        }
        return result
    }

}
