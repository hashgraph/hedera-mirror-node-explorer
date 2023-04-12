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
import {Transaction} from "@/schemas/HederaSchemas";
import {Timestamp} from "@/utils/Timestamp";
import {TransactionHash} from "@/utils/TransactionHash";
import {EthereumHash} from "@/utils/EthereumHash";
import {TransactionByTsCache} from "@/utils/cache/TransactionByTsCache";
import {TransactionByHashCache} from "@/utils/cache/TransactionByHashCache";
import {TransactionID} from "@/utils/TransactionID";
import {TransactionByIdCache} from "@/utils/cache/TransactionByIdCache";
import {ContractResultByHashCache} from "@/utils/cache/ContractResultByHashCache";

export class TransactionLocParser {

    public readonly transactionLoc: Ref<string|null>

    private watchHandle: Ref<WatchStopHandle|null> = ref(null)
    private readonly transactionRef: Ref<Transaction | null> = ref(null)
    private readonly loadCounter: Ref<number> = ref(0)

    //
    // Public
    //

    public constructor(transactionLoc: Ref<string|null>) {
        this.transactionLoc = transactionLoc
    }

    public mount(): void {
        this.watchHandle.value = watch(this.transactionLocObj, this.transactionLocObjDidChange, {immediate: true})
    }

    public unmount(): void {
        if (this.watchHandle.value !== null) {
            this.watchHandle.value()
            this.watchHandle.value = null
        }
        this.transactionRef.value = null
        this.loadCounter.value = 0
    }

    public readonly transaction: ComputedRef<Transaction|null> = computed(() => {
        return this.transactionRef.value
    })

    public consensusTimestamp: Ref<string|null> = computed(() => {
        return this.transactionRef.value?.consensus_timestamp ?? null
    })

    public transactionHash: Ref<string|null> = computed(() => {
        return this.transactionRef.value?.transaction_hash ?? null
    })

    public transactionId: Ref<string|null> = computed(() => {
        return this.transactionRef.value?.transaction_id ?? null
    })

    public errorNotification: Ref<string|null> = computed(() => {
        let result: string|null

        const l = this.transactionLoc.value
        const o = this.transactionLocObj.value
        const t = this.transactionRef.value
        if (l !== null && this.watchHandle.value !== null) {
            if (o !== null) {
                if (t !== null) {
                    if (t.result == "SUCCESS") {
                        result = null
                    } else {
                        result = t.result ?? null
                    }
                } else if (this.loadCounter.value >= 1) {
                    if (o instanceof Timestamp) {
                        result = "Transaction with timestamp " + o + " was not found"
                    } else if (o instanceof TransactionHash) {
                        result = "Transaction with hash " + o + " was not found"
                    } else if (o instanceof EthereumHash) {
                        result = "Transaction with ethereum hash " + o + " was not found"
                    } else {
                        result = null
                    }
                } else { // this.loadCounter.value === 0 => no loading yet
                    result = null
                }
            } else {
                result = "Invalid transaction id, timestamp or hash: " + this.transactionLoc.value
            }
        } else {
            result = null
        }

        return result
    })

    //
    // Private
    //

    private readonly transactionLocObjDidChange = async () => {
        const o = this.transactionLocObj.value
        if (o !== null) {
            try {
                if (o instanceof Timestamp) {
                    this.transactionRef.value = await TransactionByTsCache.instance.lookup(o.toString())
                } else if (o instanceof TransactionHash) {
                    this.transactionRef.value = await TransactionByHashCache.instance.lookup(o.toString())
                } else if (o instanceof TransactionID) {
                    this.transactionRef.value = await TransactionByIdCache.instance.lookup(o.toString(false))
                } else { // => o instanceof EthereumHash
                    this.transactionRef.value = await this.lookupTransactionByResult(o.toString())
                }
            } catch {
                this.transactionRef.value = null
            } finally {
                this.loadCounter.value += 1
            }
        } else {
            this.transactionRef.value = null
        }
    }

    private readonly transactionLocObj = computed(() => {
        let result: Timestamp|TransactionHash|TransactionID|EthereumHash|null
        const l = this.transactionLoc.value
        if (l !== null) {
            result = Timestamp.parse(l) ?? TransactionHash.parse(l) ?? TransactionID.parse(l) ?? EthereumHash.parse(l)
        } else {
            result = null
        }
        return result
    })

    private async lookupTransactionByResult(ethereumHash: string): Promise<Transaction|null> {
        let result: Transaction|null
        const contractResult = await ContractResultByHashCache.instance.lookup(ethereumHash)
        const consensusTimestamp = contractResult?.timestamp ?? null
        if (consensusTimestamp !== null) {
            result = await TransactionByTsCache.instance.lookup(consensusTimestamp)
        } else {
            result = null
        }

        return Promise.resolve(result)
    }
}

