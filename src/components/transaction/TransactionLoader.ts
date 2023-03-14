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

import {EntityLoader} from "@/utils/loader/EntityLoader";
import {
    ContractResultDetails,
    Transaction,
    TransactionByIdResponse,
    TransactionResponse, TransactionType
} from "@/schemas/HederaSchemas";
import {computed, ComputedRef, ref, Ref} from "vue";
import axios, {AxiosError, AxiosResponse} from "axios";
import {computeNetAmount} from "@/utils/TransactionTools";
import {normalizeTransactionId} from "@/utils/TransactionID";
import {base64DecToArr, byteToHex} from "@/utils/B64Utils";
import {PathParam} from "@/utils/PathParam";
import {Timestamp} from "@/utils/Timestamp";
import {TransactionHash} from "@/utils/TransactionHash";
import {EthereumHash} from "@/utils/EthereumHash";
import {ContractLoader} from "@/components/contract/ContractLoader";
import {AccountLoader} from "@/components/account/AccountLoader";
import {EntityDescriptor} from "@/utils/EntityDescriptor";
import {systemContractRegistry} from "@/schemas/SystemContractRegistry";
import {BlocksResponseCollector} from "@/utils/collector/BlocksResponseCollector";

export class TransactionLoader extends EntityLoader<Transaction> {

    public readonly transactionLoc: ComputedRef<string|null> // transaction timestamp, hash or ethereum hash
    public readonly transactionId: ComputedRef<string|null>

    private readonly transactionsRef: Ref<Transaction[]> = ref([])
    private readonly contractLoader: ContractLoader
    private readonly accountLoader: AccountLoader

    //
    // Public
    //

    public constructor(transactionLoc: ComputedRef<string|null>, transactionId: ComputedRef<string|null>) {
        super()
        this.transactionLoc = transactionLoc
        this.transactionId = transactionId
        this.contractLoader = new ContractLoader(this.ethereumContractId)
        this.accountLoader = new AccountLoader(this.ethereumContractId)
        this.watchAndReload([this.transactionLoc, this.transactionId])
    }

    public readonly transactions: ComputedRef<Transaction[]> = computed(
        () => this.transactionsRef.value)

    public readonly transaction: ComputedRef<Transaction|null> = computed(() => this.entity.value)

    public readonly formattedTransactionId: ComputedRef<string|null> = computed(() => {
        const transaction_id = this.transaction.value?.transaction_id
        return transaction_id ? normalizeTransactionId(transaction_id, true) : null
    })

    public readonly consensusTimestamp: ComputedRef<string|null> = computed(
        () => this.transaction.value?.consensus_timestamp ?? null)

    public readonly transactionType = computed(() => this.transaction.value?.name ?? null)

    public readonly contractId = computed(() => {
        return (this.transactionType.value === TransactionType.ETHEREUMTRANSACTION)
            ? this.contractLoader.contractId.value ?? null
            : (this.transactionType.value === TransactionType.CONTRACTCREATEINSTANCE
                || this.transactionType.value === TransactionType.CONTRACTCALL
                || this.transactionType.value === TransactionType.CONTRACTUPDATEINSTANCE
                || this.transactionType.value === TransactionType.CONTRACTDELETEINSTANCE)
                ? this.transaction.value?.entity_id
                : null
    })

    public readonly result: ComputedRef<string|null> = computed(
        () => this.transaction.value?.result ?? null)

    public readonly hasSucceeded: ComputedRef<boolean> = computed(() => this.result.value == "SUCCESS")

    public readonly netAmount: ComputedRef<number> = computed(
        () => this.transaction.value !== null ? computeNetAmount(this.transaction.value) : 0)

    public readonly maxFee: ComputedRef<number> = computed(() => {
        const result = this.transaction.value?.max_fee ? Number.parseFloat(this.transaction.value?.max_fee) : 0
        return isNaN(result) ? -9999 : result
    })

    public readonly formattedHash: ComputedRef<string|null> = computed( () => {
        const hash = this.transaction.value?.transaction_hash
        return hash ? byteToHex(base64DecToArr(hash)) : null
    })

