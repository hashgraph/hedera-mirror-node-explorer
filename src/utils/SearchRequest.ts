/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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
    AccountInfo,
    AccountsResponse,
    Block,
    ContractResponse,
    TokenInfo,
    TopicMessage,
    TopicMessagesResponse,
    Transaction,
    TransactionByIdResponse, TransactionResponse
} from "@/schemas/HederaSchemas";
import axios from "axios";
import {TransactionID} from "@/utils/TransactionID";
import {DeferredPromise} from "@/utils/DeferredPromise";
import {EntityID} from "@/utils/EntityID";
import {aliasToBase32, base32ToAlias, byteToHex, hexToByte, paddedBytes} from "@/utils/B64Utils";
import {nameServiceResolve} from "@/utils/NameService";

export class SearchRequest {

    public readonly searchedId: string
    public account: AccountInfo|null = null
    public accountsWithKey = Array<AccountInfo>()
    public transactions = Array<Transaction>()
    public tokenInfo: TokenInfo|null = null
    public topicMessages = Array<TopicMessage>()
    public contract: ContractResponse|null = null
    public block: Block|null = null
    public ethereumAddress: string|null = null

    private promise = new DeferredPromise<void>()
    private countdown = 0
    private errorCount = 0

    constructor(searchedId: string) {
        this.searchedId = searchedId
    }

