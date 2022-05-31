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
import {TransactionID} from "@/utils/TransactionID";
import {DeferredPromise} from "@/utils/DeferredPromise";
import {EntityID} from "@/utils/EntityID";
import {aliasToBase32, byteToHex, hexToByte} from "@/utils/B64Utils";


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

        const entityID = EntityID.parse(this.searchedId, true)
        const normEntityID = entityID !== null ? entityID.toString() : null
        const transactionID = TransactionID.parse(this.searchedId)
        const normTransactionID = transactionID != null ? transactionID.toString(false) : null
        const hexBytes = hexToByte(this.searchedId)
        const hexByteString = (hexBytes !== null && hexBytes.length >= 15) ? byteToHex(hexBytes) : null
        const hexByteString32 = (hexBytes !== null && hexBytes.length >= 15) ? aliasToBase32(hexBytes) : null

        // 1) Searches accounts
        if (normEntityID !== null || hexByteString32 !== null) {
            const entityOrAlias = hexByteString32 ? hexByteString32 : normEntityID
            axios
                .get("api/v1/accounts/" + entityOrAlias)
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
        if (normTransactionID !== null) {
            axios
                .get("api/v1/transactions/" + normTransactionID)
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
        if (normEntityID !== null) {
            axios
                .get("api/v1/tokens/" + normEntityID)
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
        if (normEntityID !== null) {
            const params = {
                order: "desc",
                limit: "1"
            }
            axios
                .get("api/v1/topics/" + normEntityID + "/messages", {params})
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
        if (normEntityID !== null || hexByteString !== null) {
            const entityOrAddress = hexByteString ? hexByteString : normEntityID
            axios
                .get<ContractResponse>("api/v1/contracts/" + entityOrAddress)
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