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
import {NavigationFailure, Router} from "vue-router";
import {TableSubController} from "@/utils/table/subcontroller/TableSubController";
import {AutoRefreshController} from "@/utils/table/subcontroller/AutoRefreshSubController";
import {PaginationController} from "@/utils/table/subcontroller/PaginationSubController";

export abstract class TableControllerV3<R, K> {

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

    public readonly autoRefresh: Ref<boolean> = ref(false)

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

    public readonly mounted: Ref<boolean> = ref(false)



    public readonly onPageChange = (page: number): void => {
        this.autoRefresh.value = false // => this.subController becomes a PaginationSubController instance
        if (this.subController instanceof PaginationController) {
            this.subController.gotoPage(page)
        } else {
            console.warn("Page change ignored because sub controller is not the expected one")
        }
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

    public getFirstVisibleKey(): K|null {
        const bufferLength = this.buffer.value.length
        const firstRow = this.startIndex.value < bufferLength ? this.buffer.value[this.startIndex.value] : null
        return firstRow !== null ? this.keyFor(firstRow) : null
    }

    public getMaxStartIndex(): number {
        const pageCount = Math.floor((this.shadowRowCount.value + this.buffer.value.length) / this.pageSize.value) + 1
        return Math.max(0, (pageCount - 1) * this.pageSize.value)
    }

    public getKeyParam(): K|null {
        let result: K|null
        const v = this.router.currentRoute.value.query[this.keyParamName]
        if (typeof v == "string") {
            result = this.keyFromString(v)
        } else {
            result = null
        }
        return result
    }

    public getPageParam(): number|null {
        let result: number|null
        const v = this.router.currentRoute.value.query[this.pageParamName]
        if (typeof v == "string") {
            const i = parseInt(v)
            result = isNaN(i) || i < 1 ? null : i
        } else {
            result = null
        }
        return result
    }

    public async updateKeyAndPageParams(page: number|null, key: K|null): Promise<void | NavigationFailure | undefined> {

        const newQuery = { ...this.router.currentRoute.value.query}
        const pageParam = page !== null ? page.toString() : null
        const keyParam = key !== null ? this.stringFromKey(key) : null
        if (pageParam !== null) {
            newQuery[this.pageParamName] = pageParam
        } else {
            delete newQuery[this.pageParamName]
        }
        if (keyParam !== null) {
            newQuery[this.keyParamName] = keyParam
        } else {
            delete newQuery[this.keyParamName]
        }
        return this.router.replace({ query: newQuery })
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

        watch(this.mounted, () => this.mountedDidChange(), { flush: 'sync' })
        //
        // watch(this.buffer, () => console.log("TableControllerV3.buffer.length = " + this.buffer.value.length))
        // watch(this.rows, () => console.log("TableControllerV3.rows.length = " + this.rows.value.length))
        // watch(this.startIndex, () => console.log("TableControllerV3.startIndex = " + this.startIndex.value))
    }

    protected watchAndReload(sources: WatchSource<unknown>[]): void {
        this.sources = sources
        if (this.mounted.value) {
            this.remountSubController()
        }
    }


    //
    // Private
    //

    private watchAutoRefreshHandle: WatchStopHandle|null = null
    private watchRouteHandle: WatchStopHandle|null = null
    private watchSourcesHandle: WatchStopHandle|null = null

    private mountedDidChange() {

        if (this.mounted.value) {

            const pageParam = this.getPageParam()
            const keyParam = this.getKeyParam()
            this.autoRefresh.value = pageParam == null || keyParam == null
            this.subController = this.autoRefresh.value ? new AutoRefreshController(this) : new PaginationController(this)
            this.subController.mount()

            this.watchAutoRefreshHandle = watch(this.autoRefresh, () => this.remountSubController(), { flush: 'sync' })
            this.watchRouteHandle = watch(this.router.currentRoute, () => this.routeDidChange(), { flush: 'sync' })
            this.watchSourcesHandle = watch(this.sources, () => this.remountSubController())

        } else {

            if (this.watchAutoRefreshHandle !== null) {
                this.watchAutoRefreshHandle()
                this.watchAutoRefreshHandle = null
            }
            if (this.watchRouteHandle !== null) {
                this.watchRouteHandle()
                this.watchRouteHandle = null
            }
            if (this.watchSourcesHandle !== null) {
                this.watchSourcesHandle()
                this.watchSourcesHandle = null
            }

            this.subController?.unmount()
            this.subController = null
        }
    }

    private routeDidChange(): void {
        const pageParam = this.getPageParam()
        const keyParam = this.getKeyParam()
        console.log("TableControllerV3.routeDidChange: keyParam=" + keyParam + ", pageParam=" + pageParam)
    }

    private remountSubController() {
        this.subController?.unmount()
        this.subController = this.autoRefresh.value ? new AutoRefreshController(this) : new PaginationController(this)
        this.subController?.mount()
    }
}

export enum KeyOperator { gt= "gt", gte = "gte", lt= "lt", lte="lte" }
export enum SortOrder { ASC = "asc", DESC = "desc" }
