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

export function makeExchangeFormat(id: string): string {
    let result: string
    const re = /^\d{1,10}\.\d{1,10}\.\d{1,10}@\d{1,10}(\.\d{1,9})?$/

    if (re.test(id)) {
        result = id.replace('@', '-')
        const lastDot  = result.lastIndexOf('.')
        result = result.substring(0, lastDot) + '-' + result.substring(lastDot + 1)
    } else {
        result = id
    }
    return result
}
