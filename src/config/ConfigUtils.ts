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

export function fetchBoolean(obj: any, key: string): boolean|null {
    let result: boolean|null
    if (key in obj) {
        if (typeof obj[key] === 'boolean') {
            result = obj[key]
        } else {
            throw new TypeError('Expected ' + key + ' to be boolean, got ' + typeof key)
        }
    } else {
        result = null
    }
    return result
}
//
// export function fetchNumber(obj: any, key: string): number|null {
//     let result: number|null
//     if (key in obj) {
//         if (typeof obj[key] === 'number') {
//             result = obj[key]
//         } else {
//             throw new TypeError('Expected ' + key + ' to be number, got ' + typeof key)
//         }
//     } else {
//         result = null
//     }
//     return result
// }

export function fetchString(obj: any, key: string): string|null {
    let result: string|null
    if (key in obj) {
        if (typeof obj[key] === 'string') {
            result = obj[key]
        } else {
            throw new TypeError('Expected ' + key + ' to be string, got ' + typeof key)
        }
    } else {
        result = null
    }
    return result
}

export function fetchURL(obj: any, key: string): string|null {
    const result = fetchString(obj, key)
    if (result !== null && URL.parse(result) === null) {
        throw new TypeError('Expected ' + key + ' to be URL')
    }
    return result
}
