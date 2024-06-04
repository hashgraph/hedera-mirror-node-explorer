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

import {
    AccountBalanceTransactions,
    AccountInfo,
    AccountsResponse,
    Block,
    ContractResponse,
    ContractResultDetails,
    TokenInfo,
    TopicMessage,
    TopicMessagesResponse,
    Transaction,
    TransactionByIdResponse,
    TransactionResponse
} from "@/schemas/HederaSchemas";
import axios from "axios";
import {TransactionID} from "@/utils/TransactionID";
import {EntityID} from "@/utils/EntityID";
import {aliasToBase32, base32ToAlias, byteToHex, hexToByte, paddedBytes} from "@/utils/B64Utils";
import {NameService} from "@/utils/name_service/NameService";
import {Timestamp} from "@/utils/Timestamp";
import {networkRegistry} from "@/schemas/NetworkRegistry";
import {routeManager} from "@/router";

export class SearchRequest {

    public readonly searchedId: string
    public account: AccountInfo | null = null
    public accountsWithKey = Array<AccountInfo>()
    public transactions = Array<Transaction>()
    public tokenInfo: TokenInfo | null = null
    public topicMessages = Array<TopicMessage>()
    public contract: ContractResponse | null = null
    public block: Block | null = null
    public ethereumAddress: string | null = null

    private errorCount = 0

    constructor(searchedId: string) {
        this.searchedId = searchedId
    }

    async run(): Promise<void> {

        /*

        searchId syntax                      | Description      | Tentative searches
        =====================================+==================+======================================================
        shard.realm.num[-checksum]           | Entity ID        | api/v1/accounts/{shard.realm.num}
                                             |                  | api/v1/contracts/{shard.realm.num}
                                             |                  | api/v1/tokens/{shard.realm.num}
                                             |                  | api/v1/topics/{shard.realm.num}/messages
        -------------------------------------+------------------+------------------------------------------------------
        integer[-checksum]                   | Incomplete       | api/v1/accounts/0.0.{integer}
                                             | Entity ID        | api/v1/contracts/0.0.{integer}
                                             |                  | api/v1/tokens/0.0.{integer}
                                             |                  | api/v1/topics/0.0.{integer}/messages
        -------------------------------------+------------------+------------------------------------------------------
        shard.realm.num@seconds.nanoseconds  | Transaction ID   | api/v1/transactions/normalize({searchId})
        -------------------------------------+------------------+------------------------------------------------------
        shard.realm.num@seconds              | Incomplete       | api/v1/transactions/normalize({searchId}.000000000)
                                             | Transaction ID   |
        -------------------------------------+------------------+------------------------------------------------------
        shard.realm.num-seconds-nanoseconds  | Transaction ID   | api/v1/transactions/{searchId}
                                             | (normalized)     |
        -------------------------------------+------------------+------------------------------------------------------
        hexadecimal 48 bytes                 | Hedera Hash      | api/v1/transactions/{searchId}
                                             |                  | api/v1/blocks/{searchId}
        -------------------------------------+------------------+------------------------------------------------------
        hexadecimal 32 bytes                 | EVM Hash         | api/v1/contracts/results/{searchId}
                                             |                  |  + api/v1/transactions/{result.timestamp}
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
        /\.[a-z|ℏ]+$/                        | Kabuto domain    | Kabuto API
                                             | HNS domain       | HNS API
        -------------------------------------+------------------+------------------------------------------------------

         */


        const entityID = EntityID.parseWithChecksum(this.searchedId, true)
        const transactionID = TransactionID.parse(this.searchedId, true)
        const hexBytes = hexToByte(this.searchedId)
        const alias = base32ToAlias(this.searchedId) != null ? this.searchedId : null
        const timestamp = Timestamp.parse(this.searchedId)
        const domainName = /\.[a-zA-Z|ℏ]+$/.test(this.searchedId) ? this.searchedId : null

        let promises: Promise<void>[]
        if (entityID !== null) {
            let safeEntityID: EntityID | null
            if (entityID.checksum !== null) {
                // Search string is an entity id with a checksum : we check it's valid
                const network = routeManager.currentNetwork.value
                if (networkRegistry.isValidChecksum(entityID.toString(), entityID.checksum, network)) {
                    safeEntityID = entityID.cloneWithoutChecksum()
                } else {
                    safeEntityID = null
                }
            } else {
                safeEntityID = entityID
            }
            if (safeEntityID !== null) {
                promises = [
                    this.searchAccount(safeEntityID),
                    this.searchContract(safeEntityID),
                    this.searchToken(safeEntityID),
                    this.searchTopic(safeEntityID)
                ]
            } else {
                promises = []
            }
        } else if (transactionID !== null) {
            promises = [
                this.searchTransaction(transactionID)
            ]
        } else if (hexBytes !== null) {
            switch (hexBytes.length) {
                case 48: // Hedera Hash for transaction or block
                    promises = [
                        this.searchTransaction(hexBytes),
                        this.searchBlock(hexBytes)
                    ]
                    break;
                case 32: // EVM Hash for transaction or block, or account public key
                    promises = [
                        this.searchTransaction(hexBytes),
                        this.searchBlock(hexBytes),
                        this.searchAccount(hexBytes)
                    ]
                    break;
                case 33: // Public key
                    promises = [
                        this.searchAccount(hexBytes)
                    ]
                    break;
                case 20: // EVM Address for account, contract or token
                    promises = [
                        this.searchAccount(hexBytes),
                        this.searchContract(hexBytes),
                        this.searchToken(hexBytes),
                    ]
                    this.ethereumAddress = "0x" + byteToHex(hexBytes)
                    break
                default:
                    promises = [
                        this.searchAccount(aliasToBase32(hexBytes))
                    ]
                    if (hexBytes.length < 20) { // Incomplete EVM Address
                        const evmAddress = paddedBytes(hexBytes, 20)
                        promises = promises.concat([
                            this.searchAccount(evmAddress),
                            this.searchContract(evmAddress),
                            this.searchToken(evmAddress),
                        ])
                        this.ethereumAddress = "0x" + byteToHex(evmAddress)
                    }
                    break
            }
        } else if (alias !== null) {
            promises = [
                this.searchAccount(alias)
            ]
        } else if (timestamp !== null) {
            promises = [
                this.searchTransaction(timestamp)
            ]
        } else if (domainName !== null) {
            promises = [
                this.searchNamingService(domainName)
            ]
        } else {
            promises = []
        }

        await Promise.allSettled(promises)

        return Promise.resolve()
    }


