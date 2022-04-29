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

import {
    AccountBalanceTransactions,
    ContractResponse,
    TokenInfo,
    TopicMessage,
    Transaction
} from "@/schemas/HederaSchemas";
import axios from "axios";
import {TransactionID, normalizeTransactionId} from "@/utils/TransactionID";
import {DeferredPromise} from "@/utils/DeferredPromise";
import {EntityID} from "@/utils/EntityID";


export class SearchRequest {

    public readonly searchedId: string
    public account: AccountBalanceTransactions|null = null
    public transactions = Array<Transaction>()
    public tokenInfo: TokenInfo|null = null
    public topicMessages = Array<TopicMessage>()
    public contract: ContractResponse|null = null

    private promise = new DeferredPromise<void>()
    private countdown = 0
    private errorCount = 0

    constructor(searchedId: string) {
        this.searchedId = searchedId
    }

    run(): Promise<void> {

        this.countdown = 5
        this.errorCount = 0

        const isEntityId = EntityID.parse(this.searchedId) != null
        const isTransactionId = TransactionID.parse(this.searchedId) != null

        // 1) Searches accounts
        if (isEntityId) {
            axios
                .get("api/v1/accounts/" + this.searchedId)
                .then(response => {
                    this.account = response.data
                })
                .catch((reason: unknown) => {
                    this.updateErrorCount(reason)
                    return null // To avoid console pollution
                })
                .finally(() => {
                    this.updatePromise()
                });
        } else {
            // No account will match => no need to call server
            this.updatePromise()
        }

        // 2) Searches transactions
        if (isTransactionId) {
            axios
                .get("api/v1/transactions/" + normalizeTransactionId(this.searchedId))
                .then(response => {
                    this.transactions = response.data.transactions
                })
                .catch((reason: unknown) => {
                    this.updateErrorCount(reason)
                    return null // To avoid console pollution
                })
                .finally(() => {
                    this.updatePromise()
                });
        } else {
            // No transaction will match => no need to call server
            this.updatePromise()
        }

        // 3) Searches tokens
        if (isEntityId) {
            axios
                .get("api/v1/tokens/" + this.searchedId)
                .then(response => {
                    this.tokenInfo = response.data
                })
                .catch((reason: unknown) => {
                    this.updateErrorCount(reason)
                    return null // To avoid console pollution
                })
                .finally(() => {
                    this.updatePromise()
                });
        } else {
            // No token will match => no need to call server
            this.updatePromise()
        }

        // 4) Searches topics
        if (isEntityId) {
            const params = {
                order: "desc",
                limit: "1"
            }
            axios
                .get("api/v1/topics/" + this.searchedId + "/messages", {params})
                .then(response => {
                    this.topicMessages = response.data.messages
                })
                .catch((reason: unknown) => {
                    this.updateErrorCount(reason)
                    return null // To avoid console pollution
                })
                .finally(() => {
                    this.updatePromise()
                });
        } else {
            // No topic will match => no need to call server
            this.updatePromise()
        }

        // 5) Searches contracts
        if (isEntityId) {
            axios
                .get<ContractResponse>("api/v1/contracts/" + this.searchedId)
                .then(response => {
                    this.contract = response.data
                })
                .catch((reason: unknown) => {
                    this.updateErrorCount(reason)
                    return null // To avoid console pollution
                })
                .finally(() => {
                    this.updatePromise()
                });
        } else {
            // No contract will match => no need to call server
            this.updatePromise()
        }

        return this.promise
    }

    getErrorCount(): number {
        return this.errorCount
    }


    //
    // Private
    //

    private updatePromise(): void {
        this.countdown -= 1
        if (this.countdown <= 0) {
            this.promise.resolveNow()
        }
    }

    private updateErrorCount(reason: unknown): void {
        const notFound = axios.isAxiosError(reason) && reason.request?.status == 404
        if (!notFound) {
            this.errorCount += 1
        }
    }
}