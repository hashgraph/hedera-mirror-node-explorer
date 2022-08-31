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
import {Block} from "@/schemas/HederaSchemas";
import {computed, ComputedRef, Ref} from "vue";
import axios, {AxiosResponse} from "axios";

export class BlockLoader extends EntityLoader<Block> {

    public readonly blockLocator: Ref<string|null>

    //
    // Public
    //

    public constructor(blockLocator: Ref<string|null>) {
        super()
        this.blockLocator = blockLocator
        this.watchAndReload([this.blockLocator])
    }

    public readonly blockCount: ComputedRef<number|null> = computed(() => this.entity.value?.count ?? null)
    public readonly toTimestamp: ComputedRef<string|null> = computed(() => this.entity.value?.timestamp?.to ?? null)

    //
    // EntityLoader
    //

    protected async load(): Promise<AxiosResponse<Block>|null> {
        let result: Promise<AxiosResponse<Block>|null>
        if (this.blockLocator.value != null) {
            result = axios.get<Block>("api/v1/blocks/" + this.blockLocator.value)
        } else {
            result = Promise.resolve(null)
        }
        return result
    }
}