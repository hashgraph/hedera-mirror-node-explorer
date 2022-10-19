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
import {LocationQuery} from "vue-router";


export class AutoRefreshController<R,K> extends TableSubController<R, K> {

    private sessionId = 0
    private timeoutID = -1

    //
    // TableSubController
    //

    public mount(): void {
        this.tableController.buffer.autoUpdateCount.value = 0
        this.refresh()
    }

    public unmount(): void {
        if (this.timeoutID != -1) {
            window.clearTimeout(this.timeoutID)
            this.timeoutID = -1
        }
        this.sessionId += 1
    }

    public makeRouteQuery(currentQuery: LocationQuery): LocationQuery {
        return currentQuery
    }

    //
    // Private
    //

    private refresh() {

        const pageSize = this.tableController.pageSize.value
        const rowBuffer = this.tableController.buffer
        const headKey = rowBuffer.headKey.value
        const captureSessionId = this.sessionId
        // const currentPage = this.tableController.currentPage.value
        if (headKey !== null) {
            rowBuffer.lastLoad(headKey, pageSize).then((newRows: R[] | null) => {
                if (newRows !== null && this.sessionId == captureSessionId) {
                    this.lastLoadDidComplete(newRows)
                }
            })
        } else {
            rowBuffer.tailLoad(null, pageSize, false).then((newRows: R[] | null) => {
                if (newRows !== null && this.sessionId == captureSessionId) {
                    this.tailLoadDidComplete(newRows)
                }
            })
        }
    }

    private lastLoadDidComplete(newRows: R[]): void {

        const rowBuffer = this.tableController.buffer
        rowBuffer.rows.value = rowBuffer.concatOrReplace(newRows, rowBuffer.rows.value)
        rowBuffer.startIndex.value = 0
        // rowBuffer.drained.value unchanged
        rowBuffer.shadowRowCount.value = 0
        this.tableController.currentPage.value = 1

        this.scheduleNextRefresh()
    }

    private tailLoadDidComplete(newRows: R[]): void {
        const rowBuffer = this.tableController.buffer
        rowBuffer.rows.value = newRows
        rowBuffer.startIndex.value = 0
        rowBuffer.drained.value = newRows.length < this.tableController.pageSize.value
        rowBuffer.shadowRowCount.value = 0
        this.tableController.currentPage.value = 1
        this.scheduleNextRefresh()
    }

    private scheduleNextRefresh() {
        if (this.timeoutID != -1) {
            window.clearTimeout(this.timeoutID)
            this.timeoutID = -1
        }
        const rowBuffer = this.tableController.buffer
        // this.loadingRef.value = false
        if (rowBuffer.autoUpdateCount.value < this.tableController.maxAutoUpdateCount) {
            this.timeoutID = window.setTimeout(() => {
                rowBuffer.autoUpdateCount.value += 1
                this.refresh()
            }, this.tableController.updatePeriod)
        } else {
            this.tableController.stopAutoRefresh().then()
        }
    }
}
