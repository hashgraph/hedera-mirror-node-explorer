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

import {TopicMessage} from "@/schemas/HederaSchemas";
import {EntityLoader} from "@/utils/loader/EntityLoader";
import axios, {AxiosResponse} from "axios";
import {computed, ComputedRef, Ref} from "vue";

export class TopicMessageLoader extends EntityLoader<TopicMessage> {

    public readonly timestamp: Ref<string|null>

    //
    // Public
    //

    public constructor(timestamp: Ref<string|null>) {
        super()
        this.timestamp = timestamp
        this.watchAndReload([this.timestamp])
    }

    public readonly message: ComputedRef<string|null> = computed(() => this.entity.value?.message ?? null)

    public readonly sequence_number: ComputedRef<number|null> = computed(() => this.entity.value?.sequence_number ?? null)

    public readonly running_hash_version: ComputedRef<number|null> = computed(() => this.entity.value?.running_hash_version ?? null)

    public readonly running_hash: ComputedRef<string|null> = computed(() => this.entity.value?.running_hash ?? null)

    //
    // EntityLoader
    //

    protected async load(): Promise<AxiosResponse<TopicMessage>|null> {
        console.log("load - timestamp: " + this.timestamp.value)
        let result: Promise<AxiosResponse<TopicMessage>|null>
        if (this.timestamp.value != null) {
            result = axios.get<TopicMessage>("api/v1/topics/messages/" + this.timestamp.value)
        } else {
            result = Promise.resolve(null)
        }
        return result
    }
}
