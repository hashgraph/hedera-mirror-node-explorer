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

    public readonly autoRefresh: ComputedRef<boolean> = computed(() => this.autoRefreshRef.value)

    public readonly autoStopped: ComputedRef<boolean> = computed(() => this.autoUpdateCount.value >= this.maxAutoUpdateCount)

    public readonly currentPage: Ref<number> = ref(1)

    public readonly rows: ComputedRef<R[]> = computed(
        () => this.buffer.value.slice(this.startIndex.value, this.startIndex.value + this.pageSize.value))

    public readonly loading: Ref<boolean> = ref(false)

    public readonly paginated: ComputedRef<boolean> = computed(
        () => this.totalRowCount.value >= this.pageSize.value)

    public readonly totalRowCount: ComputedRef<number> = computed(() => {
        let result: number
        const allRowCount = this.shadowRowCount.value + this.buffer.value.length
        if (this.drained.value) {
            result = + allRowCount
        } else {
            const k = Math.ceil((allRowCount +1) / this.presumedRowCount)
            result = k * this.presumedRowCount
        }
        return result
    })

    public readonly mounted: ComputedRef<boolean> = computed(() => this.mountedRef.value)

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
        this.watchSourcesHandle = watch(this.sources, () => this.reset())
    }

    public unmount(): void {
        if (this.watchSourcesHandle !== null) {
            this.watchSourcesHandle()
            this.watchSourcesHandle = null
        }
        this.subController?.unmount()
        this.subController = null
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
        this.buffer.value = []
        this.startIndex.value = 0
        this.drained.value = false
        this.autoUpdateCount.value = 0
        this.shadowRowCount.value = 0
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

    public readonly buffer: Ref<R[]> = ref([])

    public readonly startIndex: Ref<number> = ref(0)

    public readonly drained: Ref<boolean> = ref(false)

    public readonly autoUpdateCount: Ref<number> = ref(0)

    public readonly shadowRowCount: Ref<number> = ref(0)
    //
    // public readonly pageParam = computed(() => {
    //     return fetchNumberQueryParam(this.pageParamName, this.router.currentRoute.value)
    // })
    //
    // public readonly keyParam = computed(() => {
    //     const v = fetchStringQueryParam(this.keyParamName, this.router.currentRoute.value)
    //     return v !== null ? this.keyFromString(v) : null
    // })

    public getPageParam(): number|null {
        return fetchNumberQueryParam(this.pageParamName, this.router.currentRoute.value)
    }

    public getKeyParam(): K|null {
        const v = fetchStringQueryParam(this.keyParamName, this.router.currentRoute.value)
        return v !== null ? this.keyFromString(v) : null
    }

    public getTailKey(): K|null {
        const bufferLength = this.buffer.value.length
        const tailRow = bufferLength >= 1 ? this.buffer.value[bufferLength-1] : null
        return tailRow !== null ? this.keyFor(tailRow) : null
    }

    public getHeadKey(): K|null {
        const bufferLength = this.buffer.value.length
        const headRow = bufferLength >= 1 ? this.buffer.value[0] : null
        return headRow !== null ? this.keyFor(headRow) : null
    }

    public getMaxStartIndex(): number {
        const pageCount = Math.floor((this.shadowRowCount.value + this.buffer.value.length) / this.pageSize.value) + 1
        return Math.max(0, (pageCount - 1) * this.pageSize.value)
    }

    public updateCurrentPage(): void {
        const i = this.shadowRowCount.value + this.startIndex.value
        this.currentPage.value = Math.floor(i / this.pageSize.value) + 1
        this.updateRouteQuery()
    }

    public getFirstVisibleKey(): K|null {
        const bufferLength = this.buffer.value.length
        const firstRow = this.startIndex.value < bufferLength ? this.buffer.value[this.startIndex.value] : null
        return firstRow !== null ? this.keyFor(firstRow) : null
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
    }

    protected watchAndReload(sources: WatchSource<unknown>[]): void {
        this.sources = sources
        if (this.mounted.value) {
            if (this.watchSourcesHandle !== null) {
                this.watchSourcesHandle()
            }
            this.watchSourcesHandle = watch(this.sources, () => this.reset())
        }
    }

    protected updateRouteQuery(): void {
        this.router.replace({ query: this.makeRouteQuery() }).then()
    }

    protected makeRouteQuery(): LocationQuery {
        return this.subController !== null ? this.subController.makeRouteQuery() : {}
    }

    //
    // Private
    //

    private watchSourcesHandle: WatchStopHandle|null = null

    private readonly autoRefreshRef: Ref<boolean> = ref(false)
    private readonly mountedRef: Ref<boolean> = ref(false)

}

export enum KeyOperator { gt= "gt", gte = "gte", lt= "lt", lte="lte" }
export enum SortOrder { ASC = "asc", DESC = "desc" }
