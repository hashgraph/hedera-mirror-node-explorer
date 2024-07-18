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
    TokenInfo,
    Transaction,
    TransactionByIdResponse,
    TransactionResponse
} from "@/schemas/HederaSchemas";
import {byteToHex} from "@/utils/B64Utils";
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
    protected /* abstract */ async load(loc: L, abortController: AbortController): Promise<E[]> {
        return Promise.reject("To be subclassed")
    }

    protected abstract makeCandidate(loc: L, entity: E): SearchCandidate<E>|null

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
                const entities = await this.load(this.loc.value, this.abortController)
                this.candidates.value = this.buildCandidates(this.loc.value, entities)
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

        console.log(this.constructor.name + ".entityLocDidChange: this.candidates=" + this.candidates.value.length)
    }

    private isAbortError(reason: unknown): boolean {
        return reason instanceof DOMException && reason.name == "AbortError"
    }

    private buildCandidates(loc: L, entities: E[]): SearchCandidate<E>[] {
        const result: SearchCandidate<E>[] = []
        for (const e of entities) {
            const newCandidate = this.makeCandidate(loc, e)
            if (newCandidate !== null) {
                result.push(newCandidate)
            }
        }
        return result
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

    protected async load(accountParam: EntityID | Uint8Array | string): Promise<AccountInfo[]> {
        let result: AccountInfo[]
        try {
            if (accountParam instanceof Uint8Array && (accountParam.length == 32 || accountParam.length == 33)) {
                // accountParam is a public key
                // https://testnet.mirrornode.hedera.com/api/v1/docs/#/accounts/listAccounts
                const publicKey = byteToHex(accountParam)
                const r = await axios.get<AccountsResponse>("api/v1/accounts/?account.publickey=" + publicKey + "&limit=2")
                // limit=2 because we want to know if there are more than 1 account with this public key
                result = r.data.accounts ?? []
            } else {
                let accountLoc: string|null
                if (accountParam instanceof EntityID) {
                    accountLoc = accountParam.toString()
                } else if (accountParam instanceof Uint8Array) {
                    accountLoc = accountParam.length == 20 ? byteToHex(accountParam) : null
                } else {
                    accountLoc = accountParam
                }
                if (accountLoc !== null) {
                    // https://testnet.mirrornode.hedera.com/api/v1/docs/#/accounts/getAccountByIdOrAliasOrEvmAddress
                    const r = await axios.get<AccountBalanceTransactions>("api/v1/accounts/" + accountLoc)
                    result = [r.data]
                } else {
                    result = []
                }
            }
        } catch {
            result = []
        }

        return Promise.resolve(result)
    }

    protected makeCandidate(loc: EntityID | Uint8Array | string, entity: AccountInfo): SearchCandidate<AccountInfo> | null {
        let result: SearchCandidate<AccountInfo>|null
        if (entity.account !== null) {
            const description = "Account " + entity.account
            const route = routeManager.makeRouteToAccount(entity.account)
            result = new SearchCandidate(description, null, route, entity, this)
        } else {
            result = null
        }
        return result
    }
}


export class ContractSearchAgent extends SearchAgent<EntityID | Uint8Array, ContractResponse>{

    //
    // SearchAgent
    //

    protected async load(contractParam: EntityID | Uint8Array): Promise<ContractResponse[]> {
        let result: ContractResponse[]
        try {
            let contractLoc: string|null
            if (contractParam instanceof EntityID) {
                contractLoc = contractParam.toString()
            } else if (contractParam.length == 20) {
                contractLoc = byteToHex(contractParam)
            } else {
                contractLoc = null
            }
            if (contractLoc !== null) {
                // https://testnet.mirrornode.hedera.com/api/v1/docs/#/contracts/getContractById
                const r = await axios.get<ContractResponse>("api/v1/contracts/" + contractLoc)
                result = [r.data]
            } else {
                result = []
            }
        } catch {
            result = []
        }

        return Promise.resolve(result)
    }

    protected makeCandidate(loc: EntityID | Uint8Array, entity: ContractResponse): SearchCandidate<ContractResponse> | null {
        let result: SearchCandidate<ContractResponse>|null
        if (entity.contract_id !== null) {
            const description = "Contract " + entity.contract_id
            const route = routeManager.makeRouteToContract(entity.contract_id)
            result = new SearchCandidate(description, null, route, entity, this)
        } else {
            result = null
        }
        return result
    }

}

export class TokenSearchAgent extends SearchAgent<EntityID | Uint8Array, TokenInfo>{

    //
    // SearchAgent
    //

    protected async load(contractParam: EntityID | Uint8Array): Promise<TokenInfo[]> {
        let result: TokenInfo[]
        try {
            let contractLoc: string|null
            if (contractParam instanceof EntityID) {
                contractLoc = contractParam.toString()
            } else if (contractParam.length == 20) {
                contractLoc = byteToHex(contractParam)
            } else {
                contractLoc = null
            }
            if (contractLoc !== null) {
                // https://testnet.mirrornode.hedera.com/api/v1/docs/#/contracts/getContractById
                const r = await axios.get<TokenInfo>("api/v1/tokens/" + contractLoc)
                result = [r.data]
            } else {
                result = []
            }
        } catch {
            result = []
        }

        return Promise.resolve(result)
    }

