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
import {AxiosResponse} from "axios";
import {PaginationModeController} from "@/utils/table/PaginationModeController";
import {RefreshModeController} from "@/utils/table/RefreshModeController";

export abstract class TableController<E, R> {

    public readonly pageSize: number

    private readonly paginationController: PaginationModeController<E, R>
    private readonly refreshController: RefreshModeController<E, R>
    private watchStopHandle: WatchStopHandle|null = null

    //
    // Public
    //

    public readonly autoRefresh: Ref<boolean>

    public readonly autoStopped: ComputedRef<boolean>

    public readonly currentPage: Ref<number> = ref(1)

    public readonly rows: ComputedRef<R[]> = computed(
        () => this.autoRefresh.value ? this.refreshController.rows.value : this.paginationController.rows.value)

    public readonly loading: ComputedRef<boolean> = computed(
        () => this.autoRefresh.value ? this.refreshController.loading.value : this.paginationController.loading.value)

    public readonly totalRowCount: ComputedRef<number> = computed(
        () => this.autoRefresh.value ? this.refreshController.totalRowCount.value : this.paginationController.totalRowCount.value)

    public readonly onPageChange = (page: number): void => {
        console.log("onPageChange(" + page + ")")
        this.autoRefresh.value = false
        this.paginationController.fetch(page - 1) // First page number is 1
    }

    //
    // Public (to be subclassed)
    //

    public async loadLatest(previous: E|null): Promise<AxiosResponse<E>|null> {
        throw new Error("To be subclassed (" + previous + ")")
    }

    public abstract nextURL(response: E): string|null

    public abstract fetchRows(response: E): R[]

    public abstract mergeResponse(current: E, latest: E): E

    //
    // Protected
    //

    protected constructor(pageSize: number, presumedRowCount: number, updatePeriod: number, maxUpdateCount: number) {
        this.pageSize = pageSize
        this.refreshController = new RefreshModeController<E, R>(this, presumedRowCount, updatePeriod, maxUpdateCount)
        this.paginationController = new PaginationModeController<E, R>(this, presumedRowCount)
        this.autoRefresh = this.refreshController.started
        this.autoStopped = this.refreshController.autoStopped

        watch(this.autoRefresh, () => this.autoRefreshDidChange())
        this.autoRefreshDidChange()

        watch(this.paginationController.currentIndex, () => {
            const newPage = this.paginationController.currentIndex.value + 1
            this.currentPage.value = Math.max(1, newPage)
        })
    }

    protected watchAndReload(sources: WatchSource<unknown>[]): void {
        if (this.watchStopHandle != null) {
            this.watchStopHandle()
            this.watchStopHandle = null
        }
        if (sources.length >= 1) {
            this.watchStopHandle = watch(sources, () => this.sourcesDidChange())
        }
        this.sourcesDidChange()
    }


    //
    // Private
    //

    private autoRefreshDidChange() {
        if (this.autoRefresh.value) {
            // this.refreshController starts automatically
            this.paginationController.clear()
        } else {
            // this.refreshController stops automatically
            this.paginationController.fetch(0)
        }
    }

    private sourcesDidChange() {
        this.refreshController.clear()
        this.paginationController.clear()
    }

}