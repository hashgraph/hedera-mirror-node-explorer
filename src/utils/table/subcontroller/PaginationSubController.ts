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
import {LocationQuery} from "vue-router";

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

    public makeRouteQuery(currentQuery: LocationQuery): LocationQuery {
        const newKeyParam = this.tableController.buffer.computeFirstVisibleKey()
        const newPageParam = this.tableController.currentPage.value

        const result = {...currentQuery}
        if (newPageParam !== null) {
            result[this.tableController.pageParamName] = newPageParam.toString()
        } else {
            delete(result[this.tableController.pageParamName])
        }
        if (newKeyParam !== null) {
            result[this.tableController.keyParamName] = this.tableController.stringFromKey(newKeyParam)
        } else {
            delete(result[this.tableController.keyParamName])
        }
        return result
    }

    //
    // Private
    //

    private gotoPageWithKey(page: number, key: K): void {
        const pageSize = this.tableController.pageSize.value
        const rowBuffer = this.tableController.buffer
        rowBuffer.tailLoad(key, pageSize, true).then((newRows: R[] | null) => {
            if (newRows !== null) {
                rowBuffer.rows.value = newRows
                rowBuffer.drained.value = newRows.length < pageSize
                rowBuffer.startIndex.value = 0
                rowBuffer.shadowRowCount.value = (page - 1) * pageSize
                this.tableController.updateCurrentPage()
            }
        })
    }

    private gotoPageWithoutKey(page: number): void {

        const pageSize = this.tableController.pageSize.value
        const rowBuffer = this.tableController.buffer

        const nextStartIndex = (page - 1) * pageSize
        const nextEndIndex = nextStartIndex + pageSize
        const shadowRowCount = rowBuffer.shadowRowCount.value
        const bufferLength = rowBuffer.rows.value.length

        const headKey = rowBuffer.headKey.value
        const tailKey = rowBuffer.tailKey.value

        if (headKey === null || tailKey === null) {

            // Buffer is empty
            rowBuffer.tailLoad(null, pageSize, false).then((newRows: R[] | null) => {
                if (newRows !== null) {
                    rowBuffer.rows.value = rowBuffer.rows.value.concat(newRows)
                    rowBuffer.drained.value = newRows.length < pageSize
                    rowBuffer.startIndex.value = Math.min(nextStartIndex - shadowRowCount, rowBuffer.maxStartIndex.value)
                    // rowBuffer.shadowRowCount.value unchanged
                    this.tableController.updateCurrentPage()
                }
            })

        } else if (nextStartIndex < shadowRowCount) {

            // We need to load rows at buffer head      :/
            const rowCount = shadowRowCount - nextStartIndex
            rowBuffer.headLoad(headKey, rowCount).then((newRows: R[] | null) => {
                if (newRows !== null) {
                    rowBuffer.rows.value = newRows.concat(rowBuffer.rows.value)
                    rowBuffer.startIndex.value = 0
                    rowBuffer.shadowRowCount.value -= rowCount
                    // rowBuffer.drained.value unchanged
                    this.tableController.updateCurrentPage()
                }
            })

        } else if (nextEndIndex > bufferLength + shadowRowCount) {

            // We need to load rows at buffer tail      :\
            const rowCount = nextEndIndex - bufferLength - shadowRowCount
            rowBuffer.tailLoad(tailKey, rowCount, false).then((newRows: R[] | null) => {
                if (newRows !== null) {
                    rowBuffer.rows.value = rowBuffer.rows.value.concat(newRows)
                    rowBuffer.drained.value = newRows.length < rowCount
                    rowBuffer.startIndex.value = Math.min(nextStartIndex - shadowRowCount, rowBuffer.maxStartIndex.value)
                    // rowBuffer.shadowRowCount.value unchanged
                    this.tableController.updateCurrentPage()
                }
            })

        } else {
            // We have all the rows already loaded      :)
            rowBuffer.startIndex.value = nextStartIndex - shadowRowCount
            // rowBuffer.buffer.value unchanged
            // rowBuffer.drained.value unchanged
            // rowBuffer.shadowRowCount.value unchanged
            this.tableController.updateCurrentPage()
        }

    }
}

