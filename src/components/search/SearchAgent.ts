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

import {Ref, ref, watch} from "vue";
import {EntityID} from "@/utils/EntityID";
import {
    AccountBalanceTransactions,
    AccountInfo,
    AccountsResponse,
    Block,
    ContractResponse,
    ContractResultDetails,
    Token,
    TokenInfo,
    TokensResponse,
    Topic,
    Transaction,
    TransactionByIdResponse,
    TransactionResponse
} from "@/schemas/HederaSchemas";
import {drainAccounts} from "@/schemas/HederaUtils";
import {aliasToBase32, byteToHex, paddedBytes} from "@/utils/B64Utils";
import axios from "axios";
import {RouteLocationRaw} from "vue-router";
import {routeManager} from "@/router";
import {TransactionID} from "@/utils/TransactionID";
import {Timestamp} from "@/utils/Timestamp";
import {NameRecord, NameService} from "@/utils/name_service/NameService";
import {NameServiceProvider} from "@/utils/name_service/provider/NameServiceProvider";
import {AccountByIdCache} from "@/utils/cache/AccountByIdCache";
import {AppStorage} from "@/AppStorage";

export abstract class SearchAgent<L, E> {

    public readonly loading = ref<boolean>(false)
    public readonly loc: Ref<L|null> = ref(null)
    public readonly candidates: Ref<SearchCandidate<E>[]> = ref([])
    private readonly abortController = new AbortController()

    //
    // Public
    //

    public constructor() {
        watch(this.loc, this.entityLocDidChange)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public willNavigate(candidate: SearchCandidate<E>): void {
        // Possibly override by subclasses
    }

    //
    // Protected
    //

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected /* abstract */ async load(loc: L, abortController: AbortController): Promise<SearchCandidate<E>[]> {
        return Promise.reject("To be subclassed")
    }

    //
    // Private
    //

    private readonly entityLocDidChange = async () => {

        if (this.loading.value) {
            this.abortController.abort()
        }

        this.loading.value = true
        try {
            if (this.loc.value !== null) {
                this.candidates.value = await this.load(this.loc.value, this.abortController)
            } else {
                this.candidates.value = []
            }
            this.loading.value = false
        } catch(reason) {
            this.candidates.value = []
            if (!this.isAbortError(reason)) {
                this.loading.value = false
            }
        }

    }

    private isAbortError(reason: unknown): boolean {
        return reason instanceof DOMException && reason.name == "AbortError"
    }

}

export class SearchCandidate<E> {
    constructor(readonly description: string,
                readonly extra: string|null,
                readonly route: RouteLocationRaw,
                readonly entity: E,
                readonly agent: SearchAgent<unknown,E>,
                readonly nonExistent: boolean = false) {}
}


export class AccountSearchAgent extends SearchAgent<EntityID | Uint8Array | string, AccountInfo>{

    //
    // SearchAgent
    //

