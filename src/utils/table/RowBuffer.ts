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

import {TableController} from "@/utils/table/TableController";
import {computed, ComputedRef, ref, Ref} from "vue";
import {KeyOperator, SortOrder} from "@/utils/table/TableController";

export class RowBuffer<R, K> {

    private readonly tableController: TableController<R, K>
    private readonly presumedRowCount: number

    //
    // Public
    //

    public constructor(controller: TableController<R, K>, presumedRowCount: number) {
        this.tableController = controller
        this.presumedRowCount = presumedRowCount
    }

    public readonly rows: Ref<R[]> = ref([])

    public readonly startIndex: Ref<number> = ref(0)

    public readonly drained: Ref<boolean> = ref(false)

    public readonly autoUpdateCount: Ref<number> = ref(0)

    public readonly shadowRowCount: Ref<number> = ref(0)

    public clear(): void {
        this.rows.value = []
        this.startIndex.value = 0
        this.drained.value = false
        this.autoUpdateCount.value = 0
        this.shadowRowCount.value = 0
    }

    public readonly totalRowCount: ComputedRef<number> = computed(() => {
        let result: number
        const allRowCount = this.shadowRowCount.value + this.rows.value.length
        if (this.drained.value) {
            result = +allRowCount
        } else {
            const k = Math.ceil((allRowCount + 1) / this.presumedRowCount)
            result = k * this.presumedRowCount
        }
        return result
    })

    public readonly tailKey: ComputedRef<K|null> = computed(() => {
        const bufferLength = this.rows.value.length
        const tailRow = bufferLength >= 1 ? this.rows.value[bufferLength-1] : null
        return tailRow !== null ? this.tableController.keyFor(tailRow) : null
    })

    public readonly headKey: ComputedRef<K|null> = computed(() => {
        const bufferLength = this.rows.value.length
        const headRow = bufferLength >= 1 ? this.rows.value[0] : null
        return headRow !== null ? this.tableController.keyFor(headRow) : null
    })

    public readonly maxStartIndex: ComputedRef<number> = computed(() => {
        const pageSize = this.tableController.pageSize.value
        const pageCount = Math.floor((this.shadowRowCount.value + this.rows.value.length) / pageSize) + 1
        return Math.max(0, (pageCount - 1) * pageSize)
    })

    public computePage(): number {
        const i = this.shadowRowCount.value + this.startIndex.value
        const pageSize = this.tableController.pageSize.value
        return Math.floor(i / pageSize) + 1
    }

    public computeFirstVisibleKey(): K|null {
        const bufferLength = this.rows.value.length
        const firstRow = this.startIndex.value < bufferLength ? this.rows.value[this.startIndex.value] : null
        return firstRow !== null ? this.tableController.keyFor(firstRow) : null
    }

    //
    // Public (loading)
    //

    public headLoad(key: K, rowCount: number, current: R[] = []): Promise<R[] | null> {
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

    public tailLoad(key: K|null, rowCount: number, lte: boolean, current: R[] = []): Promise<R[] | null> {
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


    public lastLoad(key: K, rowCount: number, current: R[] = []): Promise<R[] | null> {
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

    public concatOrReplace(newRows: R[], currentRows: R[]): R[] {
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