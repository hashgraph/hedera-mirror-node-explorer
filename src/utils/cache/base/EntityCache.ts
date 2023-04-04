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

import {computed, ComputedRef, Ref, ref, watch, WatchStopHandle} from "vue";

export abstract class EntityCache<K, E> {

    protected readonly promises = new Map<K, Promise<E>>()

    //
    // Public
    //

    public async lookup(key: K): Promise<E> {
        let result: Promise<E>

        const currentPromise = this.promises.get(key)
        if (currentPromise) {
            result = currentPromise
        } else {
            const newPromise = this.load(key)
            this.promises.set(key, newPromise)
            result = newPromise
        }

        return result
    }

    public forget(key: K): void {
        this.promises.delete(key)
    }

    public clear(): void {
        this.promises.clear()
    }

    public ref(key: Ref<K|null>): ComputedRef<E|null> {
        const result: Ref<E|null> = ref(null)
        const updateResult = () => {
            if (key.value !== null) {
                this.lookup(key.value).then(
                    (r: E|null) => {
                        result.value = r
                    }, () => {
                        result.value = null
                    })
            } else {
                result.value = null
            }
        }
        watch(key, updateResult, { immediate: true})
        return computed(() => result.value)
    }

    public makeLookup(key: Ref<K|null>): Lookup<K, E> {
        return new Lookup<K,E>(key, this)
    }

    //
    // Protected (to be subclassed)
    //

    protected async load(key: K): Promise<E> {
        throw new Error("Must be subclassed to load " + key)
    }
}


export class Lookup<K,E> {

    public readonly entity: Ref<E|null> = ref(null)

    private readonly cache: EntityCache<K,E>
    private readonly key: Ref<K|null>
    private watchHandle: WatchStopHandle|null = null

    constructor(key: Ref<K|null>, cache: EntityCache<K,E>) {
        this.key = key
        this.cache = cache
    }

    public mount(): void {
        this.watchHandle = watch(this.key, this.keyDidChange, { immediate: true})
    }

    public unmount(): void {
        if (this.watchHandle !== null) {
            this.watchHandle()
            this.watchHandle = null
        }
        this.entity.value = null
    }

    private keyDidChange = async () => {
        if (this.key.value !== null) {
            try {
                this.entity.value = await this.cache.lookup(this.key.value)
            } catch {
                this.entity.value = null
            }
        } else {
            this.entity.value = null
        }
    }
}