    protected async load(accountParam: EntityID | Uint8Array | string): Promise<SearchCandidate<AccountInfo>[]> {

        let accountLoc: string|Uint8Array
        if (accountParam instanceof EntityID) {
            accountLoc = accountParam.toString()
        } else if (accountParam instanceof  Uint8Array) {
            if (accountParam.length == 32 || accountParam.length == 33) {
                // accountParam is a public key
                // https://testnet.mirrornode.hedera.com/api/v1/docs/#/accounts/listAccounts
                accountLoc = accountParam
            } else if (accountParam.length <= 20) {
                // accountParam is an evm address (possibly partial)
                accountLoc = byteToHex(paddedBytes(accountParam, 20))
            } else {
                // account alias in hex form
                accountLoc = aliasToBase32(accountParam)
            }
        } else {
            // account alias in base 32
            accountLoc = accountParam
        }

        let accountInfos: AccountInfo[]
        let drained: boolean
        try {
            if (accountLoc instanceof Uint8Array) {
                // accountParam is a public key
                // https://testnet.mirrornode.hedera.com/api/v1/docs/#/accounts/listAccounts
                const publicKey = byteToHex(accountLoc)
                const limit = 10
                const r = await axios.get<AccountsResponse>("api/v1/accounts/?account.publickey=" + publicKey + "&limit=" + limit)
                accountInfos = await drainAccounts(r.data, limit)
                drained = (r.data.links?.next ?? null) == null
            } else {
                // https://testnet.mirrornode.hedera.com/api/v1/docs/#/accounts/getAccountByIdOrAliasOrEvmAddress
                const r = await axios.get<AccountBalanceTransactions>("api/v1/accounts/" + accountLoc)
                accountInfos = [r.data]
                drained = true
            }
        } catch {
            accountInfos = []
            drained = true
        }

        let result: SearchCandidate<AccountInfo>[]
        if (accountInfos.length == 1) {
            const accountInfo = accountInfos[0]
            if (accountInfo.account) {
                const description = "Account " + accountInfo.account
                const route = routeManager.makeRouteToAccount(accountInfo.account)
                const candidate = new SearchCandidate<AccountInfo>(description, null, route, accountInfo, this)
                result = [candidate]
            } else {
                result = []
            }
        } else if (accountInfos.length >= 2) { // => accountLoc instanceof Uint8Array
            if (drained) {
                // We have all the accounts matching accountLoc (10 max) => we display them all
                result = []
                for (const a of accountInfos) {
                    if (a.account !== null) {
                        const description = "Account " + a.account
                        const route = routeManager.makeRouteToAccount(a.account)
                        const candidate = new SearchCandidate<AccountInfo>(description, null, route, a, this)
                        result.push(candidate)
                    }
                }
            } else {
                // There's more than 10 accounts matching accountLoc => we display a navigation link
                const description = "All accounts with public key above"
                const key = byteToHex(accountLoc as Uint8Array)
                const route = routeManager.makeRouteToAccountsWithKey(key)
                const accountInfo0 = accountInfos[0]
                const candidate = new SearchCandidate<AccountInfo>(description, null, route, accountInfo0, this)
                result = [candidate]
            }
        } else {
            result = []
        }

        return Promise.resolve(result)
    }
}


export class ContractSearchAgent extends SearchAgent<EntityID | Uint8Array, ContractResponse>{

    //
    // SearchAgent
    //

    protected async load(contractParam: EntityID | Uint8Array): Promise<SearchCandidate<ContractResponse>[]> {

        let contractLoc: string|null
        if (contractParam instanceof EntityID) {
            contractLoc = contractParam.toString()
        } else if (contractParam.length <= 20) {
            // contractParam is an evm address (possibly partial)
            contractLoc = byteToHex(paddedBytes(contractParam, 20))
        } else {
            contractLoc = null
        }

        let contractInfo: ContractResponse|null
        if (contractLoc !== null) {
            // https://testnet.mirrornode.hedera.com/api/v1/docs/#/contracts/getContractById
            const r = await axios.get<ContractResponse>("api/v1/contracts/" + contractLoc)
            contractInfo = r.data
        } else {
            contractInfo = null
        }

        let result: SearchCandidate<ContractResponse>[]
        if (contractInfo !== null && contractInfo.contract_id) {
            const description = "Contract " + contractInfo.contract_id
            const route = routeManager.makeRouteToContract(contractInfo.contract_id)
            const candidate = new SearchCandidate<ContractResponse>(description, null, route, contractInfo, this)
            result = [candidate]
        } else {
            result = []
        }

        return Promise.resolve(result)
    }

}

export class TokenSearchAgent extends SearchAgent<EntityID | Uint8Array, TokenInfo>{

    //
    // SearchAgent
    //

    protected async load(tokenParam: EntityID | Uint8Array): Promise<SearchCandidate<TokenInfo>[]> {

        let tokenLoc: string|null
        if (tokenParam instanceof EntityID) {
            tokenLoc = tokenParam.toString()
        } else if (tokenParam.length <= 20) {
            // accountParam is an evm address (possibly partial)
            const evmAddress = byteToHex(paddedBytes(tokenParam, 20))
            const entityID = EntityID.fromAddress(evmAddress)
            tokenLoc = entityID !== null ? entityID.toString() : null
        } else {
            tokenLoc = null
        }

        let tokenInfo: TokenInfo|null
        if (tokenLoc !== null) {
            try {
                // https://testnet.mirrornode.hedera.com/api/v1/docs/#/contracts/getContractById
                const r = await axios.get<TokenInfo>("api/v1/tokens/" + tokenLoc)
                tokenInfo = r.data
            } catch {
                tokenInfo = null
            }
        } else {
            tokenInfo = null
        }

        let result: SearchCandidate<TokenInfo>[]
        if (tokenInfo !== null && tokenInfo.token_id !== null) {
            const description = "Token " + tokenInfo.token_id
            const route = routeManager.makeRouteToToken(tokenInfo.token_id)
            const candidate = new SearchCandidate(description, null,route, tokenInfo, this)
            result = [candidate]
        } else {
            result = []
        }

        return Promise.resolve(result)
    }

}

export class TopicSearchAgent extends SearchAgent<EntityID, Topic>{

