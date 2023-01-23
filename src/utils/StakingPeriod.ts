/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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

export class StakingPeriod {

    public readonly currentDate: Date
    public readonly startTime: number
    public readonly endTime: number
    public readonly durationMin: number
    public readonly elapsedMin: number
    public readonly remainingMin: number

    private static PERIOD_24H = 24 * 60 * 60 * 1000

    public constructor(startTimeInSec: number | null = null, endTimeInSec: number | null = null) {

        this.currentDate = new Date()
        if (startTimeInSec === null || isNaN(startTimeInSec)) {
            this.startTime = Date.UTC(this.currentDate.getUTCFullYear(), this.currentDate.getUTCMonth(), this.currentDate.getUTCDate())
        } else {
            this.startTime = startTimeInSec * 1000
        }
        if (endTimeInSec === null || isNaN(endTimeInSec)) {
            this.endTime = this.startTime + StakingPeriod.PERIOD_24H
        } else {
            this.endTime = endTimeInSec * 1000
        }

        this.durationMin = (this.endTime - this.startTime) / 1000 / 60
        this.elapsedMin = Math.floor((this.currentDate.getTime() - this.startTime) / 1000 / 60)
        this.remainingMin = Math.ceil((this.endTime - this.currentDate.getTime()) / 1000 / 60)
    }
}
