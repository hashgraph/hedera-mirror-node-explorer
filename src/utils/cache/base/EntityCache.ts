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

import {Ref, ref, watch, WatchStopHandle} from "vue";

export abstract class EntityCache<K, E> {

    private readonly records = new Map<K, EntityRecord<E>>()

    //
    // Public
    //

    public async lookup(key: K, forceLoad = false): Promise<E> {
        let result: Promise<E>

        const currentRecord = this.records.get(key)
        if (currentRecord && (currentRecord.isFresh() || !forceLoad)) {
            result = currentRecord.promise
        } else {
            const newPromise = this.load(key)
            this.mutate(key, newPromise)
            result = newPromise
        }

        return result
    }

    public forget(key: K): void {
        this.records.delete(key)
    }

    public clear(): void {
        this.records.clear()
    }

    public makeLookup(key: Ref<K|null>): Lookup<K, E> {
        return new Lookup<K,E>(key, this)
    }

    public contains(key: K, forceLoad = false): boolean {
        const r = this.records.get(key)
        return r ? r.isFresh() || !forceLoad : false
    }

    public isEmpty(): boolean {
        return this.records.size == 0
    }

    //
    // Protected (to be subclassed)
    //

    protected async load(key: K): Promise<E> {
        throw new Error("Must be subclassed to load " + key)
    }

    //
    // Protected (for subclasses only)
    //

    protected mutate(key: K, promise: Promise<E>): void {
        this.records.set(key, new EntityRecord(promise))
    }
}

class EntityRecord<E> {
    readonly promise: Promise<E>
    readonly time: number
    constructor(promise: Promise<E>) {
        this.promise = promise
        this.time = Date.now()
    }
    isFresh(): boolean {
        return Date.now() - this.time < 500 // ms
    }
}


export class Lookup<K,E> {

    public readonly entity: Ref<E|null> = ref(null)

    private readonly cache: EntityCache<K,E>
    private readonly key: Ref<K|null>
    private watchHandle: WatchStopHandle|null = null
    private mounted = false

    constructor(key: Ref<K|null>, cache: EntityCache<K,E>) {
        this.key = key
        this.cache = cache
    }

    public mount(): void {
        this.watchHandle = watch(this.key, this.keyDidChange, { immediate: true})
        this.mounted = true
    }

    public unmount(): void {
        if (this.watchHandle !== null) {
            this.watchHandle()
            this.watchHandle = null
        }
        this.entity.value = null
        this.mounted = false
    }

    private readonly keyDidChange = async () => {
        const key = this.key.value
        if (key !== null) {
            try {
                let newEntity: E|null
                try {
                    newEntity = await this.cache.lookup(key)
                } catch {
                    newEntity = null
                }
                if (key === this.key.value && this.mounted) {
                    this.entity.value = newEntity
                } // else this.key has changed or cache was unmounted during lookup => aborts silently
            } catch {
                this.entity.value = null
            }
        } else {
            this.entity.value = null
        }
    }
}
