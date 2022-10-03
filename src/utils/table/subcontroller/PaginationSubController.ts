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


import {TableSubController} from "@/utils/table/subcontroller/TableSubController";
import {TableController} from "@/utils/table/TableController";
import {LocationQuery, LocationQueryValue} from "vue-router";

export class PaginationController<R,K> extends TableSubController<R, K> {

    private readonly initialPage: number
    private readonly initialKey: K|null

    //
    // Public
    //

    public constructor(tableController: TableController<R, K>, page: number, key: K|null) {
        super(tableController)
        this.initialPage = page
        this.initialKey = key
    }

    public gotoPage(page: number): void {
        this.gotoPageWithoutKey(page)
    }

    //
    // TableSubController
    //

    mount(): void {
        if (this.initialKey !== null) {
            this.gotoPageWithKey(this.initialPage, this.initialKey)
        } else {
            this.gotoPageWithoutKey(this.initialPage)
        }
    }

    unmount(): void {
        /* Nothing right now */
    }

    public makeRouteQuery(): LocationQuery {
        const newKeyParam = this.tableController.getFirstVisibleKey()
        const newPageParam = this.tableController.currentPage.value

        const result = {} as Record<string, LocationQueryValue>
        if (newPageParam !== null) {
            result[this.tableController.pageParamName] = newPageParam.toString()
        }
        if (newKeyParam !== null) {
            result[this.tableController.keyParamName] = this.tableController.stringFromKey(newKeyParam)
        }
        return result
    }

    //
    // Private
    //

    private gotoPageWithKey(page: number, key: K): void {
        const pageSize = this.tableController.pageSize.value
        this.tailLoad(key, pageSize, true).then((newRows: R[] | null) => {
            if (newRows !== null) {
                this.tableController.buffer.value = newRows
                this.tableController.drained.value = newRows.length < pageSize
                this.tableController.startIndex.value = 0
                this.tableController.shadowRowCount.value = (page - 1) * pageSize
                this.tableController.updateCurrentPage()
            }
        })
    }

    private gotoPageWithoutKey(page: number): void {

        const pageSize = this.tableController.pageSize.value
        const nextStartIndex = (page - 1) * pageSize
        const nextEndIndex = nextStartIndex + pageSize
        const shadowRowCount = this.tableController.shadowRowCount.value
        const bufferLength = this.tableController.buffer.value.length

        const headKey = this.tableController.getHeadKey()
        const tailKey = this.tableController.getTailKey()

        if (headKey === null || tailKey === null) {

            // Buffer is empty
            this.tailLoad(null, pageSize, false).then((newRows: R[] | null) => {
                if (newRows !== null) {
                    this.tableController.buffer.value = this.tableController.buffer.value.concat(newRows)
                    this.tableController.drained.value = newRows.length < pageSize
                    this.tableController.startIndex.value = Math.min(nextStartIndex - shadowRowCount, this.tableController.getMaxStartIndex())
                    // this.tableController.shadowRowCount.value unchanged
                    this.tableController.updateCurrentPage()
                }
            })

        } else if (nextStartIndex < shadowRowCount) {

            // We need to load rows at buffer head      :/
            const rowCount = shadowRowCount - nextStartIndex
            this.headLoad(headKey, rowCount).then((newRows: R[] | null) => {
                if (newRows !== null) {
                    this.tableController.buffer.value = newRows.concat(this.tableController.buffer.value)
                    this.tableController.startIndex.value = 0
                    this.tableController.shadowRowCount.value -= rowCount
                    // this.tableController.drained.value unchanged
                    this.tableController.updateCurrentPage()
                }
            })

        } else if (nextEndIndex > bufferLength + shadowRowCount) {

            // We need to load rows at buffer tail      :\
            const rowCount = nextEndIndex - bufferLength - shadowRowCount
            this.tailLoad(tailKey, rowCount, false).then((newRows: R[] | null) => {
                if (newRows !== null) {
                    this.tableController.buffer.value = this.tableController.buffer.value.concat(newRows)
                    this.tableController.drained.value = newRows.length < rowCount
                    this.tableController.startIndex.value = Math.min(nextStartIndex - shadowRowCount, this.tableController.getMaxStartIndex())
                    // this.tableController.shadowRowCount.value unchanged
                    this.tableController.updateCurrentPage()
                }
            })

        } else {
            // We have all the rows already loaded      :)
            this.tableController.startIndex.value = nextStartIndex - shadowRowCount
            // this.tableController.buffer.value unchanged
            // this.tableController.drained.value unchanged
            // this.tableController.shadowRowCount.value unchanged
            this.tableController.updateCurrentPage()
        }

    }
}

