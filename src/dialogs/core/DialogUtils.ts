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

import {EntityID} from "@/utils/EntityID.ts";
import {stripChecksum} from "@/schemas/MirrorNodeUtils.ts";

export enum ButtonSize {
    normal = 'normal',
    medium = 'medium',
    small = 'small'
}
export function inputEntityID(event: Event, entityID: string | null): string | null {
    let result: string | null
    let isValidInput = true
    let isValidID = false
    let isPastDash = false
    let isPreviousDigit = false
    let pastDots = 0

    const value = (event.target as HTMLInputElement).value
    for (const c of value) {
        if (c >= '0' && c <= '9') {
            if (isPastDash) {
                isValidInput = false
                break
            } else {
                isPreviousDigit = true
                isValidID = EntityID.parse(stripChecksum(value),true) !== null
            }
        } else if (c === '.') {
            pastDots++
            isValidInput = isPreviousDigit && pastDots <= 2
            isPreviousDigit = false
            isValidID = false
        } else if (c === '-') {
            isPreviousDigit = false
            if (!isValidID || isPastDash) {
                isValidInput = false
                break
            } else {
                isPastDash = true
            }
        } else if (c < 'a' || c > 'z' || !isPastDash) {
            isValidInput = false
            break
        }
    }

    if (isValidInput) {
        result = value
    } else {
        result = entityID
    }
    return result
}

export function inputAmount(event: Event, amount: string | null): string | null {
    let result: string | null
    let isValidInput = true
    let isDecimal = false

    const value = (event.target as HTMLInputElement).value
    for (const c of value) {
        if ((c >= '0' && c <= '9') || c === '.') {
            if (c === '.') {
                isValidInput = !isDecimal
                isDecimal = true
            }
        } else {
            isValidInput = false
            break
        }
    }

    if (isValidInput) {
        result = value
    } else {
        result = amount
    }
    return result
}

export function inputIntList(event: Event, list: string | null): string | null {
    let result: string | null
    let isValidInput = true
    let previousWasComma = false

    const value = (event.target as HTMLInputElement).value
    for (const c of value) {
        if ((c >= '0' && c <= '9') || c === ',') {
            if (c === ',') {
                isValidInput = !previousWasComma
                previousWasComma = true
            } else {
                previousWasComma = false
            }
        } else {
            isValidInput = false
            break
        }
    }

    if (isValidInput) {
        result = value
    } else {
        result = list
    }
    return result
}