    run(): Promise<void> {

        this.countdown = 8
        this.errorCount = 0

        /*

        searchId syntax                      | Description      | Tentative searches
        =====================================+==================+======================================================
        shard.realm.num                      | Entity ID        | api/v1/accounts/{searchId}
                                             |                  | api/v1/contracts/{searchId}
                                             |                  | api/v1/tokens/{searchId}
                                             |                  | api/v1/topics/{searchId}/messages
        -------------------------------------+------------------+------------------------------------------------------
        integer (decimal notation)           | Incomplete       | api/v1/accounts/0.0.{searchId}
                                             | Entity ID        | api/v1/contracts/0.0.{searchId}
                                             |                  | api/v1/tokens/0.0.{searchId}
                                             |                  | api/v1/topics/0.0.{searchId}/messages
        -------------------------------------+------------------+------------------------------------------------------
        shard.realm.num@seconds.nanoseconds  | Transaction ID   | api/v1/transactions/normalize({searchId}
        -------------------------------------+------------------+------------------------------------------------------
        shard.realm.num-seconds-nanoseconds  | Transaction ID   | api/v1/transactions/{searchId}
                                             | (normalized)     |
        -------------------------------------+------------------+------------------------------------------------------
        hexadecimal 48 bytes                 | Transaction Hash | api/v1/transactions/{searchId}
        -------------------------------------+------------------+------------------------------------------------------
        hexadecimal 32/48 bytes              | Block Hash       | api/v1/blocks/{searchId}
        -------------------------------------+------------------+------------------------------------------------------
        hexadecimal 20 bytes                 | Ethereum Address | api/v1/accounts/{searchId}
                                             |                  | api/v1/contracts/{searchId}
                                             |                  | api/v1/token/ethereumToEntityID({searchId})
        -------------------------------------+------------------+------------------------------------------------------
        hexadecimal < 20 bytes               | Incomplete       | api/v1/accounts/padded({searchId})
                                             | Ethereum Address | api/v1/contracts/padded({searchId})
                                             |                  | api/v1/token/ethereumToEntityID(padded({searchId}))
        -------------------------------------+------------------+------------------------------------------------------
        hexadecimal 32/33 bytes              | Public Key       | api/v1/accounts/?account.publickey={searchId}
        -------------------------------------+------------------+------------------------------------------------------
        hexadecimal n bytes                  | Account Alias    | api/v1/accounts/base32({searchId})
                                             | in hex form      |
        -------------------------------------+------------------+------------------------------------------------------
        base32                               | Account Alias    | api/v1/accounts/{searchId}
        -------------------------------------+------------------+------------------------------------------------------

         */

        const entityID = EntityID.parse(this.searchedId, true)?.toString() ?? null
        const transactionID = TransactionID.parse(this.searchedId)?.toString(false) ?? null
        const hexBytes = hexToByte(this.searchedId)
        const base32 = base32ToAlias(this.searchedId)

        const blockHash = hexBytes !== null && (hexBytes.length === 48 || hexBytes.length === 32) ? byteToHex(hexBytes) : null
        const transactionHash = hexBytes !== null && hexBytes.length == 48 ? byteToHex(hexBytes) : null
        const transactionTimestamp = this.searchedId.match(/^\d{1,10}(\.\d{1,9})?$/) ? this.searchedId : null
        this.ethereumAddress = hexBytes !== null && (1 <= hexBytes.length && hexBytes.length <= 20)
                                ? byteToHex(paddedBytes(hexBytes, 20)) : null
        const publicKey = hexBytes !== null && (hexBytes.length == 32 || hexBytes.length == 33) ? byteToHex(hexBytes) : null
        const accountAlias = base32 !== null ? aliasToBase32(base32) : (hexBytes !== null ? aliasToBase32(hexBytes) : null)

        const accountParam = entityID ?? this.ethereumAddress ?? accountAlias
        const transactionParam = transactionID ?? transactionHash
        const tokenParam = entityID ?? EntityID.fromAddress(this.ethereumAddress ?? undefined)
        const contractParam = entityID ?? this.ethereumAddress

        // 1) Searches accounts
        if (accountParam !== null) {
            axios
                .get<AccountBalanceTransactions>("api/v1/accounts/" + accountParam)
                .then(response => {
                    this.account = response.data
                })
                .catch((reason: unknown) => {
                    this.updateErrorCount(reason)
                    return null // To avoid console pollution
                })
                .finally(() => {
                    this.updatePromise()
                })
        } else {
            // No account will match => no need to call server
            this.updatePromise()
        }

        // 2) Searches accounts with public key
        if (publicKey !== null) {
            axios
                .get<AccountsResponse>("api/v1/accounts/?account.publickey=" + publicKey + "&limit=2")
                .then(response => {
                    this.accountsWithKey = response.data.accounts ?? []
                })
                .catch((reason: unknown) => {
                    this.updateErrorCount(reason)
                    return null // To avoid console pollution
                })
                .finally(() => {
                    this.updatePromise()
                })
        } else {
            // No account will match => no need to call server
            this.updatePromise()
        }

        // 3) Searches transactions
        if (transactionParam !== null) {
            axios
                .get<TransactionByIdResponse>("api/v1/transactions/" + transactionParam)
                .then(response => {
                    this.transactions = response.data.transactions ?? []
                })
                .catch((reason: unknown) => {
                    this.updateErrorCount(reason)
                    return null // To avoid console pollution
                })
                .finally(() => {
                    this.updatePromise()
                });
        } else if (transactionTimestamp !== null) {
            axios
                .get<TransactionResponse>("api/v1/transactions?timestamp=" + transactionTimestamp)
                .then(response => {
                    this.transactions = response.data.transactions ?? []
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

        // 4) Searches tokens
        if (tokenParam !== null) {
            axios
                .get<TokenInfo>("api/v1/tokens/" + tokenParam)
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

        // 5) Searches topics
        if (entityID !== null) {
            const params = {
                order: "desc",
                limit: "1"
            }
            axios
                .get<TopicMessagesResponse>("api/v1/topics/" + entityID + "/messages", {params})
                .then(response => {
                    this.topicMessages = response.data.messages ?? []
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

        // 6) Searches contracts
        if (contractParam) {
            axios
                .get<ContractResponse>("api/v1/contracts/" + contractParam)
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

        // 7) Searches blocks
        if (blockHash) {
            axios
                .get<Block>("api/v1/blocks/" + blockHash)
                .then(response => {
                    this.block = response.data
                })
                .catch((reason: unknown) => {
                    this.updateErrorCount(reason)
                    return null // To avoid console pollution
                })
                .finally(() => {
                    this.updatePromise()
                });
        } else {
            // No block will match => no need to call server
            this.updatePromise()
        }

        // 8) Domain (via kabuto name service)
        if (/\.[a-z|ℏ]+$/.test(this.searchedId)) {
          nameServiceResolve(this.searchedId)
            .then(accountInfo => {
              if (accountInfo != null) {
                this.account = accountInfo;
              }
            })
            .catch((reason: unknown) => {
                this.updateErrorCount(reason)
                return null // To avoid console pollution
            })
            .finally(() => {
                this.updatePromise()
            })
        } else {
          // no domain will match without at least a `.`
          this.updatePromise();
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
        const notFound = axios.isAxiosError(reason) && reason.response?.status == 404
        if (!notFound) {
            this.errorCount += 1
        }
    }
}