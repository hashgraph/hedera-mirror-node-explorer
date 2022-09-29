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

    public gotoPage(page: number, key: K|null): void {
        if (key !== null) {
            this.gotoPageWithKey(page, key)
        } else {
            this.gotoPageWithoutKey(page)
        }
    }

    //
    // TableSubController
    //

    mount(): void {
        this.gotoPage(this.initialPage, this.initialKey)
    }

    unmount(): void {
    }

    //
    // Private
    //

    private updateCurrentPage(): void {
        const i = this.tableController.shadowRowCount.value + this.tableController.startIndex.value
        this.tableController.currentPage.value = Math.floor(i / this.tableController.pageSize.value) + 1
    }

    private updateKeyAndPageParams() {
        const newKeyParam = this.tableController.getFirstVisibleKey()
        if (newKeyParam !== null) {
            const newPageParam = this.tableController.currentPage.value
            this.tableController.updateKeyAndPageParams(newPageParam, newKeyParam).then()
        }
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
                this.updateCurrentPage()
                this.updateKeyAndPageParams()
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
                    this.updateCurrentPage()
                    this.updateKeyAndPageParams()
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
                    this.updateCurrentPage()
                    this.updateKeyAndPageParams()
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
                    this.updateCurrentPage()
                    this.updateKeyAndPageParams()
                }
            })

        } else {
            // We have all the rows already loaded      :)
            this.tableController.startIndex.value = nextStartIndex - shadowRowCount
            // this.tableController.buffer.value unchanged
            // this.tableController.drained.value unchanged
            // this.tableController.shadowRowCount.value unchanged
            this.updateCurrentPage()
            this.updateKeyAndPageParams()
        }

    }
}

