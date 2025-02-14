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
import {Chart, ChartConfiguration} from 'chart.js/auto';

export enum ChartState {
    loading,
    error,
    ok,
}

export abstract class ChartController<M> {

    public readonly canvas: Ref<HTMLCanvasElement|null> = ref(null)
    public readonly range: Ref<ChartRange>

    private chart: Chart|null = null
    private readonly error: Ref<unknown> = ref(null)
    private readonly building: Ref<boolean> = ref(false)
    private watchHandle: WatchStopHandle|null = null

    //
    // Public
    //

    public constructor(public readonly chartTitle: string, public readonly supportedRanges: ChartRange[] = []) {
        this.range = ref(this.supportedRanges.length >= 1 ? this.supportedRanges[0] : ChartRange.year)
    }

    public mount(): void {
        this.watchHandle = watch([this.canvas, this.range], this.updateChart, { immediate: true })
    }

    public unmount(): void {
        if (this.chart !== null) {
            this.chart.destroy()
            this.chart = null
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

    public isRangeSupported(range: ChartRange): boolean {
        return this.supportedRanges.length === 0 || this.supportedRanges.includes(range)
    }


    //
    // Protected (to be subclassed)
    //

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async loadData(range: ChartRange): Promise<M[]> {
        throw "to be subclassed"
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected transformMetrics(metrics: M[], range: ChartRange): M[] {
        // No transformation by default
        return metrics
    }

    protected abstract makeChartConfig(metrics: M[], range: ChartRange): ChartConfiguration


    //
    // Private
    //

    private readonly updateChart =  async () => {
        if (this.chart !== null) {
            this.chart.destroy()
            this.chart = null
        }
        if (this.canvas.value !== null) {
            this.building.value = true
            try {
                const data = await this.loadData(this.range.value)
                this.chart = this.makeChart(this.canvas.value, data, this.range.value)
                this.error.value = null
            } catch(error) {
                this.chart = null
                this.error.value = error
            } finally {
                this.building.value = false
            }
        }
    }

    private makeChart(canvas: HTMLCanvasElement, metrics: M[], range: ChartRange): Chart {
        const aggregatedMetrics = this.transformMetrics(metrics, range)
        const chartConfig = this.makeChartConfig(aggregatedMetrics, range)
        return  new Chart(canvas,  chartConfig);
    }

}

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



export function computeStartDateForRange(period: ChartRange): string {
    let result: string
    const now = new Date()
    switch(period) {
        case ChartRange.all: {
            const d = new Date(0)
            result = d.toISOString()
            break
        }
        case ChartRange.year: {
            const y = now.getFullYear()
            const m = now.getMonth()
            const d = new Date(y-1, m)
            result = d.toISOString()
            break
        }
        case ChartRange.day: {
            const d = new Date(now.getTime() - 24 * 3600 * 1000)
            result = d.toISOString()
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

