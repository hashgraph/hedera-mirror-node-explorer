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

import {AxiosResponse} from "axios";
import {DeferredPromise} from "@/utils/DeferredPromise";

/*
    Bookmars
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
 */

export abstract class Collector<E, K> {

    private readonly entries = new Map<K, DeferredPromise<AxiosResponse<E>>>()
    private readonly queue = new Array<K>()
    private loading = false

    //
    // Public
    //

    public fetch(key: K): Promise<AxiosResponse<E>> {

        let entry = this.entries.get(key)
        if (entry == undefined) {
            entry = new DeferredPromise<AxiosResponse<E>>()
            this.entries.set(key, entry)
            this.enqueueKey(key)
        }

        return entry
    }

    //
    // Protected
    //

    protected abstract load(key: K): Promise<AxiosResponse<E>>

    //
    // Private
    //

    private enqueueKey(key: K): void {
        this.queue.push(key)
        if (!this.loading) {
            this.loadNextKey()
        }
    }

    private loadNextKey(): void {
        const nextKey = this.queue.shift()
        if (nextKey !== undefined) {
            const entry = this.entries.get(nextKey)
            this.loading = true
            this.load(nextKey)
                .then(value => entry?.resolveNow(value), reason => entry?.rejectNow(reason))
                .finally(() => {
                    this.loading = false
                    this.loadNextKey()
                })
        }
    }

}
