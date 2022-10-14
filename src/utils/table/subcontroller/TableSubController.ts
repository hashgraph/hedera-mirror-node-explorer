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

import {KeyOperator, SortOrder, TableController} from "@/utils/table/TableController";
import {LocationQuery} from "vue-router";

export abstract class TableSubController<R, K> {

    protected readonly tableController: TableController<R, K>

    //
    // Public
    //

    public constructor(tableController: TableController<R, K>) {
        this.tableController = tableController
    }


    //
    // Public (to be subclassed)
    //

    public abstract mount(): void
    public abstract unmount(): void
    public abstract makeRouteQuery(currentQuery: LocationQuery): LocationQuery;

    //
    // Protected
    //

    protected headLoad(key: K, rowCount: number, current: R[] = []): Promise<R[] | null> {
        let result: Promise<R[] | null>

        if (rowCount >= 1) {

            const cb = (r: R[]|null): Promise<R[] | null> => {
                let result: Promise<R[] | null>
                if (r !== null) {
                    current = r.reverse().concat(current)
                    if (r.length < limitedCount) {
                        result = Promise.resolve(current)
                    } else {
                        const headKey = this.tableController.keyFor(r[0])
                        result = this.headLoad(headKey, remainingCount, current)
                    }
                } else {
                    result = Promise.resolve(current)
                }
                return result
            }

            const limitedCount = Math.min(this.tableController.maxLimit, rowCount)
            const remainingCount = rowCount - limitedCount
            result = this.tableController.load(key, KeyOperator.gt, SortOrder.ASC, limitedCount).then(cb)

        } else {

            result = Promise.resolve(current)

        }

        return result
    }

    protected tailLoad(key: K|null, rowCount: number, lte: boolean, current: R[] = []): Promise<R[] | null> {
        let result: Promise<R[] | null>

        if (rowCount >= 1) {

            const cb = (r: R[]|null): Promise<R[] | null> => {
                let result: Promise<R[] | null>
                if (r !== null) {
                    current = current.concat(r)
                    if (r.length < limitedCount) {
                        result = Promise.resolve(current)
                    } else {
                        const tailRow = r[r.length - 1]
                        const tailKey = this.tableController.keyFor(tailRow)
                        result = this.tailLoad(tailKey, remainingCount, false, current)
                    }
                } else {
                    result = Promise.resolve(null)
                }
                return result
            }

            const limitedCount = Math.min(this.tableController.maxLimit, rowCount)
            const remainingCount = rowCount - limitedCount
            const operator = lte ? KeyOperator.lte : KeyOperator.lt
            result = this.tableController.load(key, operator, SortOrder.DESC, limitedCount).then(cb)

        } else {
            result = Promise.resolve(current)
        }

        return result
    }


    protected lastLoad(key: K, rowCount: number, current: R[] = []): Promise<R[] | null> {
        let result: Promise<R[] | null>

        if (rowCount >= 1) {

            const cb = (r: R[]|null): Promise<R[] | null> => {
                let result: Promise<R[] | null>
                if (r !== null) {
                    current = this.concatOrReplace(r, current)
                    if (r.length < limitedCount) {
                        result = Promise.resolve(current)
                    } else {
                        const key = this.tableController.keyFor(r[0])
                        result = this.headLoad(key, remainingCount, current)
                    }
                } else {
                    result = Promise.resolve(current)
                }
                return result
            }

            const limitedCount = Math.min(this.tableController.maxLimit, rowCount)
            const remainingCount = rowCount - limitedCount
            result = this.tableController.load(key, KeyOperator.gte, SortOrder.DESC, limitedCount).then(cb)

        } else {

            result = Promise.resolve(current)

        }

        return result
    }

    protected concatOrReplace(newRows: R[], currentRows: R[]): R[] {
        let result: R[]

        const newTailRow = newRows.length >= 1 ? newRows[newRows.length - 1] : null
        const newTailKey = newTailRow !== null ? this.tableController.keyFor(newTailRow) : null
        const currentHeadRow = currentRows.length >= 1 ? currentRows[0] : null
        const currentHeadKey = currentHeadRow ? this.tableController.keyFor(currentHeadRow) : null

        if (newTailKey !== null && newTailKey == currentHeadKey) {
            // We concat :)
            result = newRows.concat(currentRows.slice(1, currentRows.length)) // 1 to skip currentHeadKey
        } else {
            // We keep new rows only :(
            result = newRows
        }

        return result
    }
}

