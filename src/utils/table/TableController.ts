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
import {LocationQuery, Router} from "vue-router";
import {TableSubController} from "@/utils/table/subcontroller/TableSubController";
import {AutoRefreshController} from "@/utils/table/subcontroller/AutoRefreshSubController";
import {PaginationController} from "@/utils/table/subcontroller/PaginationSubController";
import {fetchNumberQueryParam, fetchStringQueryParam} from "@/utils/RouteManager";
import {RowBuffer} from "@/utils/table/RowBuffer";

export abstract class TableController<R, K> {

    public readonly router: Router
    public readonly presumedRowCount: number
    public readonly updatePeriod: number
    public readonly maxAutoUpdateCount: number
    public readonly maxLimit: number
    public readonly pageParamName: string
    public readonly keyParamName: string

    private subController: TableSubController<R,K>|null = null
    private sources: WatchSource[] = []

    //
    // Public
    //

    public readonly pageSize: ComputedRef<number>

    public readonly autoRefresh: ComputedRef<boolean> = computed(
        () => this.autoRefreshRef.value)

    public readonly autoStopped: ComputedRef<boolean> = computed(
        () => this.buffer.autoUpdateCount.value >= this.maxAutoUpdateCount)

    public readonly currentPage: Ref<number> = ref(1)

    public readonly rows: ComputedRef<R[]> = computed(() => {
        const startIndex = this.buffer.startIndex.value
        const endIndex = startIndex + this.pageSize.value
        return this.buffer.rows.value.slice(startIndex, endIndex)
    })

    public readonly autoUpdateCount: ComputedRef<number> = computed(
        () => this.buffer.autoUpdateCount.value)

    public readonly totalRowCount: ComputedRef<number> = computed(
        () => this.buffer.totalRowCount.value)

    public readonly loading: Ref<boolean> = ref(false)

    public readonly paginated: ComputedRef<boolean> = computed(
        () => this.buffer.totalRowCount.value >= this.pageSize.value)

    public readonly mounted: ComputedRef<boolean> = computed(() => this.mountedRef.value)

    //
    // Public (mount / unmount)
    //

    public mount(): void {
        const pageParam = this.getPageParam()
        const keyParam = this.getKeyParam()
        if (pageParam !== null) {
            this.subController = new PaginationController(this, pageParam, keyParam)
            this.subController.mount()
        } else {
            this.subController = new AutoRefreshController(this)
            this.subController.mount()
        }
        this.autoRefreshRef.value = this.subController instanceof AutoRefreshController
        this.mountedRef.value = true
        this.startWatchingSources()
    }

    public unmount(): void {
        this.stopWatchingSources()
        this.subController?.unmount()
        this.subController = null
        this.buffer.clear()
        this.currentPage.value = 1

        this.mountedRef.value = false
        this.autoRefreshRef.value = false
    }

    public async startAutoRefresh(): Promise<void> {
        this.autoRefreshRef.value = true
        this.subController?.unmount()
        this.subController = new AutoRefreshController(this)
        this.subController.mount()
    }

    public async stopAutoRefresh(): Promise<void>  {
        this.autoRefreshRef.value = false
        this.subController?.unmount()
        this.subController = new PaginationController(this, 1, null)
        this.subController.mount()
    }

    public readonly onPageChange = (page: number): void => {
        if (this.subController instanceof PaginationController) {
            this.subController.gotoPage(page)
        } else {
            this.subController?.unmount()
            this.subController = new PaginationController(this, page, null)
            this.subController.mount()
            this.autoRefreshRef.value = false
        }
    }

    public reset(): void {

        // Clears buffer
        this.buffer.clear()
        this.currentPage.value = 1

        this.startAutoRefresh().then()
    }


    //
    // Public (to be subclassed)
    //

    public abstract keyFor(row: R): K

    public abstract stringFromKey(key: K): string

    public abstract keyFromString(s: string): K|null

    public async load(key: K|null, operator: KeyOperator, order: SortOrder, limit: number): Promise<R[]|null> {
        throw new Error("To be subclassed: key=" + key + ", operator=" + operator + ", limit=" + limit)
    }

    //
    // Public (for SubController)
    //

    public readonly buffer: RowBuffer<R,K>

    public getPageParam(): number|null {
        return fetchNumberQueryParam(this.pageParamName, this.router.currentRoute.value)
    }

    public getKeyParam(): K|null {
        const v = fetchStringQueryParam(this.keyParamName, this.router.currentRoute.value)
        return v !== null ? this.keyFromString(v) : null
    }

    public updateCurrentPage(): void {
        this.currentPage.value = this.buffer.computePage()
        this.updateRouteQuery()
    }
    //
    // Protected
    //

    protected constructor(router: Router, pageSize: ComputedRef<number>,
                          presumedRowCount: number, updatePeriod: number,
                          maxUpdateCount: number, maxLimit: number,
                          pageParamName = "p", keyParamName= "k") {
        this.router = router
        this.presumedRowCount = presumedRowCount
        this.updatePeriod = updatePeriod
        this.maxAutoUpdateCount = maxUpdateCount
        this.pageSize = pageSize
        this.maxLimit = maxLimit
        this.pageParamName = pageParamName
        this.keyParamName = keyParamName
        this.buffer = new RowBuffer<R,K>(this, presumedRowCount);
    }

    protected watchAndReload(sources: WatchSource<unknown>[]): void {
        this.sources = sources
        if (this.mounted.value) {
            this.startWatchingSources()
        }
    }

    protected updateRouteQuery(): void {
        this.router.replace({ query: this.makeRouteQuery(this.router.currentRoute.value.query) }).then()
    }

    protected makeRouteQuery(currentQuery: LocationQuery): LocationQuery {
        return this.subController !== null ? this.subController.makeRouteQuery(currentQuery) : currentQuery
    }

    //
    // Private
    //

    private watchSourcesHandle: WatchStopHandle|null = null

    private readonly autoRefreshRef: Ref<boolean> = ref(false)
    private readonly mountedRef: Ref<boolean> = ref(false)

    private startWatchingSources(): void {
        this.stopWatchingSources()
        this.watchSourcesHandle = watch(this.sources, () => this.reset())
    }

    private stopWatchingSources(): void {
        if (this.watchSourcesHandle !== null) {
            this.watchSourcesHandle()
            this.watchSourcesHandle = null
        }
    }
}

export enum KeyOperator { gt= "gt", gte = "gte", lt= "lt", lte="lte" }
export enum SortOrder { ASC = "asc", DESC = "desc" }
