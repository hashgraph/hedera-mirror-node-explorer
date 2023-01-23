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

import {AxiosResponse} from "axios";
import {Ref, ref, watch} from "vue";

/*
    Bookmars
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
 */

export abstract class Collector<E, K> {

    private readonly entries = new Map<K, Promise<AxiosResponse<E>>>()
    private tailKey: K|null = null
    private tailEntry: Promise<AxiosResponse<E>>|null = null

    //
    // Public
    //

    public fetch(key: K): Promise<AxiosResponse<E>> {

        let result = this.entries.get(key)
        if (result == undefined) {
            if (this.tailKey === null) {
                result = this.loadAndUpdateTail(key)
            } else if (this.tailEntry !== null) {
                // Naively I wrote the line below but it does not work ... it's the reverse ... strange.
                // result = this.tailEntry.finally(() => this.loadAndUpdateTail(key))
                result = this.loadAndUpdateTail(key).finally(() => this.tailEntry)
            } else {
                // Emergency code
                result = this.load(key)
            }
            this.tailKey = key
            this.tailEntry = result
            this.entries.set(this.tailKey, this.tailEntry)
        }

        return result
    }

    public ref(key: Ref<K|null>): Ref<E|null> {
        const result: Ref<E|null> = ref(null)
        const updateResult = () => {
            if (key.value !== null) {
                const fullfill = (r: AxiosResponse<E>) => {
                    result.value = r.data
                }
                const reject = (/*reason: unknown*/) => {
                    result.value = null
                }
                this.fetch(key.value).then(fullfill, reject)
            } else {
                result.value = null
            }
        }
        watch(key, updateResult, { immediate: true})
        return result
    }

    public clear(): void {
        this.entries.clear()
    }

    //
    // Protected
    //

    protected abstract load(key: K): Promise<AxiosResponse<E>>


    //
    // Private
    //

    private loadAndUpdateTail(key: K): Promise<AxiosResponse<E>> {
        const fullfill = (r: AxiosResponse<E>) => {
            if (this.tailKey == key) {
                this.tailKey = null
                this.tailEntry = null
            }
            return Promise.resolve(r)
        }
        const reject = (reason: unknown) => {
            if (this.tailKey == key) {
                this.tailKey = null
                this.tailEntry = null
            }
            return Promise.reject(reason)
        }
        return this.load(key).then(fullfill, reject)
    }
}
