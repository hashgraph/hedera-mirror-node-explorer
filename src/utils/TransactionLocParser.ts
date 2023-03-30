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

    private readonly watchHandles: WatchStopHandle[] = []
    private readonly transactionRef: Ref<Transaction | null> = ref(null)
    private readonly cacheError: Ref<unknown|null> = ref(null)
    private readonly notFound: Ref<boolean> = ref(false)

    //
    // Public
    //

    public constructor(transactionLoc: Ref<string|null>) {
        this.transactionLoc = transactionLoc
    }

    public mount(): void {
        this.watchHandles.push(
            watch(this.transactionLoc, this.transactionLocDidChange, {immediate: true})
        )
    }

    public unmount(): void {
        this.watchHandles.map((wh) => wh())
        this.watchHandles.splice(0)
        this.transactionRef.value = null
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
        const cacheError = this.cacheError.value
        if (cacheError instanceof BadParamError) {
            result = "Invalid transaction id, timestamp or hash: " + this.transactionLoc.value
        } else if (this.notFound.value) {
            const o = this.transactionLocObj.value
            if (o instanceof Timestamp) {
                result = "Transaction with timestamp " + o.toString() + " was not found"
            } else if (o instanceof TransactionHash) {
                result = "Transaction with hash " + o.toString() + " was not found"
            } else if (o instanceof EthereumHash) {
                result = "Transaction with ethereum hash " + o.toString() + " was not found"
            } else {
                result = null
            }
        } else if (this.hasSucceeded.value) {
            result = null
        } else {
            result = this.transactionRef.value?.result ?? null
        }
        return result
    })

    //
    // Private
    //

    private readonly transactionLocDidChange = () => {
        const l = this.transactionLoc.value
        if (l !== null) {
            const o = this.transactionLocObj.value
            const fullfill = (t: Transaction|null) => {
                this.transactionRef.value = t
                this.cacheError.value = null
                this.notFound.value = t == null
            }
            const reject = (reason: unknown) => {
                this.transactionRef.value = null
                this.cacheError.value = reason
                this.notFound.value = false
            }
            if (o instanceof Timestamp) {
                TransactionByTsCache.instance.lookup(o.toString()).then(fullfill).catch(reject)
            } else if (o instanceof TransactionHash) {
                TransactionByHashCache.instance.lookup(o.toString()).then(fullfill).catch(reject)
            } else if (o instanceof TransactionID) {
                TransactionByIdCache.instance.lookup(o.toString(false)).then(fullfill).catch(reject)
            } else if (o instanceof EthereumHash) {
                this.lookupTransactionByResult(o.toString()).then(fullfill).catch(reject)
            } else {
                this.transactionRef.value = null
                this.cacheError.value = new BadParamError()
                this.notFound.value = false
            }
         } else {
            this.transactionRef.value = null
            this.cacheError.value = null
            this.notFound.value = false
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

    private readonly hasSucceeded = computed(() => {
        return this.transactionRef.value?.result == "SUCCESS"
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

class BadParamError extends Error {}

