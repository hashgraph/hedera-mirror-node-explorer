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


export enum ChartRange {            // Matching granularity
    day = "day",                    // => hour
    year = "year",                  // => month
    all = "all"                     // => year
}

export enum ChartGranularity {
    hour = "hour",
    day = "day",
    month = "month",
    year = "year"
}

export function computeStartDateForRange(period: ChartRange): Date {
    let result: Date
    const now = new Date()
    switch(period) {
        case ChartRange.all: {
            result = new Date(0)
            break
        }
        case ChartRange.year: {
            const y = now.getFullYear()
            const m = now.getMonth()
            result = new Date(y-1, m)
            break
        }
        case ChartRange.day: {
            result = new Date(now.getTime() - 24 * 3600 * 1000)
            break
        }
    }
    return result
}


export function computeGranularityForRange(period: ChartRange): ChartGranularity {
    let result: ChartGranularity
    switch(period) {
        default:
        case ChartRange.all:
            result = ChartGranularity.month
            break
        case ChartRange.year:
            result = ChartGranularity.month
            break
        case ChartRange.day:
            result = ChartGranularity.hour
            break
    }
    return result
}

