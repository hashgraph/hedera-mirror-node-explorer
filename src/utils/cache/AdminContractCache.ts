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

import {EntityCache} from "@/utils/cache/base/EntityCache";
import {ContractResponse} from "@/schemas/MirrorNodeSchemas";
import {ContractByAddressCache} from "@/utils/cache/ContractByAddressCache";
import {LogicContractCache} from "@/utils/cache/LogicContractCache";

export class AdminContractCache extends EntityCache<string, ContractResponse|null> {

    public static readonly instance = new AdminContractCache()


    //
    // Cache
    //

    protected async load(contractId: string): Promise<ContractResponse|null> {
        let result: ContractResponse|null

        // See https://eips.ethereum.org/EIPS/eip-1967
        const adminContractSlotAddress = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"
        const logicContractAddress = await LogicContractCache.fetchContractAddress(contractId, adminContractSlotAddress)
        if (logicContractAddress !== null) {
            result = await ContractByAddressCache.instance.lookup(logicContractAddress)
        } else {
            result = null
        }
        return Promise.resolve(result)
    }

}