    //
    // SearchAgent
    //

    protected async load(topicID: EntityID): Promise<SearchCandidate<Topic>[]> {
        let result: SearchCandidate<Topic>[]
        try {
            const topicInfo = (await axios.get<Topic>("api/v1/topics/" + topicID.toString())).data
            const description = "Topic " + topicInfo.topic_id
            const route = routeManager.makeRouteToTopic(topicID.toString())
            const candidate = new SearchCandidate(description, null,route, topicInfo, this)
            result = [candidate]
        } catch {
            result = []
        }

        return Promise.resolve(result)
    }
}

export class TransactionSearchAgent extends SearchAgent<TransactionID | Timestamp | Uint8Array, Transaction> {

    //
    // SearchAgent
    //

    protected async load(transactionParam: TransactionID | Timestamp | Uint8Array): Promise<SearchCandidate<Transaction>[]> {
        let result: SearchCandidate<Transaction>[]
        try {
            let transactions: Transaction[]
            if (transactionParam instanceof TransactionID) {
                const tid = transactionParam.toString(false)
                // https://testnet.mirrornode.hedera.com/api/v1/docs/#/transactions/getTransactionById
                const r = await axios.get<TransactionByIdResponse>("api/v1/transactions/" + tid)
                transactions = r.data.transactions ?? []
            } else if (transactionParam instanceof Timestamp) {
                // https://testnet.mirrornode.hedera.com/api/v1/docs/#/transactions/listTransactions
                const t = transactionParam.toString()
                const r = await axios.get<TransactionResponse>("api/v1/transactions?timestamp=" + t)
                transactions = r.data.transactions ?? []
            } else {
                if (transactionParam.length == 48) { // Hedera hash
                    // https://testnet.mirrornode.hedera.com/api/v1/docs/#/transactions/getTransactionById
                    const r = await axios.get<TransactionByIdResponse>("api/v1/transactions/" + byteToHex(transactionParam))
                    transactions = r.data.transactions ?? []
                } else if (transactionParam.length == 32) { // Ethereum hash
                    const r1 = await axios.get<ContractResultDetails>("api/v1/contracts/results/" + byteToHex(transactionParam))
                    const r2 = await axios.get<TransactionResponse>("api/v1/transactions?timestamp=" + r1.data.timestamp)
                    transactions = r2.data.transactions ?? []
                } else {
                    transactions = []
                }
            }
            result = this.makeCandidates(transactionParam, transactions ?? [])
        } catch {
            result = []
        }

        return Promise.resolve(result)
    }

    //
    // Private
    //

    private makeCandidates(transactionParam: TransactionID | Timestamp | Uint8Array, transactions: Transaction[]): SearchCandidate<Transaction>[] {
        let result: SearchCandidate<Transaction>[]
        if (transactions.length >= 1) {
            const transaction0 = transactions[0]
            const displayTransactionID = TransactionID.normalizeForDisplay(transaction0.transaction_id)
            if (transactionParam instanceof TransactionID) {
                if (transactions.length == 1) {
                    const description = "Transaction " + displayTransactionID
                    const route = routeManager.makeRouteToTransaction(transaction0.consensus_timestamp)
                    const candidate = new SearchCandidate<Transaction>(description, null, route, transaction0, this)
                    result = [candidate]
                } else {
                    const description = "All transactions with ID " + displayTransactionID
                    const route = routeManager.makeRouteToTransactionsById(transaction0.transaction_id)
                    const candidate = new SearchCandidate<Transaction>(description, null, route, transaction0, this)
                    result = [candidate]
                }
            } else if (transactionParam instanceof Timestamp) {
                const description = "Transaction " + displayTransactionID
                const route = routeManager.makeRouteToTransaction(transactionParam.toString())
                const candidate = new SearchCandidate<Transaction>(description, null, route, transaction0, this)
                result = [candidate]
            } else { // transactionParam instanceof Uint8Array
                const description = "Transaction " + displayTransactionID
                const route = routeManager.makeRouteToTransaction(transaction0.consensus_timestamp)
                const candidate = new SearchCandidate<Transaction>(description, null, route, transaction0, this)
                result = [candidate]
            }
        } else {
            result = []
        }
        return result
    }

}

export class DomainNameSearchAgent extends SearchAgent<string, DomainNameResolution> {

