/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2024 Hedera Hashgraph, LLC
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

// Wraps window.setTimeout() in an async function
export async function waitFor(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}


export async function timeGuard<T>(p: Promise<T>, milliseconds: number): Promise<T> {
    const timeout = new Promise<T>((resolve, reject) => {
        window.setTimeout(() => reject(new TimeGuardError()), milliseconds)
    })
    return Promise.race<T>([p, timeout])
}

export class TimeGuardError extends Error {
    constructor() {
        super("TimeGuardError")
    }
}
