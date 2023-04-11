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

import {computed, ComputedRef, ref, Ref, watch, WatchStopHandle} from "vue";
import {TokenRelationship, Transaction, TransactionType} from "@/schemas/HederaSchemas";
import {EntityDescriptor} from "@/utils/EntityDescriptor";
import {computeNetAmount} from "@/utils/TransactionTools";
import {base64DecToArr, byteToHex} from "@/utils/B64Utils";
import {systemContractRegistry} from "@/schemas/SystemContractRegistry";
import {normalizeTransactionId} from "@/utils/TransactionID";
import {ContractByIdCache} from "@/utils/cache/ContractByIdCache";
import {BlockByTsCache} from "@/utils/cache/BlockByTsCache";
import {TokenRelationshipCache} from "@/utils/cache/TokenRelationshipCache";

export class TransactionAnalyzer {

    public readonly transaction: Ref<Transaction|null>
    public readonly contractId: Ref<string|null> = ref(null)
    public readonly blockNumber: Ref<number|null> = ref(null)
    public readonly entityDescriptor = ref(EntityDescriptor.DEFAULT_ENTITY_DESCRIPTOR)
    public readonly tokenRelationships: Ref<TokenRelationship[]> = ref([])
    private readonly watchHandles: WatchStopHandle[] = []

    //
    // Public
    //

    public constructor(transaction: Ref<Transaction|null>) {
        this.transaction = transaction
    }

    public mount(): void {
        this.watchHandles.push(
            watch(this.transaction, this.transactionDidChange, {immediate: true})
        )
    }

    public unmount(): void {
        this.watchHandles.map((wh) => wh())
        this.watchHandles.splice(0)
    }

    public readonly consensusTimestamp = computed(() => this.transaction.value?.consensus_timestamp ?? null)

    public readonly transactionType = computed(() => this.transaction.value?.name ?? null)

    public readonly entityId = computed(() => this.transaction.value?.entity_id ?? null)

    public readonly result: ComputedRef<string|null> = computed(
        () => this.transaction.value?.result ?? null)

    public readonly hasSucceeded: ComputedRef<boolean> = computed(() => this.result.value == "SUCCESS")

    public readonly netAmount: ComputedRef<number> = computed(
        () => this.transaction.value !== null ? computeNetAmount(this.transaction.value) : 0)

    public readonly maxFee: ComputedRef<number> = computed(() => {
        const result = this.transaction.value?.max_fee ? Number.parseFloat(this.transaction.value?.max_fee) : 0
        return isNaN(result) ? -9999 : result
    })

    public readonly formattedTransactionId: ComputedRef<string|null> = computed(() => {
        const transaction_id = this.transaction.value?.transaction_id
        return transaction_id ? normalizeTransactionId(transaction_id, true) : null
    })

    public readonly formattedHash: ComputedRef<string|null> = computed( () => {
        const hash = this.transaction.value?.transaction_hash
        return hash ? byteToHex(base64DecToArr(hash)) : null
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


    public readonly isEthereumTransaction = computed(
        () => this.transactionType.value == TransactionType.ETHEREUMTRANSACTION)

    public readonly isTokenAssociation = computed(
        () => this.transactionType.value === TransactionType.TOKENASSOCIATE)

    public readonly tokens = computed( () => {
        const result: string[] = []
        for (const r of this.tokenRelationships.value) {
            if (r.token_id) {
                result.push(r.token_id)
            }
        }
        return result
    })


    //
    // Private
    //

    private readonly transactionDidChange = async() => {

        if (this.transaction.value !== null) {
            const entityId = this.transaction.value?.entity_id ?? null
            if (entityId !== null) {
                switch(this.transaction.value.name) {
                    case TransactionType.CONTRACTCALL:
                    case TransactionType.ETHEREUMTRANSACTION: {
                        const contract = await ContractByIdCache.instance.lookup(entityId)
                        this.contractId.value = contract ? entityId : null
                        break
                    }
                    case TransactionType.CONTRACTCREATEINSTANCE:
                    case TransactionType.CONTRACTUPDATEINSTANCE:
                    case TransactionType.CONTRACTDELETEINSTANCE:
                        this.contractId.value = entityId
                        break
                    default:
                        this.contractId.value = null
                }

                this.entityDescriptor.value = await EntityDescriptor.makeEntityDescriptor(this.transaction.value)

            } else {
                this.contractId.value = null
            }
            const consensusTimestamp = this.transaction.value?.consensus_timestamp ?? null
            if (consensusTimestamp !== null) {
                const block = await BlockByTsCache.instance.lookup(consensusTimestamp)
                this.blockNumber.value = block?.number ?? 0
            } else {
                this.blockNumber.value = null
            }
            if (this.isTokenAssociation.value &&  this.consensusTimestamp.value !== null && this.entityId.value !== null) {
                const r = await TokenRelationshipCache.instance.lookup(this.entityId.value)
                this.tokenRelationships.value = this.filterTokenRelationships(r ?? [], this.consensusTimestamp.value)
            } else {
                this.tokenRelationships.value = []
            }
        } else {
            this.contractId.value = null
            this.blockNumber.value = null
            this.tokenRelationships.value = []
        }
    }

    private filterTokenRelationships(relationships: TokenRelationship[], createdTimestamp: string): TokenRelationship[] {
        const result: TokenRelationship[] = []
        for (const r of relationships) {
            if (r.created_timestamp === createdTimestamp && r.token_id) {
                result.push(r)
            }
        }
        return result
    }
}
