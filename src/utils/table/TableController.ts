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

import {computed, ComputedRef, ref, Ref, watch, WatchSource, WatchStopHandle} from "vue";
import {LocationQuery, Router} from "vue-router";
import {fetchNumberQueryParam, fetchStringQueryParam} from "@/utils/RouteManager";
import {RowBuffer} from "@/utils/table/RowBuffer";
import axios, {AxiosError} from "axios";
import {PlayPauseController} from "@/components/PlayPauseButton.vue";

export abstract class TableController<R, K> implements PlayPauseController {

    public static readonly SLOW_REFRESH_PERIOD = 60000 // 1 min
    public static readonly SLOW_REFRESH_COUNT = 10 //

    public static readonly FAST_REFRESH_PERIOD = 5000 // 5 sec
    public static readonly FAST_REFRESH_COUNT = 25

    public readonly router: Router
    public readonly presumedRowCount: number
    public readonly updatePeriod: number
    public readonly maxAutoUpdateCount: number
    public readonly maxLimit: number
    public readonly pageParamName: string
    public readonly keyParamName: string

    private readonly buffer: RowBuffer<R, K>
    private sources: WatchSource[] = []

    //
    // Public
    //

    public pageSize: Ref<number>

    public readonly currentPage: Ref<number> = ref(1)

    public readonly rows: ComputedRef<R[]> = computed(() => {
        const startIndex = this.buffer.startIndex.value
        const endIndex = startIndex + this.pageSize.value
        return this.buffer.rows.value.slice(startIndex, endIndex)
    })

    public readonly refreshCount: ComputedRef<number> = computed(
        () => this.refreshCountRef.value)

    public readonly totalRowCount: ComputedRef<number> = computed(
        () => this.buffer.totalRowCount.value)

    public readonly loading: Ref<boolean> = ref(false)

    public readonly paginated: ComputedRef<boolean> = computed(
        () => this.buffer.totalRowCount.value >= this.pageSize.value)

    public readonly mounted: ComputedRef<boolean> = computed(() => this.mountedRef.value)

    public readonly showPageSizeSelector = computed(() => this.buffer.totalRowCount.value > 5)

    //
    // Public (mount / unmount)
    //

    public mount(): void {
        this.mountedRef.value = true
        this.startWatchingSources()
        const pageParam = this.getPageParam()
        if (pageParam !== null) {
            this.moveBufferToPage(pageParam, this.getKeyParam()).catch(this.errorHandler)
        } else {
            this.refreshBuffer().catch(this.errorHandler)
        }
    }

    public unmount(): void {
        this.mountedRef.value = false
        this.stopWatchingSources()
        if (this.autoRefreshRef.value) {
            this.abortRefreshBuffer()
        } else {
            this.abortMoveBufferToPage()
        }
        this.buffer.clear()
        // No call to this.bufferDidChange() to keep route query untouched
    }

    public readonly onPageChange = (page: number): void => {
        if (this.mountedRef.value) {
            if (this.autoRefresh.value) {
                this.stopAutoRefresh(page)
            } else {
                this.moveBufferToPage(page, null).catch(this.errorHandler)
            }
        }
    }

    public reset(): void {
        this.buffer.clear()
        this.bufferDidChange().catch(this.errorHandler)
    }

    public async refresh(): Promise<void> {
        this.buffer.clear()
        await this.buffer.refresh()
        await this.bufferDidChange()
    }

    //
    // PlayPauseController
    //

    public autoRefresh: ComputedRef<boolean> = computed(() => this.autoRefreshRef.value)

    public startAutoRefresh(): void {
        if (this.mountedRef.value && !this.autoRefreshRef.value) {
            this.autoRefreshRef.value = true
            this.refreshCountRef.value = 0
            this.currentPage.value = 1 // This prevents o-table to invoke onPageChange() (and stops auto refresh !)
            this.abortMoveBufferToPage()
            this.refreshBuffer().catch(this.errorHandler)
        }
    }

    public stopAutoRefresh(page = 1): void {
        if (this.mountedRef.value && this.autoRefreshRef.value) {
            this.abortRefreshBuffer()
            this.moveBufferToPage(page, null).catch(this.errorHandler)
        }
    }

    public readonly onKeyChange = (key: K): void => {
        if (this.mountedRef.value) {
            if (this.autoRefresh.value) {
                this.stopAutoRefresh(1)
            }
            this.moveBufferToPage(1, key).catch(this.errorHandler)
        }
    }

    //
    // Public (to be subclassed)
    //

    public abstract keyFor(row: R): K

    public abstract stringFromKey(key: K): string

    public abstract keyFromString(s: string): K | null

    public async load(key: K | null, operator: KeyOperator, order: SortOrder, limit: number): Promise<R[] | null> {
        throw new Error("To be subclassed: key=" + key + ", operator=" + operator + ", order=" + order + ", limit=" + limit)
    }

    //
    // Public (utilities)
    //

    public static invertSortOrder(order: SortOrder): SortOrder {
        return order == SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC
    }

    public static invertKeyOperator(operator: KeyOperator): KeyOperator {
        let result: KeyOperator
        switch (operator) {
            case KeyOperator.gt:
                result = KeyOperator.lt
                break
            case KeyOperator.gte:
                result = KeyOperator.lte
                break
            case KeyOperator.lt:
                result = KeyOperator.gt
                break
            case KeyOperator.lte:
                result = KeyOperator.gte
                break
        }
        return result
    }

    //
    // Public (for testing purpose)
    //

    public getAbortedRefreshCounter(): number {
        return this.buffer.getAbortedRefreshCounter()
    }

