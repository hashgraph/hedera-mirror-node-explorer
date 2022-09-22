// noinspection DuplicatedCode

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
import {nextTick, ref, Ref} from "vue";
import {flushPromises} from "@vue/test-utils";

jest.useFakeTimers()

describe("TableController.ts", () => {

    test("mount / unmount", async () => {

        // Creates
        const pageSize = ref(10)
        const tc = new TestTableController(pageSize)
        await flushPromises()

        expect(tc.pageSize.value).toBe(10)
        expect(tc.autoRefresh.value).toBe(false)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.currentPage.value).toBe(1)
        expect(tc.loading.value).toBe(false)
        expect(tc.totalRowCount.value).toBe(TestTableController.PRESUMED_ROW_COUNT)
        expect(tc.pageRows.value).toStrictEqual([])
        expect(tc.getBufferedRows()).toStrictEqual([])

        // Mounts
        tc.mounted.value = true
        await flushPromises()

        expect(tc.pageSize.value).toBe(10)
        expect(tc.autoRefresh.value).toBe(true)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.currentPage.value).toBe(1)
        expect(tc.loading.value).toBe(false)
        expect(tc.totalRowCount.value).toBe(TestTableController.PRESUMED_ROW_COUNT)
        expect(tc.pageRows.value).toStrictEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
        expect(tc.getBufferedRows()).toStrictEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

        // Awaits next refresh
        jest.runOnlyPendingTimers()
        await flushPromises()

        expect(tc.pageSize.value).toBe(10)
        expect(tc.autoRefresh.value).toBe(true)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.currentPage.value).toBe(1)
        expect(tc.loading.value).toBe(false)
        expect(tc.totalRowCount.value).toBe(TestTableController.PRESUMED_ROW_COUNT)
        expect(tc.pageRows.value).toStrictEqual([-9, -8, -7, -6, -5, -4, -3, -2, -1, 0])
        expect(tc.getBufferedRows()).toStrictEqual([
            -9, -8, -7, -6, -5, -4, -3, -2, -1, 0,
            1, 2, 3, 4, 5, 6, 7, 8, 9])

        // Goto page #2
        tc.onPageChange(2)
        tc.currentPage.value = 2
        await nextTick()
        await flushPromises()

        expect(tc.pageSize.value).toBe(10)
        expect(tc.autoRefresh.value).toBe(false)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.currentPage.value).toBe(2)
        expect(tc.loading.value).toBe(false)
        expect(tc.totalRowCount.value).toBe(TestTableController.PRESUMED_ROW_COUNT)
        expect(tc.pageRows.value).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        expect(tc.getBufferedRows()).toStrictEqual([
            -9, -8, -7, -6, -5, -4, -3, -2, -1, 0,
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10])


        // Unmounts
        tc.mounted.value = false
        await nextTick()
        await flushPromises()

        expect(tc.pageSize.value).toBe(10)
        expect(tc.autoRefresh.value).toBe(false)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.currentPage.value).toBe(2) // Should be reset to 1 ?
        expect(tc.loading.value).toBe(false)
        expect(tc.totalRowCount.value).toBe(TestTableController.PRESUMED_ROW_COUNT)
        expect(tc.pageRows.value).toStrictEqual([])

    })
})

class TestTableController extends TableController<number, number> {

    public static readonly ROW_COUNT = 108
    public static readonly PRESUMED_ROW_COUNT = 97
    public static readonly UPDATED_PERIOD = 5000
    public static readonly MAX_UPDATE_COUNT = 3
    public static readonly MAX_LIMIT = 40

    constructor(pageSize: Ref<number>) {
        super(pageSize,
            TestTableController.PRESUMED_ROW_COUNT,
            TestTableController.UPDATED_PERIOD,
            TestTableController.MAX_UPDATE_COUNT,
            TestTableController.MAX_LIMIT)
    }

    //
    // TableController
    //

    async loadAfter(key: number|null, limit: number): Promise<number[]|null> {

        const startKey = key !== null ? key + 1 : 0
        const endKey = Math.min(startKey + limit, TestTableController.ROW_COUNT)
        const result = new Array<number>()
        for (let k = startKey; k < endKey; k += 1) {
            result.push(k)
        }
        return Promise.resolve(result)
    }

    async loadBefore(key: number, limit: number): Promise<number[]|null> {
        const startKey = key - this.pageSize.value + 1
        const endKey = key + 1
        const result = new Array<number>()
        for (let k = startKey; k < endKey; k += 1) {
            result.push(k)
        }
        return Promise.resolve(result)
    }

    keyFor(row: number): number {
        return row;
    }

}