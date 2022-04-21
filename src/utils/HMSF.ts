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

export class HMSF {

    public readonly hour: string
    public readonly minute: string
    public readonly second: string
    public readonly fractionalSecond: string
    public readonly dayPeriod: string

    public static forceUTC = false // For unit testing purpose

    public static extract(secondSinceEpoch: number, locale: string): HMSF {

        const timeOptions: Intl.DateTimeFormatOptions = {
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: true,
            timeZone: HMSF.forceUTC ? "UTC" : undefined
        }

        const timeFormat = new Intl.DateTimeFormat([locale], timeOptions)
        const secondCount = Math.floor(secondSinceEpoch)
        const secondFrac = secondSinceEpoch - secondCount

        const parts = timeFormat.formatToParts(secondCount * 1000)
        const hourPart = HMSF.findPart(parts, "hour", "?")
        const minutePart = HMSF.findPart(parts, "minute", "?")
        const secondPart = HMSF.findPart(parts, "second", "?")
        const dayPeriodPart = HMSF.findPart(parts, "dayPeriod", "?")

        const fractionalSeconds = secondFrac.toString().concat("00000").slice(2, 6)

        return new HMSF(hourPart, minutePart, secondPart, fractionalSeconds, dayPeriodPart)

    }

    //
    // Private
    //

    private constructor(hour: string, minute: string, second: string, fractionalSecond: string, dayPeriod: string) {
        this.hour =  hour
        this.minute = minute
        this.second = second
        this.fractionalSecond = fractionalSecond
        this.dayPeriod = dayPeriod
    }

    private static findPart(parts: Array<Intl.DateTimeFormatPart>, targetPart: Intl.DateTimeFormatPartTypes, fallback: string): string {
        let result: string = fallback
        for (const p of parts) {
            if (p.type == targetPart) {
                result = p.value
            }
        }
        return result
    }

}