    public readonly entityDescriptor = computed(() => {
        let result: EntityDescriptor|null
        if (this.contractLoader.entity.value !== null) {
            result = new EntityDescriptor("Contract ID", "ContractDetails")
        } else if (this.accountLoader.entity.value !== null) {
            result = new EntityDescriptor("Account ID", "AccountDetails")
        } else if (this.transaction.value) {
            result = EntityDescriptor.makeEntityDescriptor(this.transaction.value)
        } else {
            result = null
        }
        return result
    })

    public readonly systemContract: ComputedRef<string|null> = computed(() => {
        let result: string|null
        if (this.transaction.value?.name === TransactionType.CONTRACTCALL && this.transaction.value.entity_id) {
            result = systemContractRegistry.lookup(this.transaction.value.entity_id)?.description ?? null
        } else {
            result = null
        }
        return result
    })

    public readonly scheduledTransaction = computed(() => {
        let result: Transaction|null
        if (this.transactions.value.length >= 2) {
            result = (this.transaction.value?.name === TransactionType.SCHEDULECREATE)
                ? lookupScheduledTransaction(this.transactions.value)
                : null
        } else {
            result = null
        }
        return result
    })

    public readonly schedulingTransaction = computed(() => {
        let result: Transaction|null
        if (this.transactions.value.length >= 2) {
            result = this.transaction.value?.scheduled
                ? lookupSchedulingTransaction(this.transactions.value)
                : null
        } else {
            result = null
        }
        return result
    })

    public readonly parentTransaction = computed(() => {
        let result: Transaction|null
        const children = lookupChildTransactions(this.transactions.value)
        if (children.length && this.transaction.value?.nonce && this.transaction.value.nonce > 0) {
            result = lookupParentTransaction(this.transactions.value)
        } else {
            result = null
        }
        return result
    })

    public readonly childTransactions = computed(() => {
        let result: Transaction[]
        const children = lookupChildTransactions(this.transactions.value)
        if (children.length && this.transaction.value?.nonce && this.transaction.value.nonce > 0) {
            result = []
        } else {
            result = children
        }
        return result
    })

    public readonly blockNumber: ComputedRef<number|null> = computed(() => {
        const blocks = this.blockResponses.value?.blocks ?? []
        return blocks.length >= 1 ? blocks[0].number ?? null : null
    })

    //
    // EntityLoader
    //
    //
    // public requestLoad() {
    //     super.requestLoad();
    //     this.contractLoader.requestLoad()
    //     this.accountLoader.requestLoad()
    // }

    protected async load(): Promise<AxiosResponse<Transaction>|null> {
        let result: AxiosResponse<Transaction>|null

        /*
                  \ transactionId  |                null                  |               !null
            transactionLoc         |                                      |
            -----------------------+--------------------------------------+--------------------------------------
            timestamp              | api/v1/transactions?timestamp={t}    | api/v1/transactions/{transactionId}
                                   | api/v1/transactions/{transactionId}  |
            -----------------------+--------------------------------------+--------------------------------------
            hash                   | api/v1/transactions/{transactionHash}| api/v1/transactions/{transactionId}
                                   | api/v1/transactions/{transactionId}  |
            -----------------------+--------------------------------------+--------------------------------------
            ethereum hash          | api/v1/contracts/results/{eth}       | api/v1/contracts/results/{eth}
                                   | api/v1/transactions?timestamp={t}    | api/v1/transactions/{transactionId}
                                   | api/v1/transactions/{transactionId}  |
            -----------------------+--------------------------------------+--------------------------------------

         */

        const tloc = this.transactionLoc.value !== null ? PathParam.parseTransactionLoc(this.transactionLoc.value) : null
        const tth = tloc instanceof EthereumHash ? await TransactionLoader.findTimestampForEthereumHash(tloc) : tloc

        if (tth !== null) {

            // 1) Finds transaction id
            let transactionId: string|null
            if (this.transactionId.value !== null) { // We have the transaction id  :)
                transactionId = this.transactionId.value
            } else { // We need to find the transaction id using timestamp or hash    :(
                transactionId = await TransactionLoader.findTransactionId(tth)
            }

            // 2) Loads transactions with transaction id
            let transaction: Transaction|null
            if (transactionId !== null) {
                const response = await axios.get<TransactionResponse>("api/v1/transactions/" + transactionId)
                this.transactionsRef.value = response.data.transactions ?? []
                transaction = TransactionLoader.lookupTransaction(this.transactionsRef.value, tth)
            } else {
                this.transactionsRef.value = []
                transaction = null
            }

            if (transaction !== null) {
                result = {
                    data: transaction,
                    status: 200,
                    statusText: "",
                    headers: {},
                    config: {}
                }
            } else {
                result = null
            }
        } else {
            result = null
        }

        return Promise.resolve(result)
    }

