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

import {computed, Ref, ref, watch, WatchStopHandle} from "vue";
import {Chart} from 'chart.js';

export enum ChartState {
    loading,
    error,
    ok,
}

export abstract class ChartController {

    public readonly canvas: Ref<HTMLCanvasElement|null> = ref(null)
    public readonly period: Ref<ChartPeriod> = ref(ChartPeriod.all)

    private readonly chart: Ref<Chart|null> = ref(null)
    private readonly error: Ref<unknown> = ref(null)
    private readonly building: Ref<boolean> = ref(false)
    private watchHandle: WatchStopHandle|null = null

    //
    // Public
    //

    public constructor(public readonly chartTitle: string) {}

    public mount(): void {
        this.watchHandle = watch([this.canvas, this.period], this.updateChart, { immediate: true })
    }

    public unmount(): void {
        if (this.chart.value !== null) {
            this.chart.value.destroy()
            this.chart.value = null
        }
        this.error.value = null
        if (this.watchHandle !== null) {
            this.watchHandle()
            this.watchHandle = null
        }
    }

    public readonly state = computed<ChartState>(() => {
        let result: ChartState
        if (this.building.value) {
            result = ChartState.loading
        } else if (this.error.value !== null) {
            result = ChartState.error
        } else {
            result = ChartState.ok
        }
        return result
    })

    public readonly errorExtra = computed(() => {
        let result: string|null
        if (this.state.value === ChartState.error) {
            result = JSON.stringify(this.error.value)
        } else {
            result = null
        }
        return result
    })


    //
    // Public/protected (to be subclassed)
    //

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public isRangeSupported(range: ChartPeriod): boolean {
        return true
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async makeChart(canvas: HTMLCanvasElement, period: ChartPeriod): Promise<Chart> {
        throw "to be subclassed"
    }


    //
    // Private
    //

    private readonly updateChart =  async () => {
        if (this.chart.value !== null) {
            this.chart.value.destroy()
            this.chart.value = null
        }
        if (this.canvas.value !== null) {
            this.building.value = true
            try {
                this.chart.value = await this.makeChart(this.canvas.value, this.period.value)
                this.error.value = null
            } catch(error) {
                console.error(error)
                this.chart.value = null
                this.error.value = error
            } finally {
                this.building.value = false
            }
        }
    }
}

export enum ChartPeriod {           // Matching granularity
    hour = "hour",                  // => minute
    day = "day",                    // => hour
    year = "year",                  // => month
    all = "all"                     // => year
}

export enum ChartGranularity {
    minute = "minute",
    hour = "hour",
    day = "day",
    month = "month",
    year = "year"
}



export function computeStartDateForPeriod(period: ChartPeriod): string {
    let result: string
    const now = new Date()
    switch(period) {
        case ChartPeriod.all: {
            const d = new Date(0)
            result = d.toISOString()
            break
        }
        case ChartPeriod.year: {
            const y = now.getFullYear()
            const m = now.getMonth()
            const d = new Date(y-1, m)
            result = d.toISOString()
            break
        }
        case ChartPeriod.day: {
            const d = new Date(now.getTime() - 24 * 3600 * 1000)
            result = d.toISOString()
            break
        }
        case ChartPeriod.hour: {
            const d = new Date(now.getTime() - 3600 * 1000)
            result = d.toISOString()
            break
        }
    }
    return result
}


export function computeGranularityForPeriod(period: ChartPeriod): ChartGranularity {
    let result: ChartGranularity
    switch(period) {
        default:
        case ChartPeriod.all:
            result = ChartGranularity.month
            break
        case ChartPeriod.year:
            result = ChartGranularity.month
            break
        case ChartPeriod.day:
            result = ChartGranularity.hour
            break
        case ChartPeriod.hour:
            result = ChartGranularity.minute
            break
    }
    return result
}

