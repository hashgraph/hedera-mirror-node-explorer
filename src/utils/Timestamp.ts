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

export class Timestamp {

    public readonly seconds: number
    public readonly nanoseconds: number

    //
    // Public
    //

    public static parse(timestamp: string): Timestamp|null {
        let result: Timestamp|null

        const i = timestamp.indexOf(".")
        const s = i != -1 ? timestamp.slice(0, i) : null
        const n = i != -1 ? timestamp.slice(i+1) : null
        if (s !== null && n !== null && n.indexOf(".") == -1) {
            const seconds = parseInt(s)
            const nanoseconds = parseInt(n)
            if (isNaN(seconds) || isNaN(nanoseconds)) {
                result = null
            } else {
                result = new Timestamp(seconds, nanoseconds)
            }
        } else {
            result = null
        }

        return result
    }

    public toString(): string {
        return this.seconds + "." + this.nanoseconds.toString().padStart(9, "0")
    }

    //
    // Private
    //

    private constructor(seconds: number, nanoseconds: number) {
        this.seconds = seconds
        this.nanoseconds = nanoseconds
    }
}
