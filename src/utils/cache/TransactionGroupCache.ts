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

import {EntityCache} from "@/utils/cache/base/EntityCache"
import {TransactionByIdResponse, TransactionDetail} from "@/schemas/HederaSchemas";
import axios from "axios";

export class TransactionGroupCache extends EntityCache<string, TransactionDetail[]|null> {

    public static readonly instance = new TransactionGroupCache()

    //
    // Cache
    //

    protected async load(transactionId: string): Promise<TransactionDetail[]|null> {
        let result: TransactionDetail[]|null
        try {
            const response = await axios.get<TransactionByIdResponse>("api/v1/transactions/" + transactionId)
            result = response.data?.transactions ?? null
        } catch(error) {
            if (axios.isAxiosError(error) && error.response?.status == 404) {
                result = null
            } else {
                throw error
            }
        }

        return Promise.resolve(result)
    }
}

