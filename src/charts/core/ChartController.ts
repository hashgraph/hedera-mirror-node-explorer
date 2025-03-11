// SPDX-License-Identifier: Apache-2.0

import {computed, Ref, ref, watch, WatchStopHandle} from "vue";
import {Chart, ChartConfiguration} from 'chart.js/auto';
import {ThemeController} from "@/components/ThemeController.ts";
import {RouteManager} from "@/utils/RouteManager.ts";
import {ChartRange} from "@/charts/core/ChartRange.ts";

export enum ChartState {
    unsupported,
    loading,
    error,
    empty,
    ok,
}

export abstract class ChartController<M> {

    public readonly canvas: Ref<HTMLCanvasElement | null> = ref(null)
    public readonly range: Ref<ChartRange>
    public readonly latestMetric: Ref<M | null> = ref(null)

    private metrics: M[] | null = null
    private chart: Chart | null = null
    private readonly error: Ref<unknown> = ref(null)
    private readonly building: Ref<boolean> = ref(false)
    private watchHandles: WatchStopHandle[] = []

    //
    // Public
    //

    protected constructor(
        public readonly chartTitle: string,
        public readonly themeController: ThemeController,
        public readonly routeManager: RouteManager,
        public readonly supportedRanges: ChartRange[] = []) {
        this.range = ref(this.supportedRanges.length >= 1 ? this.supportedRanges[0] : ChartRange.year)
    }

    public mount(): void {
        this.watchHandles = [
            watch([this.range, this.routeManager.currentNetworkEntry], this.updateMetrics, {immediate: true}),
            watch([this.canvas, this.themeController.darkSelected], this.updateChart, {immediate: true}),
        ]
    }

    public unmount(): void {
        this.metrics = null
        this.latestMetric.value = null
        if (this.chart !== null) {
            this.chart.destroy()
            this.chart = null
        }
        this.error.value = null
        this.watchHandles.forEach(w => w())
        this.watchHandles = []
    }

    public readonly state = computed<ChartState>(() => {
        let result: ChartState
        if (!this.isSupported()) {
            result = ChartState.unsupported
        } else if (this.building.value) {
            result = ChartState.loading
        } else if (this.error.value !== null) {
            result = ChartState.error
        } else {
            const metricCount = this.metrics?.length ?? 0
            result = metricCount == 0 ? ChartState.empty : ChartState.ok
        }
        return result
    })

    public readonly errorExtra = computed(() => {
        let result: string | null
        if (this.state.value === ChartState.error) {
            result = JSON.stringify(this.error.value)
        } else {
            result = null
        }
        return result
    })

    public readonly latestMetricDate = computed(() => {
        const dateFormat = this.makeDateFormat()
        const latestMetric = this.latestMetric.value
        const result = latestMetric !== null ? this.getMetricDate(latestMetric) : null
        return result !== null ? dateFormat.format(result) : null
    })

    public isRangeSupported(range: ChartRange): boolean {
        return this.supportedRanges.length === 0 || this.supportedRanges.includes(range)
    }

    //
    // To be subclassed
    //


    public isSupported(): boolean {
        return true
    }

    public abstract getMetricDate(metric: M): Date | null


    protected async loadData(range: ChartRange): Promise<LoadedData<M>> {
        throw "to be subclassed"
    }


    protected async transformMetrics(metrics: M[], range: ChartRange): Promise<M[]> {
        // No transformation by default
        return metrics
    }

    protected abstract makeChartConfig(metrics: M[], range: ChartRange): ChartConfiguration

    //
    // Private
    //

    private readonly updateMetrics = async () => {
        this.building.value = true
        try {
            if (this.isSupported()) {
                const loadedData = await this.loadData(this.range.value)
                const rawMetrics = loadedData.metrics.length >= 1 ? loadedData.metrics : null
                this.metrics = rawMetrics !== null
                    ? await this.transformMetrics(rawMetrics, this.range.value)
                    : null
                this.latestMetric.value = loadedData.latestMetric
                this.error.value = null
            } else {
                this.metrics = null
                this.latestMetric.value = null
                this.error.value = null
            }
        } catch (error) {
            this.metrics = null
            this.latestMetric.value = null
            this.error.value = error
        } finally {
            this.building.value = false
            this.updateChart()
        }
    }

    private readonly updateChart = () => {
        if (this.chart !== null) {
            this.chart.destroy()
            this.chart = null
            // destroy() resets display to "none" => we restore
            this.canvas.value!.style.display = "block"
        }
        if (this.canvas.value !== null && this.metrics !== null) {
            try {
                const chartConfig = this.makeChartConfig(this.metrics, this.range.value)
                this.chart = new Chart(this.canvas.value, chartConfig)
            } catch (error) {
                this.chart = null
            }
        } // else leaves this.chart to null
    }

    private makeDateFormat(): Intl.DateTimeFormat {
        const dateOptions: Intl.DateTimeFormatOptions = {
            // weekDay: "short",
            day: "numeric",
            month: "numeric",
            year: "numeric",
        }
        return new Intl.DateTimeFormat("en-US", dateOptions)
    }
}

export class LoadedData<M> {
    constructor(public readonly metrics: M[], public readonly latestMetric: M | null) {
    }
}
