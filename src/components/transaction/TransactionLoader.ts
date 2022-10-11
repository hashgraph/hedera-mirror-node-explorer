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

import {EntityLoader} from "@/utils/EntityLoader";
import {BlocksResponse, Transaction, TransactionByIdResponse, TransactionType} from "@/schemas/HederaSchemas";
import {computed, ComputedRef, Ref, ref, watch} from "vue";
import axios, {AxiosResponse} from "axios";
import {computeNetAmount} from "@/utils/TransactionTools";
import {EntityDescriptor} from "@/utils/EntityDescriptor";
import {ContractLoader} from "@/components/contract/ContractLoader";
import {AccountLoader} from "@/components/account/AccountLoader";
import {systemContractRegistry} from "@/schemas/SystemContractRegistry";
import {normalizeTransactionId} from "@/utils/TransactionID";
import {base64DecToArr, byteToHex} from "@/utils/B64Utils";
import {BlocksResponseCollector} from "@/utils/BlocksResponseCollector";

export class TransactionLoader extends EntityLoader<TransactionByIdResponse> {

    public readonly transactionLocator: ComputedRef<string|null>
    public readonly consensusTimestamp: ComputedRef<string|null>
    private readonly contractLoader: ContractLoader
    private readonly accountLoader: AccountLoader

    //
    // Public
    //

    public constructor(transactionLocator: ComputedRef<string|null>, consensusTimestamp: ComputedRef<string|null>) {
        super()
        this.transactionLocator = transactionLocator
        this.consensusTimestamp = consensusTimestamp
        this.contractLoader = new ContractLoader(this.ethereumContractId)
        this.accountLoader = new AccountLoader(this.ethereumContractId)
        this.watchAndReload([this.transactionLocator])
        watch(this.transaction, () => this.updateBlockNumber())
    }

    public readonly transactions: ComputedRef<Transaction[]> = computed(
        () => this.entity.value?.transactions ?? [])

    public readonly transaction: ComputedRef<Transaction|null> = computed(
        () => this.entity.value?.transactions ? filter(this.transactions.value, this.consensusTimestamp.value) : null)

    public readonly formattedTransactionId: ComputedRef<string|null> = computed(() => {
        const transaction_id = this.transaction.value?.transaction_id
        return transaction_id ? normalizeTransactionId(transaction_id, true) : null
    })

    public readonly transactionType = computed(() => this.transaction.value?.name ?? null)

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

    public readonly blockNumber: Ref<number|null> = ref(null)

    //
    // EntityLoader
    //

    protected async load(): Promise<AxiosResponse<TransactionByIdResponse>|null> {
        let result: Promise<AxiosResponse<TransactionByIdResponse>|null>
        if (this.transactionLocator.value != null) {
            result = axios.get<TransactionByIdResponse>("api/v1/transactions/" + this.transactionLocator.value)
        } else {
            result = Promise.resolve(null)
        }
        return result
    }

    //
    // Private
    //

    private readonly ethereumContractId = computed(() => {
        const entityId = this.transaction.value?.entity_id
        const name = this.transaction.value?.name
        return entityId && name == TransactionType.ETHEREUMTRANSACTION ? entityId : null
    })

    private updateBlockNumber() {
        const cts = this.transaction.value?.consensus_timestamp
        if (cts) {
            BlocksResponseCollector.instance.fetch(cts)
                .then((r: AxiosResponse<BlocksResponse>) => {
                        this.blockNumber.value = r.data?.blocks ? (r.data?.blocks[0].number ?? null) : null
                    }
                    , (reason: unknown) => {
                        console.warn("BlocksResponseCollector failed to find block with reason: " + reason)
                        this.blockNumber.value = null
                    })
        } else {
            this.blockNumber.value = null
        }
    }
}

function filter(transactions: Transaction[], consensusTimestamp: string|null): Transaction|null {
    let result: Transaction|null
    if (transactions.length == 1) {
        result = transactions[0]
    } else if (transactions.length >= 2) {
        if (consensusTimestamp) {
            const t = lookupTransactionWithTimestamp(transactions, consensusTimestamp)
            result = t !== null ? t : transactions[0]
        } else {
            const t = lookupScheduledTransaction(transactions)
            result = t !== null ? t : transactions[0]
        }
    } else {
        result = null
    }
    return result
}

function lookupTransactionWithTimestamp(transactions: Transaction[], consensusTimestamp: string): Transaction|null {
    let result: Transaction | null = null
    for (const t of transactions) {
        if (t.consensus_timestamp == consensusTimestamp) {
            result = t
            break
        }
    }
    return result
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
    if (t.nonce && t.nonce > 0) {
      result.push(t)
    }
  }
  return result
}