    public getAbortedMoveToPageCounter(): number {
        return this.buffer.getAbortedMoveToPageCounter()
    }


    //
    // Protected
    //

    protected constructor(router: Router, pageSize: Ref<number>,
                          presumedRowCount: number, updatePeriod: number,
                          maxUpdateCount: number, maxLimit: number,
                          pageParamName = "p", keyParamName = "k") {
        this.router = router
        this.presumedRowCount = presumedRowCount
        this.updatePeriod = updatePeriod
        this.maxAutoUpdateCount = maxUpdateCount
        this.pageSize = pageSize
        this.maxLimit = maxLimit
        this.pageParamName = pageParamName
        this.keyParamName = keyParamName
        this.buffer = new RowBuffer<R, K>(this, presumedRowCount);
    }

    protected watchAndReload(sources: WatchSource<unknown>[]): void {
        this.sources = sources
        if (this.mounted.value) {
            this.startWatchingSources()
        }
    }

    protected makeRouteQuery(): LocationQuery {

        const newPageParam = this.autoRefresh.value ? null : this.buffer.computePage()
        const newKeyParam = this.autoRefresh.value ? null : this.buffer.computeFirstVisibleKey()

        const result = {...this.router.currentRoute.value.query}
        if (newPageParam !== null) {
            result[this.pageParamName] = newPageParam.toString()
        } else {
            delete (result[this.pageParamName])
        }
        if (newKeyParam !== null) {
            result[this.keyParamName] = this.stringFromKey(newKeyParam)
        } else {
            delete (result[this.keyParamName])
        }
        return result
    }

    protected async updateRouteQuery(): Promise<void> {
        const failure = await this.router.replace({query: this.makeRouteQuery()})
        if (failure && failure.type != 8 && failure.type != 16) {
            console.warn(failure.message)
        }
        return Promise.resolve()
    }

    //
    // Private
    //

    private readonly autoRefreshRef: Ref<boolean> = ref(false)
    private readonly mountedRef: Ref<boolean> = ref(false)


    private readonly errorHandler = (reason: unknown): void => {
        console.log("reason=" + reason)
        if (axios.isAxiosError(reason)) {
            const axiosError = reason as AxiosError
            console.log("url=" + axiosError.config?.url)
        }
    }

    private getPageParam(): number | null {
        return fetchNumberQueryParam(this.pageParamName, this.router.currentRoute.value)
    }

    private getKeyParam(): K | null {
        const v = fetchStringQueryParam(this.keyParamName, this.router.currentRoute.value)
        return v !== null ? this.keyFromString(v) : null
    }


    //
    // Private (xxxWatchingSources)
    //

    private watchSourcesHandle: WatchStopHandle | null = null

    private startWatchingSources(): void {
        this.stopWatchingSources()
        this.watchSourcesHandle = watch(this.sources, () => this.sourcesDidChange())
    }

    private stopWatchingSources(): void {
        if (this.watchSourcesHandle !== null) {
            this.watchSourcesHandle()
            this.watchSourcesHandle = null
        }
    }

    private sourcesDidChange(): void {
        if (this.mountedRef.value) {
            if (this.autoRefreshRef.value) {
                this.abortRefreshBuffer()
            } else {
                this.abortMoveBufferToPage()
            }
            this.buffer.clear()
            this.bufferDidChange().finally(() => {
                if (this.autoRefreshRef.value) {
                    this.refreshBuffer().catch(this.errorHandler)
                } else {
                    this.startAutoRefresh()
                }
            })
        }
    }

    //
    // Private (refreshBuffer)
    //

    private readonly refreshCountRef: Ref<number> = ref(0)
    private timeoutID = -1

    private async refreshBuffer(): Promise<void> {
        this.autoRefreshRef.value = true
        await this.buffer.refresh()
        await this.bufferDidChange()
        if (this.refreshCountRef.value < this.maxAutoUpdateCount) {
            this.timeoutID = window.setTimeout(() => {
                this.refreshCountRef.value += 1
                this.refreshBuffer().catch(this.errorHandler)
            }, this.updatePeriod)
        } else {
            this.stopAutoRefresh()
        }
    }

    private abortRefreshBuffer(): void {
        this.autoRefreshRef.value = false
        if (this.timeoutID != -1) {
            window.clearTimeout(this.timeoutID)
            this.timeoutID = -1
        }
        this.buffer.abortRefresh()
    }

    //
    // Private (moveBufferToPage)
    //

    private async moveBufferToPage(page: number, key: K | null): Promise<void> {
        this.autoRefreshRef.value = false
        await this.buffer.moveToPage(page, key)
        await this.bufferDidChange()
        return Promise.resolve()
    }

    private abortMoveBufferToPage(): void {
        this.buffer.abortMoveBufferToPage()
    }

    //
    // Private (bufferDidChange)
    //

    private async bufferDidChange(): Promise<void> {
        this.currentPage.value = this.buffer.computePage()
        await this.updateRouteQuery()
        return Promise.resolve()
    }
}

export enum KeyOperator { gt = "gt", gte = "gte", lt = "lt", lte = "lte" }

export function getNonStrictOperator(operator: KeyOperator): KeyOperator {
    let result
    switch (operator) {
        case KeyOperator.gt:
        case KeyOperator.gte:
            result = KeyOperator.gte
            break
        case KeyOperator.lt:
        case KeyOperator.lte:
            result = KeyOperator.lte
            break
    }
    return result
}

export enum SortOrder { ASC = "asc", DESC = "desc" }
