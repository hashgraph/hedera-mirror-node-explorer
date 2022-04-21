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

export class DeferredPromise<T> extends Promise<T> {

    private readonly resolveCB: (value: T) => void
    private readonly rejectCB: (reason?: unknown) => void

    //
    // Public
    //

    public constructor(executor?: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: unknown) => void) => void) {
        let resolveT: ((value: T) => void) | undefined
        let rejectT: ((reason?: unknown) => void) | undefined
        super((resolve, reject) => {
            resolveT = resolve
            rejectT = reject
            if (executor) {
                executor(resolve, reject)
            }
        })
        if (resolveT && rejectT) {
            this.resolveCB = resolveT
            this.rejectCB = rejectT
        } else {
            throw "DeferredPromise initialization failure"
        }
    }

    public resolveNow(value: T): void {
        this.resolveCB(value)
    }

    public rejectNow(reason?: unknown): void {
        this.rejectCB(reason)
    }
}
