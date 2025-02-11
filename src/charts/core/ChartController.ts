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

    private readonly chart: Ref<Chart|null> = ref(null)
    private readonly error: Ref<unknown> = ref(null)
    private readonly building: Ref<boolean> = ref(false)
    private watchHandle: WatchStopHandle|null = null

    //
    // Public
    //

    public mount(): void {
        this.watchHandle = watch(this.canvas, this.canvasDidChange, { immediate: true });
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
    // Protected (to be subclassed)
    //

    protected async makeChart(canvas: HTMLCanvasElement): Promise<Chart> {
        throw "to be subclassed"
    }

    //
    // Private
    //

    private readonly canvasDidChange =  async (newValue: HTMLCanvasElement|null) => {
        if (this.chart.value !== null) {
            this.chart.value.destroy()
            this.chart.value = null
        }
        if (newValue !== null) {
            this.building.value = true
            try {
                this.chart.value = await this.makeChart(newValue)
                this.error.value = null
            } catch(error) {
                this.chart.value = null
                this.error.value = error
            } finally {
                this.building.value = false
            }
        }
    }
}
