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

import {EntityCache} from "@/utils/cache/base/EntityCache"
import {BlockByNbCache} from "@/utils/cache/BlockByNbCache";
import {Transaction, TransactionResponse} from "@/schemas/HederaSchemas";
import axios from "axios";
import {TransactionByHashCache} from "@/utils/cache/TransactionByHashCache";
import {TransactionByTsCache} from "@/utils/cache/TransactionByTsCache";

import {drainTransactions} from "@/schemas/HederaUtils";

export class TransactionGroupByBlockCache extends EntityCache<number, Transaction[] | null> {

    public static readonly instance = new TransactionGroupByBlockCache()

    //
    // Cache
    //

    protected async load(blockNb: number): Promise<Transaction[] | null> {
        let result: Transaction[] | null
        try {
            const block = await BlockByNbCache.instance.lookup(blockNb)
            if (block?.timestamp?.to && block?.count) {
                const params = {
                    limit: Math.min(block.count, 100),
                    timestamp: "lte:" + block.timestamp.to
                }
                const response = await axios.get<TransactionResponse>("api/v1/transactions", {params: params})
                result = await drainTransactions(response.data, params.limit)
                TransactionByHashCache.instance.updateWithTransactions(result)
                TransactionByTsCache.instance.updateWithTransactions(result)
            } else {
                result = null
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status == 404) {
                result = null
            } else {
                throw error
            }
        }

        return Promise.resolve(result)
    }
}

