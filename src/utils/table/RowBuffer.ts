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
import {ref, Ref} from "vue";

export class RowBuffer<R, K> {

    private readonly controller: TableController<R, K>
    private readonly maxLimit: number

    //
    // Public
    //

    public constructor(controller: TableController<R, K>, maxLimit: number) {
        this.controller = controller
        this.maxLimit = maxLimit
    }

    public readonly rows: Ref<Array<R>> = ref([])

    public readonly drained: Ref<boolean> = ref(false)

    public load(startIndex: number, rowCount: number): Promise<void> {
        let result: Promise<void>

        const fromIndex = Math.min(startIndex, this.rows.value.length)
        const toIndex = startIndex + rowCount

        if (toIndex <= this.rows.value.length || this.drained.value) {
            result = Promise.resolve()
        } else {

            const missingCount = toIndex - fromIndex
            const limitedCount = Math.min(this.maxLimit, missingCount)
            const remainingCount = missingCount - limitedCount

            const executor = (resolve: (p: Promise<void>|void) => void) => {

                const cb = (r: R[]|null) => {
                    if (r !== null) {
                        this.rows.value = this.rows.value.concat(r)
                        this.drained.value = r.length < limitedCount
                        resolve(this.load(fromIndex + limitedCount, remainingCount))
                    } else {
                        resolve()
                    }
                }

                const lastRow = fromIndex >= 1 ? this.rows.value[fromIndex - 1] : null
                const lastRowKey = lastRow !== null ? this.controller.keyFor(lastRow) : null
                this.controller.loadAfter(lastRowKey, limitedCount).then(cb)
            }

            result = new Promise(executor)
        }

        return result
    }

    public refresh(rowCount: number): Promise<void> {
        let result: Promise<void>

        if (this.rows.value.length >= 1) {

            // Here we assume that rowCount < this.maxLimit
            const lastRow = this.rows.value[0]
            const lastRowKey = this.controller.keyFor(lastRow)
            const cb = (r: R[]|null): Promise<void> => {
                if (r !== null && r.length >= 1) {
                    this.merge(r)
                }
                return Promise.resolve()
            }
            result = this.controller.loadBefore(lastRowKey, rowCount).then(cb)
        } else {
            result = this.load(0, rowCount)
        }

        return result
    }

    public clear(): void {
        this.rows.value = []
        this.drained.value = false
    }

    //
    // Private
    //

    private merge(newRows: R[]): void {
        // Checks if r overlaps with this.rows.value
        const firstBufferedRow = this.rows.value.length >= 1 ? this.rows.value[0] : null
        if (firstBufferedRow !== null) {
            // First row in newRows that matches firstBufferedRow
            let matchIndex: number|null = null
            const firstBufferedRowKey = this.controller.keyFor(firstBufferedRow)
            for (let i = 0; i < newRows.length; i += 1) {
                const newRowKey = this.controller.keyFor(newRows[i])
                if (newRowKey == firstBufferedRowKey) {
                    matchIndex = i
                    break
                }
            }

            if (matchIndex !== null) {
                // For i = matchIndex to newRows.length-1, newRows[i] matches this.rows[i - matchIndex]
                // => We prepend newRows from 0 to matchIndex - 1 to this.rows.value
                this.rows.value = newRows.slice(0, matchIndex).concat(this.rows.value)
            } else {
                // No overlap
                this.rows.value = newRows
            }
        } else {
            // Buffer is empty
            this.rows.value = newRows
        }

    }
}