    getErrorCount(): number {
        return this.errorCount
    }


    //
    // Private
    //

    private updateErrorCount(reason: unknown): void {
        const notFound = axios.isAxiosError(reason) && reason.response?.status == 404
        if (!notFound) {
            this.errorCount += 1
        }
    }


    private async searchAccount(accountParam: EntityID | Uint8Array | string): Promise<void> {

        try {
            if (accountParam instanceof Uint8Array && (accountParam.length == 32 || accountParam.length == 33)) {
                // accountParam is a public key
                // https://testnet.mirrornode.hedera.com/api/v1/docs/#/accounts/listAccounts
                const publicKey = byteToHex(accountParam)
                const r = await axios.get<AccountsResponse>("api/v1/accounts/?account.publickey=" + publicKey + "&limit=2")
                // limit=2 because we want to know if there are more than 1 account with this public key
                this.accountsWithKey = r.data.accounts ?? []
            } else {
                let accountLoc: string
                if (accountParam instanceof EntityID) {
                    accountLoc = accountParam.toString()
                } else if (accountParam instanceof Uint8Array) {
                    accountLoc = byteToHex(accountParam)
                } else {
                    accountLoc = accountParam
                }
                // https://testnet.mirrornode.hedera.com/api/v1/docs/#/accounts/getAccountByIdOrAliasOrEvmAddress
                const r = await axios.get<AccountBalanceTransactions>("api/v1/accounts/" + accountLoc)
                this.account = r.data
            }
        } catch (reason: unknown) {
            this.updateErrorCount(reason)
        }

        return Promise.resolve()
    }

