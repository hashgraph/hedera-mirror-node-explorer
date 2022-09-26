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


export class AutoRefreshController<R,K> extends TableSubController<R, K> {

    private sessionId = 0
    private timeoutID = -1

    //
    // TableSubController
    //

    public mount(): void {
        this.tableController.updateKeyAndPageParams(null, null).finally(() => {
            this.tableController.autoUpdateCount.value = 0
            this.refresh()
        })
    }

    public unmount(): void {
        if (this.timeoutID != -1) {
            window.clearTimeout(this.timeoutID)
            this.timeoutID = -1
        }
        this.sessionId += 1
    }

    //
    // Private
    //

    private refresh() {

        const headKey = this.tableController.getHeadKey()
        const captureSessionId = this.sessionId
        // const currentPage = this.tableController.currentPage.value
        if (/*currentPage == 1 && */headKey !== null) {
            this.lastLoad(headKey, this.tableController.pageSize.value).then((newRows: R[] | null) => {
                if (newRows !== null && this.sessionId == captureSessionId) {
                    this.lastLoadDidComplete(newRows)
                }
            })
        } else {
            this.tailLoad(null, this.tableController.pageSize.value, false).then((newRows: R[] | null) => {
                if (newRows !== null && this.sessionId == captureSessionId) {
                    this.tailLoadDidComplete(newRows)
                }
            })
        }
    }

    private lastLoadDidComplete(newRows: R[]): void {

        this.tableController.buffer.value = this.concatOrReplace(newRows, this.tableController.buffer.value)
        this.tableController.startIndex.value = 0
        // this.tableController.drained.value unchanged
        this.tableController.shadowRowCount.value = 0
        this.tableController.currentPage.value = 1

        this.scheduleNextRefresh()
    }

    private tailLoadDidComplete(newRows: R[]): void {
        this.tableController.buffer.value = newRows
        this.tableController.startIndex.value = 0
        this.tableController.drained.value = newRows.length < this.tableController.pageSize.value
        this.tableController.shadowRowCount.value = 0
        this.tableController.currentPage.value = 1
        this.scheduleNextRefresh()
    }

    private scheduleNextRefresh() {
        this.timeoutID = -1
        this.tableController.autoUpdateCount.value += 1
        // this.loadingRef.value = false
        if (this.tableController.autoUpdateCount.value < this.tableController.maxAutoUpdateCount) {
            this.timeoutID = window.setTimeout(() => {
                this.refresh()
            }, this.tableController.updatePeriod)
        } else {
            this.tableController.autoRefresh.value = false
        }
    }
}
