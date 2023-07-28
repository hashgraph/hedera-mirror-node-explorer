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
import {Transaction, TransactionByIdResponse} from "@/schemas/HederaSchemas";
import axios from "axios";

export class TransactionByHashCache extends EntityCache<string, Transaction|null> {

    public static readonly instance = new TransactionByHashCache()

    //
    // Public
    //

    public updateWithTransactions(transactions: Transaction[]): void {
        for (const t of transactions) {
            this.updateWithTransaction(t)
        }
    }

    public updateWithTransaction(transaction: Transaction): void {
        if (transaction.transaction_hash) {
            this.forget(transaction.transaction_hash)
            this.mutate(transaction.transaction_hash, Promise.resolve(transaction))
        }
    }

    //
    // Cache
    //

    protected async load(transactionHash: string): Promise<Transaction|null> {
        let result: Promise<Transaction|null>
        try {
            const response = await axios.get<TransactionByIdResponse>("api/v1/transactions/" + transactionHash)
            const transactions = response.data?.transactions ?? []
            result = Promise.resolve(transactions.length >= 1 ? transactions[0] : null)
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