    protected makeCandidate(loc: EntityID | Uint8Array, entity: TokenInfo): SearchCandidate<TokenInfo> | null {
        let result: SearchCandidate<TokenInfo>|null
        if (entity.token_id !== null) {
            const description = "Token " + entity.token_id
            const route = routeManager.makeRouteToToken(entity.token_id)
            result = new SearchCandidate(description, null,route, entity, this)
        } else {
            result = null
        }
        return result
    }

}

export class TransactionSearchAgent extends SearchAgent<TransactionID | Timestamp | Uint8Array, Transaction> {

    //
    // SearchAgent
    //

    protected async load(transactionParam: TransactionID | Timestamp | Uint8Array): Promise<Transaction[]> {
        let result: Transaction[]
        try {
            if (transactionParam instanceof TransactionID) {
                const tid = transactionParam.toString(false)
                // https://testnet.mirrornode.hedera.com/api/v1/docs/#/transactions/getTransactionById
                const r = await axios.get<TransactionByIdResponse>("api/v1/transactions/" + tid)
                result = r.data.transactions ?? []
            } else if (transactionParam instanceof Timestamp) {
                // https://testnet.mirrornode.hedera.com/api/v1/docs/#/transactions/listTransactions
                const t = transactionParam.toString()
                const r = await axios.get<TransactionResponse>("api/v1/transactions?timestamp=" + t)
                result = r.data.transactions ?? []
            } else {
                if (transactionParam.length == 48) { // Hedera hash
                    // https://testnet.mirrornode.hedera.com/api/v1/docs/#/transactions/getTransactionById
                    const r = await axios.get<TransactionByIdResponse>("api/v1/transactions/" + byteToHex(transactionParam))
                    result = r.data.transactions ?? []
                } else if (transactionParam.length == 32) { // Ethereum hash
                    const r1 = await axios.get<ContractResultDetails>("api/v1/contracts/results/" + byteToHex(transactionParam))
                    const r2 = await axios.get<TransactionResponse>("api/v1/transactions?timestamp=" + r1.data.timestamp)
                    result = r2.data.transactions ?? []
                } else {
                    result = []
                }
            }
        } catch {
            result = []
        }

        return Promise.resolve(result)
    }

    protected makeCandidate(loc: TransactionID | Timestamp | Uint8Array, entity: Transaction): SearchCandidate<Transaction> | null {
        const description = "Transaction " + entity.transaction_id
        const route = routeManager.makeRouteToTransaction(entity.transaction_id)
        return new SearchCandidate(description, null, route, entity, this)
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

    protected async load(domainName: string): Promise<DomainNameResolution[]> {
        let result: DomainNameResolution|null
        try {
            const network = routeManager.currentNetwork.value
            const record = await NameService.instance.singleResolve(domainName, network, this.provider.providerAlias)
            if (record !== null) {
                const accountInfo = await AccountByIdCache.instance.lookup(record.entityId)
                result = new DomainNameResolution(record, accountInfo)
            } else {
                result = null
            }
        } catch {
            result = null
        }
        return result !== null ? [result] : []
    }

    protected makeCandidate(domainName: string, resolution: DomainNameResolution): SearchCandidate<DomainNameResolution> | null {
        const description = "Account " + resolution.record.entityId
        const nonExistent = resolution.accountInfo == null
        const extra = nonExistent
            ? " (resolved with " + resolution.record.providerAlias + ", non-existent)"
            : " (resolved with " + resolution.record.providerAlias + ")"
        const route = routeManager.makeRouteToAccount(resolution.record.entityId)
        return new SearchCandidate(description, extra, route, resolution, this, nonExistent)
    }


}

export class DomainNameResolution {
    constructor(public readonly record: NameRecord, public readonly accountInfo: AccountInfo|null) {}
}

export class BlockSearchAgent extends SearchAgent<number|Uint8Array, Block> {

    //
    // SearchAgent
    //

    protected async load(blockParam: number|Uint8Array): Promise<Block[]> {
        let result: Block[]
        try {
            if (blockParam instanceof Uint8Array) {
                if (blockParam.length == 48) {
                    const b = await axios.get<Block>("api/v1/blocks/" + byteToHex(blockParam))
                    result = [b.data]
                } else {
                    result = []
                }
            } else {
                const b = await axios.get<Block>("api/v1/blocks/" + blockParam)
                result = [b.data]
            }
        } catch {
            result = []
        }

        return Promise.resolve(result)
    }

    protected makeCandidate(blockNb: number|Uint8Array, entity: Block): SearchCandidate<Block> | null {
        const description = "Block " + entity.number
        const route = routeManager.makeRouteToBlock(entity.number ?? 1)
        return new SearchCandidate(description, null, route, entity, this)
    }

}
