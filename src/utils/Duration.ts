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

export class Duration {

    public readonly days: number
    public readonly hours: number
    public readonly minutes: number
    public readonly seconds: number

    public constructor(days: number, hours: number, minutes: number, seconds: number) {
        this.days = days
        this.hours = hours
        this.minutes = minutes
        this.seconds = seconds
    }

    public static decompose(seconds: number): Duration {

        const days = Math.floor(seconds / 86400)
        seconds -= days * 86400

        const hours = Math.floor(seconds / 3600)
        seconds -= hours * 3600

        const minutes = Math.floor(seconds / 60)
        seconds -= minutes * 60

        return new Duration(days, hours, minutes, seconds)
    }
}

export function formatSeconds(secondCount: number|string|undefined): string {
    let result: string

    if (secondCount) {
        const seconds = typeof secondCount == "number" ? secondCount : Number.parseInt(secondCount)
        if (isNaN(seconds)) {
            result = secondCount.toString()
        } else {
            const duration = Duration.decompose(seconds)
            result = ""
            if (duration.days >= 2) {
                result += duration.days + " days "
            } else if (duration.days == 1) {
                result += "1 day "
            }
            if (duration.hours >= 2) {
                result += duration.hours + " hours "
            } else if (duration.hours == 1) {
                result += "1 hour "
            }
            if (duration.minutes >= 2) {
                result += duration.minutes + " minutes "
            } else if (duration.minutes == 1) {
                result += "1 minute "
            }
            if (duration.seconds >= 2) {
                result += duration.seconds + " seconds "
            } else if (duration.seconds == 1) {
                result += "1 second "
            }
            result = result.trim()
        }
    } else {
        result = ""
    }
    return result
}
