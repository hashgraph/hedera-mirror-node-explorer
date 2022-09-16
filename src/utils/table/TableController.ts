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

import {computed, ComputedRef, ref, Ref, watch, WatchSource, WatchStopHandle} from "vue";
import {RowBuffer} from "@/utils/table/RowBuffer";

export abstract class TableController<R, K> {

    private readonly presumedRowCount: number
    private readonly updatePeriod: number
    private readonly maxAutoUpdateCount: number
    private readonly rowBuffer: RowBuffer<R,K>
    private readonly loadingRef = ref(false)
    private readonly autoUpdateCount = ref(0)
    private readonly lastPage = ref(0)

    private watchStopHandle: WatchStopHandle|null = null
    private sessionId = 0
    private timeoutID = -1

    //
    // Public
    //

    public readonly pageSize: Ref<number>

    public readonly autoRefresh: Ref<boolean> = ref(false)

    public readonly autoStopped: ComputedRef<boolean> = computed(() => this.autoUpdateCount.value >= this.maxAutoUpdateCount)

    public readonly currentPage: Ref<number> = ref(1)

    public readonly pageRows: ComputedRef<R[]> = computed(() => {
        const rows = this.rowBuffer.rows.value
        const startIndex = (this.lastPage.value - 1) * this.pageSize.value
        const endIndex = Math.min(startIndex + this.pageSize.value, rows.length)
        return rows.slice(startIndex, endIndex)
    })

    public readonly loading: ComputedRef<boolean> = computed(() => this.loadingRef.value)

    public readonly totalRowCount: ComputedRef<number> = computed(() => {
        let result: number
        const bufferedRowCount = this.rowBuffer.rows.value.length
        if (this.rowBuffer.drained.value) {
            result = bufferedRowCount
        } else {
            const k = Math.ceil((bufferedRowCount +1) / this.presumedRowCount)
            result = k * this.presumedRowCount
        }
        return result
    })

    public readonly onPageChange = (page: number): void => {
        if (this.currentPage.value != page) {
            this.autoRefresh.value = false
            // this.loadingRef.value = true
            this.rowBuffer.load((page - 1) * this.pageSize.value, this.pageSize.value).finally(() => {
                // this.loadingRef.value = false
                this.lastPage.value = page
            })
        }
    }

    public readonly mounted: Ref<boolean> = ref(false)

    public reset(): void {
        this.rowBuffer.clear()
        if (this.mounted.value) {
            this.autoRefresh.value = true
        }
    }


    //
    // Public (to be subclassed)
    //

    public async loadAfter(key: K|null, limit: number): Promise<R[]|null> {
        throw new Error("To be subclassed: key=" + key + ", limit=" + limit)
    }

    public async loadBefore(key: K, limit: number): Promise<R[]|null> {
        throw new Error("To be subclassed: key=" + key + ", limit=" + limit)
    }

    public abstract keyFor(row: R): K

    //
    // Public (for unit testing only)
    //

    public getBufferedRows(): R[] {
        return this.rowBuffer.rows.value
    }

    //
    // Protected
    //

    protected constructor(pageSize: Ref<number>, presumedRowCount: number, updatePeriod: number, maxUpdateCount: number, maxLimit: number) {
        this.presumedRowCount = presumedRowCount
        this.updatePeriod = updatePeriod
        this.maxAutoUpdateCount = maxUpdateCount
        this.pageSize = pageSize
        this.rowBuffer = new RowBuffer<R, K>(this, maxLimit)

        watch(this.mounted, () => this.mountedDidChange(), { flush: 'sync' })
        watch(this.autoRefresh, () => this.autoRefreshDidChange(), { flush: 'sync' })
    }

    protected watchAndReload(sources: WatchSource<unknown>[]): void {
        if (this.watchStopHandle != null) {
            this.watchStopHandle()
            this.watchStopHandle = null
        }
        if (sources.length >= 1) {
            this.watchStopHandle = watch(sources, () => this.reset())
        }
        this.reset()
    }


    //
    // Private
    //

    private mountedDidChange() {
        if (this.mounted.value) {
            this.autoRefresh.value = true
        } else {
            this.autoRefresh.value = false
            this.rowBuffer.clear()
        }
    }

    private autoRefreshDidChange() {
        if (this.autoRefresh.value) {
            this.startRefreshing()
        } else {
            this.stopRefreshing()
        }
    }

    private startRefreshing(): void {
        this.currentPage.value = 1
        this.lastPage.value = 1
        this.autoUpdateCount.value = 0
        this.refresh()
    }

    private stopRefreshing() {
        if (this.timeoutID != -1) {
            window.clearTimeout(this.timeoutID)
            this.timeoutID = -1
        }
        this.sessionId += 1
    }

    private refresh() {
        // this.loadingRef.value = true
        const captureSessionId = this.sessionId
        this.rowBuffer.refresh(this.pageSize.value).finally(() => {
            if (this.sessionId == captureSessionId) {
                this.timeoutID = -1
                this.autoUpdateCount.value += 1
                // this.loadingRef.value = false
                if (this.autoUpdateCount.value < this.maxAutoUpdateCount) {
                    this.timeoutID = window.setTimeout(() => {
                        this.refresh()
                    }, this.updatePeriod)
                } else {
                    this.autoRefresh.value = false
                }

            }
        })
    }

}
