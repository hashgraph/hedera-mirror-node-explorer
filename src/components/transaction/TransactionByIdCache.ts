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

import {EntityCache} from "@/utils/EntityCache";
import {TransactionByIdResponse, TransactionResponse} from "@/schemas/HederaSchemas";
import axios, {AxiosResponse} from "axios";

export class TransactionByIdCache extends EntityCache<TransactionByIdResponse> {

    private transactionId: string|null = null
    private readonly limit: number

    //
    // Public
    //

    public constructor() {
        super(5000, 10)
        this.limit = 100
    }

    public setTransactionId(newValue: string|null): void {
        this.transactionId = newValue
        this.clear()
    }


    //
    // EntityCache
    //

    protected load(): Promise<AxiosResponse<TransactionByIdResponse>> {
        let result: Promise<AxiosResponse<TransactionByIdResponse>>
        if (this.transactionId !== null) {
            result = axios.get<TransactionResponse>("api/v1/transactions/" + this.transactionId )
        } else {
            result = Promise.reject("transactionId is null")
        }
        return result
    }
}
