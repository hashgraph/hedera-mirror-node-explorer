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

export class PaginationController<R,K> extends TableSubController<R, K> {

    //
    // Public
    //

    public gotoPage(page: number): void {

        const pageSize = this.tableController.pageSize.value
        const nextStartIndex = (page - 1) * pageSize
        const nextEndIndex = nextStartIndex + pageSize

        if (nextStartIndex < this.tableController.shadowRowCount.value) {
            // We need to load rows at buffer head      :/
            const headKey = this.tableController.getHeadKey()
            if (headKey !== null) {
                const rowCount = this.tableController.shadowRowCount.value - nextStartIndex
                this.headLoad(headKey, rowCount).then((newRows: R[] | null) => {
                    if (newRows !== null) {
                        this.tableController.buffer.value = newRows.concat(this.tableController.buffer.value)
                        this.tableController.startIndex.value = Math.min(nextStartIndex, this.tableController.buffer.value.length)
                        this.tableController.shadowRowCount.value -= newRows.length
                        // this.tableController.drained.value unchanged
                        this.updateKeyAndPageParams()
                    }
                })
            } else {
                console.warn("bug: headKey should not be null")
                // Emergency code
                this.tableController.buffer.value = []
                this.tableController.startIndex.value = 0
                this.tableController.shadowRowCount.value = 0
                this.tableController.drained.value = false
                this.updateKeyAndPageParams()
            }
        } else if (nextEndIndex > this.tableController.buffer.value.length) {
            // We need to load rows at buffer tail      :\
            const tailKey = this.tableController.getTailKey()
            const rowCount = nextEndIndex - this.tableController.buffer.value.length
            this.tailLoad(tailKey, rowCount).then((newRows: R[] | null) => {
                if (newRows !== null) {
                    this.tableController.buffer.value = this.tableController.buffer.value.concat(newRows)
                    this.tableController.drained.value = newRows.length < rowCount
                    this.tableController.startIndex.value = Math.min(nextStartIndex, this.tableController.buffer.value.length)
                    // this.tableController.shadowRowCount.value unchanged
                    this.updateKeyAndPageParams()
                }
            })
        } else {
            // We have all the rows already loaded      :)
            this.tableController.startIndex.value = nextStartIndex
            // this.tableController.buffer.value unchanged
            // this.tableController.drained.value unchanged
            // this.tableController.shadowRowCount.value unchanged
            this.updateKeyAndPageParams()
        }
    }

    //
    // TableSubController
    //

    mount(): void {
        const pageParam = this.tableController.getPageParam()
        const keyParam = this.tableController.getKeyParam()
        if (pageParam !== null && keyParam !== null) {
            this.tableController.startIndex.value = 0
            this.tableController.shadowRowCount.value = this.tableController.pageSize.value * (pageParam - 1)
        }
        this.gotoPage(1)

    }

    unmount(): void {
        this.tableController.updateKeyAndPageParams(null, null).then()
    }

    //
    // Private
    //

    private updateKeyAndPageParams() {
        const firstRow = this.tableController.buffer.value[this.tableController.startIndex.value]
        const newKeyParam = firstRow !== null ? this.tableController.keyFor(firstRow) : null
        const newPageParam = firstRow !== null ? this.tableController.currentPage.value : null
        this.tableController.updateKeyAndPageParams(newPageParam, newKeyParam).then()
    }
}

