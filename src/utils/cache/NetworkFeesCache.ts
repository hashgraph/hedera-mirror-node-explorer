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

import axios from "axios";
import {EntityCache, EntityLookup} from "@/utils/cache/base/EntityCache";
import {NetworkFeesResponse, TransactionType} from "@/schemas/MirrorNodeSchemas";

export class NetworkFeesCache extends EntityCache<string, NetworkFeesResponse> {

    public static readonly instance = new NetworkFeesCache()

    public static lookupTransactionType(lookup: EntityLookup<string, NetworkFeesResponse>, txType: TransactionType): number | null {
        let result: number | null = null
        let type: string
        switch (txType) {
            case TransactionType.CONTRACTCREATEINSTANCE:
                type = "ContractCreate"
                break
            case TransactionType.CONTRACTCALL:
                type = "ContractCall"
                break
            case TransactionType.ETHEREUMTRANSACTION:
            default:
                type = "EthereumTransaction"
                break
        }
        const networkFees = lookup.entity.value?.fees ?? []
        for (const fee of networkFees) {
            if (fee.transaction_type === type) {
                result = fee.gas
                break
            }
        }
        return result
    }

    //
    // Cache
    //

    protected async load(timestamp: string): Promise<NetworkFeesResponse> {
        const parameters = timestamp != "0" ? {timestamp: timestamp} : {}
        const result = await axios.get<NetworkFeesResponse>(
            'api/v1/network/fees',
            {params: parameters}
        )
        return Promise.resolve(result.data)
    }

}