    //
    // Public
    //

    public constructor(public readonly provider: NameServiceProvider) {
        super()
    }

    //
    // SearchAgent
    //

    public willNavigate(candidate: SearchCandidate<DomainNameResolution>): void {
        const record = candidate.entity.record
        const network = routeManager.currentNetwork.value
        AppStorage.setNameRecord(record.entityId, network, record)
    }

    protected async load(domainName: string): Promise<SearchCandidate<DomainNameResolution>[]> {
        let result: SearchCandidate<DomainNameResolution>|null
        try {
            const network = routeManager.currentNetwork.value
            const record = await NameService.instance.singleResolve(domainName, network, this.provider.providerAlias)
            if (record !== null) {
                const accountInfo = await AccountByIdCache.instance.lookup(record.entityId)
                const description = "Account " + record.entityId
                const nonExistent = accountInfo == null
                const extra = nonExistent
                    ? " (resolved with " + record.providerAlias + ", non-existent)"
                    : " (resolved with " + record.providerAlias + ")"
                const route = routeManager.makeRouteToAccount(record.entityId)
                const resolution = new DomainNameResolution(record, accountInfo)
                result = new SearchCandidate(description, extra, route, resolution, this, nonExistent)
            } else {
                result = null
            }
        } catch {
            result = null
        }
        return result !== null ? [result] : []
    }

}

export class DomainNameResolution {
    constructor(public readonly record: NameRecord, public readonly accountInfo: AccountInfo|null) {}
}

export class BlockSearchAgent extends SearchAgent<number|Uint8Array, Block> {

    //
    // SearchAgent
    //

    protected async load(blockParam: number|Uint8Array): Promise<SearchCandidate<Block>[]> {
        let result: SearchCandidate<Block>[]
        try {
            let block: Block|null
            if (blockParam instanceof Uint8Array) {
                if (blockParam.length == 48) {
                    block = (await axios.get<Block>("api/v1/blocks/" + byteToHex(blockParam))).data
                } else {
                    block = null
                }
            } else {
                block = (await axios.get<Block>("api/v1/blocks/" + blockParam)).data
            }
            if (block !== null) {
                const description = "Block " + block.number
                const route = routeManager.makeRouteToBlock(block.number ?? 1)
                const candidate = new SearchCandidate<Block>(description, null, route, block, this)
                result = [candidate]
            } else {
                result = []
            }
        } catch {
            result = []
        }

        return Promise.resolve(result)
    }

}

export class TokenNameSearchAgent extends SearchAgent<string, Token> {

    private readonly limit = 10

    //
    // SearchAgent
    //

    protected async load(tokenName: string): Promise<SearchCandidate<Token>[]> {


        let tokens: Token[]
        // let drained: boolean
        try {
            // https://previewnet.mirrornode.hedera.com/api/v1/docs/#/tokens/getToken
            const r = await axios.get<TokensResponse>("api/v1/tokens/?name=" + tokenName + "&limit=" + (this.limit+1))
            tokens = r.data.tokens ?? []
            // drained = tokens.length <= this.limit
        } catch {
            tokens = []
            // drained = true
        }

        const result: SearchCandidate<Token>[] = []
        if (tokens.length >= 1) {
            for (const t of tokens) {
                if (t.token_id !== null) {
                    const description = "Token " + t.token_id
                    const extra = "  " + t.name
                    const route = routeManager.makeRouteToToken(t.token_id)
                    const candidate = new SearchCandidate<Token>(description, extra, route, t, this)
                    result.push(candidate)
                }
            }
            // if (!drained) {
            //     const description = "Show more tokens matching '" + tokenName + "'"
            //     const route = routeManager.makeRouteToMatchingTokens(tokenName)
            //     const candidate = new SearchCandidate<Token>(description, null, route, tokens[0], this)
            //     result.push(candidate)
            // }
        }

        return Promise.resolve(result)
    }

}
