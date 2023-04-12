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
import {Block} from "@/schemas/HederaSchemas";
import {EthereumHash} from "@/utils/EthereumHash";
import {BlockByNbCache} from "@/utils/cache/BlockByNbCache";
import {BlockByHashCache} from "@/utils/cache/BlockByHashCache";
import {TransactionHash} from "@/utils/TransactionHash";
import {PathParam} from "@/utils/PathParam";

export class BlockLocParser {

    public readonly blockLoc: Ref<string|null>
    public readonly block: Ref<Block|null> = ref(null)

    private readonly watchHandle: Ref<WatchStopHandle|null> = ref(null)
    private readonly loadCounter: Ref<number> = ref(0)

    //
    // Public
    //

    public constructor(blockLoc: Ref<string|null>) {
        this.blockLoc = blockLoc
    }

    public mount(): void {
        this.watchHandle.value = watch(this.blockLocObj, this.blockLocObjDidChange, {immediate: true})
    }

    public unmount(): void {
        if (this.watchHandle.value !== null) {
            this.watchHandle.value()
            this.watchHandle.value = null
        }
        this.block.value = null
    }

    public readonly blockNumber: ComputedRef<number|null>
        = computed(() => this.block.value?.number ?? null)
    public readonly blockCount: ComputedRef<number|null>
        = computed(() => this.block.value?.count ?? null)
    public readonly toTimestamp: ComputedRef<string|null>
        = computed(() => this.block.value?.timestamp?.to ?? null)

    public readonly errorNotification: Ref<string|null> = computed(() => {
        let result: string|null
        const l = this.blockLoc.value
        const o = this.blockLocObj.value
        const b = this.block.value
        if (l !== null && this.watchHandle.value !== null) {
            if (o !== null) {
                if (b !== null || this.loadCounter.value == 0) {
                    result = null
                } else {
                    if (typeof o == "number") {
                        result = "Block with number " + o + " was not found"
                    } else { // l instanceof EthereumHash
                        result = "Block with hash " + o.toString() + " was not found"
                    }
                }
            } else {
                result = "Invalid block number or hash: " + l
            }
        } else {
            result = null
        }
        return result
    })

    //
    // Private
    //

    private readonly blockLocObjDidChange = async () => {
        const l = this.blockLocObj.value
        if (l !== null) {
            try {
                if (typeof l == "number") {
                    this.block.value = await BlockByNbCache.instance.lookup(l)
                } else { // l instanceof EthereumHash
                    this.block.value = await BlockByHashCache.instance.lookup(l.toString())
                }
            } catch(error) {
                this.block.value = null
            } finally {
                this.loadCounter.value += 1
            }
        } else {
            this.block.value = null
        }
    }

    private readonly blockLocObj = computed(() => {
        let result: number|TransactionHash|EthereumHash|null
        if (this.blockLoc.value !== null) {
            result = PathParam.parseBlockLoc(this.blockLoc.value)
        } else {
            result = null
        }
        return result
    })
}