    //
    // Private
    //

    private readonly ethereumContractId = computed(() => {
        const entityId = this.transaction.value?.entity_id
        const name = this.transaction.value?.name
        return entityId && name == TransactionType.ETHEREUMTRANSACTION ? entityId : null
    })

    private readonly blockResponses = BlocksResponseCollector.instance.ref(this.consensusTimestamp)

    //
    // Private (findTransactionId)
    //

    private static async findTransactionId(tloc: Timestamp | TransactionHash): Promise<string|null> {
        let result: string|null
        if (tloc instanceof Timestamp) {
            const response = await axios.get<TransactionResponse>("api/v1/transactions?timestamp=" + tloc.toString())
            const transactions = response.data.transactions ?? []
            const transactions0 = transactions.length >= 1 ? transactions[0] : null
            result = transactions0?.transaction_id ?? null
            if (result === null) {
                const r: AxiosResponse = {
                    data: {},
                    status: 404,
                    statusText: "",
                    headers: response.headers,
                    config: response.config
                }
                throw new AxiosError("", "", response.config, response.request, r)
            }
        } else {
            const url = "api/v1/transactions/" + tloc.toString()
            const response = await axios.get<TransactionByIdResponse>(url)
            const transactions = response.data.transactions ?? []
            const transactions0 = transactions.length >= 1 ? transactions[0] : null
            result = transactions0?.transaction_id ?? null
        }
        return Promise.resolve(result)
    }

    private static async findTimestampForEthereumHash(tloc: EthereumHash): Promise<Timestamp|null> {
        const response = await axios.get<ContractResultDetails>("api/v1/contracts/results/" + tloc.toString())
        const timestamp = response?.data.timestamp ?? null
        const result = timestamp !== null ? Timestamp.parse(timestamp) : null
        return Promise.resolve(result)
    }


    //
    // Private (lookupTransaction)
    //

    private static lookupTransaction(candidates: Transaction[], tth: Timestamp|TransactionHash): Transaction|null {
        let result: Transaction|null = null
        if (tth instanceof Timestamp) {
            const tt = tth.toString()
            for (const t of candidates) {
                if (t.consensus_timestamp == tt) {
                    result = t
                    break
                }
            }
        } else {
            const h = tth.toBase64()
            for (const t of candidates) {
                if (t.transaction_hash == h) {
                    result = t
                    break
                }
            }
        }
        return result
    }
}

function lookupScheduledTransaction(transactions: Transaction[]): Transaction|null {
    let result: Transaction | null = null
    for (const t of transactions) {
        if (t.scheduled) {
            result = t
            break
        }
    }
    return result
}

function lookupSchedulingTransaction(transactions: Transaction[]): Transaction|null {
    let result: Transaction | null = null
    for (const t of transactions) {
        if (t.name === TransactionType.SCHEDULECREATE) {
            result = t
            break
        }
    }
    return result
}

function lookupParentTransaction(transactions: Transaction[]): Transaction|null {
    let result: Transaction | null = null
    for (const t of transactions) {
        if (t.nonce === 0) {
            result = t
            break
        }
    }
    return result
}

function lookupChildTransactions(transactions: Transaction[]): Transaction[] {
    const result = new Array<Transaction>()
    for (const t of transactions) {
        if (t.parent_consensus_timestamp) {
            result.push(t)
        }
    }
    return result
}