    private async searchContract(contractParam: EntityID | Uint8Array): Promise<void> {
        try {
            const l = contractParam instanceof EntityID ? contractParam.toString() : byteToHex(contractParam)
            // https://testnet.mirrornode.hedera.com/api/v1/docs/#/contracts/getContractById
            const r = await axios.get<ContractResponse>("api/v1/contracts/" + l)
            this.contract = r.data
        } catch (reason: unknown) {
            this.updateErrorCount(reason)
        }
        return Promise.resolve()
    }

    private async searchToken(tokenParam: EntityID | Uint8Array): Promise<void> {
        try {
            const i = tokenParam instanceof EntityID ?
                tokenParam : EntityID.fromAddress(byteToHex(tokenParam))
            if (i !== null) {
                // https://testnet.mirrornode.hedera.com/api/v1/docs/#/tokens/getTokenById
                const r = await axios.get<TokenInfo>("api/v1/tokens/" + i)
                this.tokenInfo = r.data
            }
        } catch (reason: unknown) {
            this.updateErrorCount(reason)
        }
        return Promise.resolve()
    }

    private async searchTopic(topicID: EntityID): Promise<void> {
        try {
            const params = {order: "desc", limit: "1"}
            // https://testnet.mirrornode.hedera.com/api/v1/docs/#/topics/listTopicMessagesById
            const r = await axios.get<TopicMessagesResponse>("api/v1/topics/" + topicID.toString() + "/messages", {params})
            this.topicMessages = r.data.messages ?? []
        } catch (reason: unknown) {
            this.updateErrorCount(reason)
        }
        return Promise.resolve()
    }

    private async searchTransaction(transactionParam: TransactionID | Timestamp | Uint8Array): Promise<void> {

        try {
            if (transactionParam instanceof TransactionID) {
                const tid = transactionParam.toString(false)
                // https://testnet.mirrornode.hedera.com/api/v1/docs/#/transactions/getTransactionById
                const r = await axios.get<TransactionByIdResponse>("api/v1/transactions/" + tid)
                this.transactions = r.data.transactions ?? []
            } else if (transactionParam instanceof Timestamp) {
                // https://testnet.mirrornode.hedera.com/api/v1/docs/#/transactions/listTransactions
                const t = transactionParam.toString()
                const r = await axios.get<TransactionResponse>("api/v1/transactions?timestamp=" + t)
                this.transactions = r.data.transactions ?? []
            } else if (transactionParam.length == 48) { // Hedera hash
                // https://testnet.mirrornode.hedera.com/api/v1/docs/#/transactions/getTransactionById
                const r = await axios.get<TransactionByIdResponse>("api/v1/transactions/" + byteToHex(transactionParam))
                this.transactions = r.data.transactions ?? []
            } else if (transactionParam.length == 32) { // EVM hash
                const r1 = await axios.get<ContractResultDetails>("api/v1/contracts/results/" + byteToHex(transactionParam))
                const r2 = await axios.get<TransactionResponse>("api/v1/transactions?timestamp=" + r1.data.timestamp)
                this.transactions = r2.data.transactions ?? []
            }

        } catch (reason: unknown) {
            this.updateErrorCount(reason)
        }
    }

    private async searchBlock(blockHash: Uint8Array): Promise<void> {
        try {
            // https://testnet.mirrornode.hedera.com/api/v1/docs/#/blocks/getByHashOrNumber
            const r = await axios.get<Block>("api/v1/blocks/" + byteToHex(blockHash))
            this.block = r.data
        } catch (reason: unknown) {
            this.updateErrorCount(reason)
        }
        return Promise.resolve()
    }

    private async searchNamingService(name: string): Promise<void> {
        try {
            const records = await NameService.instance.resolve(name, routeManager.currentNetwork.value)
            const accountId = records.length > 0 ? records[0].entityId : null
            if (accountId !== null) {
                const r = await axios.get<AccountBalanceTransactions>("api/v1/accounts/" + accountId)
                this.account = r.data
            } else {
                this.account = null
            }
        } catch (reason: unknown) {
            this.updateErrorCount(reason)
        }
        return Promise.resolve()
    }
}
