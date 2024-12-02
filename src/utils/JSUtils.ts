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

export function fetchJSValue(obj: unknown, attributeName: string): unknown|null {
    let result: unknown|null
    if (typeof obj === 'object' && obj !== null && attributeName in obj) {
        result = obj[attributeName as keyof typeof obj]
    } else {
        result = null
    }
    return result
}

export function fetchJSObject(obj: unknown, attributeName: string): object|null {
    const v = fetchJSValue(obj, attributeName)
    return typeof v == "object" && v !== null ? v : null
}

export function fetchJSArray(obj: unknown, attributeName: string): unknown[]|null {
    const v = fetchJSValue(obj, attributeName)
    return Array.isArray(v) ? v : null
}

export function fetchJSString(obj: unknown, attributeName: string): string|null {
    const v = fetchJSValue(obj, attributeName)
    return typeof v == "string" ? v : null
}
