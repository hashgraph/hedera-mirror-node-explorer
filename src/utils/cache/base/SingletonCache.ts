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

import {Ref, ref} from "vue";

export class SingletonCache<E> {

    protected promise: Promise<E>|null = null

    //
    // Public
    //

    public async lookup(): Promise<E> {
        if (this.promise === null) {
            this.promise = this.load()
        }
        return this.promise
    }

    public clear(): void {
        this.promise = null
    }

    public makeLookup(): SingletonLookup<E> {
        return new SingletonLookup(this)
    }


    //
    // Protected (to be subclassed)
    //

    protected async load(): Promise<E> {
        throw new Error("Must be subclassed")
    }
}

export class SingletonLookup<E> {

    public readonly entity: Ref<E|null> = ref(null)

    private readonly cache: SingletonCache<E>

    constructor(cache: SingletonCache<E>) {
        this.cache = cache
    }

    public mount(): void {
        this.cache.lookup()
            .then((s: E) => this.entity.value = s)
            .catch(() => this.entity.value = null)
    }

    public unmount(): void {
        this.entity.value = null
    }
}