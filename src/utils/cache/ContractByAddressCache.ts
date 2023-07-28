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

import {ContractResponse} from "@/schemas/HederaSchemas";
import {EntityCache} from "@/utils/cache/base/EntityCache";
import axios from "axios";
import {ContractByIdCache} from "@/utils/cache/ContractByIdCache";

export class ContractByAddressCache extends EntityCache<string, ContractResponse|null> {

    public static readonly instance = new ContractByAddressCache()

    //
    // Public
    //

    public updateWithContractResponse(contractResponse: ContractResponse): void {
        if (contractResponse.evm_address) {
            this.forget(contractResponse.evm_address)
            this.mutate(contractResponse.evm_address, Promise.resolve(contractResponse))
        }
    }

    //
    // Cache
    //

    protected async load(address: string): Promise<ContractResponse | null> {
        let result: Promise<ContractResponse|null>
        try {
            const response = await axios.get<ContractResponse>("api/v1/contracts/" + address)
            result = Promise.resolve(response.data)
            ContractByIdCache.instance.updateWithContractResponse(response.data)
        } catch(error) {
            if (axios.isAxiosError(error) && error.response?.status == 404) {
                result = Promise.resolve(null)
            } else {
                throw error
            }
        }
        return result
    }
}
