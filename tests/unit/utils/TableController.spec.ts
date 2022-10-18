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

import {computed, ComputedRef, ref} from "vue";
import {makeRouter} from "@/router";
import {flushPromises} from "@vue/test-utils";
import {KeyOperator, SortOrder, TableController} from "@/utils/table/TableController";

jest.useFakeTimers()

describe("TableController.ts", () => {

    test("load() sanity check", async () => {
        const tc = new TestTableController(0, 50, 10)

        const dummyOp = KeyOperator.lt

        // No key

        let rows = await tc.load(null, dummyOp, SortOrder.ASC, 10)
        expect(rows).toStrictEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

        rows = await tc.load(null, dummyOp, SortOrder.DESC, 10)
        expect(rows).toStrictEqual([49, 48, 47, 46, 45, 44, 43, 42, 41, 40])


        // With key
        const key = 7

        // ASC
        rows = await tc.load(key, KeyOperator.lt, SortOrder.ASC, 10)
        expect(rows).toStrictEqual([0, 1, 2, 3, 4, 5, 6])

        rows = await tc.load(key, KeyOperator.lte, SortOrder.ASC, 10)
        expect(rows).toStrictEqual([0, 1, 2, 3, 4, 5, 6, 7])

        rows = await tc.load(key, KeyOperator.gt, SortOrder.ASC, 10)
        expect(rows).toStrictEqual([8, 9, 10, 11, 12, 13, 14, 15, 16, 17])

        rows = await tc.load(key, KeyOperator.gte, SortOrder.ASC, 10)
        expect(rows).toStrictEqual([7, 8, 9, 10, 11, 12, 13, 14, 15, 16])

        // DESC

        rows = await tc.load(key, KeyOperator.lt, SortOrder.DESC, 10)
        expect(rows).toStrictEqual([6, 5, 4, 3, 2, 1, 0])

        rows = await tc.load(key, KeyOperator.lte, SortOrder.DESC, 10)
        expect(rows).toStrictEqual([7, 6, 5, 4, 3, 2, 1, 0])

        rows = await tc.load(key, KeyOperator.gt, SortOrder.DESC, 10)
        expect(rows).toStrictEqual([49, 48, 47, 46, 45, 44, 43, 42, 41, 40])

        rows = await tc.load(key, KeyOperator.gte, SortOrder.DESC, 10)
        expect(rows).toStrictEqual([49, 48, 47, 46, 45, 44, 43, 42, 41, 40])



    })


    test("mount / unmount", async () => {
        const tc = new TestTableController(0, 50, 10)

        expect(tc.pageSize.value).toBe(10)
        expect(tc.autoRefresh.value).toBe(false)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.currentPage.value).toBe(1)
        expect(tc.loading.value).toBe(false)
        expect(tc.totalRowCount.value).toBe(TestTableController.PRESUMED_ROW_COUNT)
        expect(tc.rows.value).toStrictEqual([])
        expect(tc.mounted.value).toBe(false)

        await flushPromises()

        expect(tc.pageSize.value).toBe(10)
        expect(tc.autoRefresh.value).toBe(false)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.currentPage.value).toBe(1)
        expect(tc.loading.value).toBe(false)
        expect(tc.totalRowCount.value).toBe(TestTableController.PRESUMED_ROW_COUNT)
        expect(tc.rows.value).toStrictEqual([])
        expect(tc.mounted.value).toBe(false)

        // 1) mount

        tc.mount()
        await flushPromises()

        expect(tc.pageSize.value).toBe(10)
        expect(tc.autoRefresh.value).toBe(true)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.currentPage.value).toBe(1)
        expect(tc.loading.value).toBe(false)
        expect(tc.totalRowCount.value).toBe(TestTableController.PRESUMED_ROW_COUNT)
        expect(tc.rows.value).toStrictEqual([49,48,47,46,45,44,43,42,41,40])
        expect(tc.mounted.value).toBe(true)

        // 2) unmount
        tc.unmount()
        await flushPromises()

        expect(tc.pageSize.value).toBe(10)
        expect(tc.autoRefresh.value).toBe(false)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.currentPage.value).toBe(1)
        expect(tc.loading.value).toBe(false)
        expect(tc.totalRowCount.value).toBe(TestTableController.PRESUMED_ROW_COUNT)
        expect(tc.rows.value).toStrictEqual([])
        expect(tc.mounted.value).toBe(false)

    })


    test("autoRefresh & autoStopped", async () => {
        const tc = new TestTableController(0, 50, 10)

        // Mount
        tc.mount()
        await flushPromises()
        expect(tc.autoRefresh.value).toBe(true)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.rows.value).toStrictEqual([49,48,47,46,45,44,43,42,41,40])
        expect(tc.autoUpdateCount.value).toBe(1)

        // Refresh #2
        jest.runOnlyPendingTimers()
        await flushPromises()
        expect(tc.autoRefresh.value).toBe(true)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.rows.value).toStrictEqual([49,48,47,46,45,44,43,42,41,40])
        expect(tc.autoUpdateCount.value).toBe(2)

        // Refresh #3
        jest.runOnlyPendingTimers()
        await flushPromises()
        expect(tc.autoRefresh.value).toBe(true)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.rows.value).toStrictEqual([49,48,47,46,45,44,43,42,41,40])
        expect(tc.autoUpdateCount.value).toBe(3)

        // Refresh #4
        jest.runOnlyPendingTimers()
        await flushPromises()
        expect(tc.autoRefresh.value).toBe(true)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.rows.value).toStrictEqual([49,48,47,46,45,44,43,42,41,40])
        expect(tc.autoUpdateCount.value).toBe(4)

        // Refresh #5
        jest.runOnlyPendingTimers()
        await flushPromises()
        expect(tc.autoRefresh.value).toBe(false)
        expect(tc.autoStopped.value).toBe(true)
        expect(tc.rows.value).toStrictEqual([49,48,47,46,45,44,43,42,41,40])
        expect(tc.autoUpdateCount.value).toBe(5)

        // Unmount
        tc.unmount()
        await flushPromises()
        expect(tc.autoRefresh.value).toBe(false)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.rows.value).toStrictEqual([])
        expect(tc.autoUpdateCount.value).toBe(0)

    })


    test("autoRefresh & new entries", async () => {
        const tc = new TestTableController(0, 50, 10)

        // Mount
        tc.mount()
        await flushPromises()
        expect(tc.autoRefresh.value).toBe(true)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.rows.value).toStrictEqual([49,48,47,46,45,44,43,42,41,40])
        expect(tc.autoUpdateCount.value).toBe(1)

        // Refresh #2
        jest.runOnlyPendingTimers()
        await flushPromises()
        expect(tc.autoRefresh.value).toBe(true)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.rows.value).toStrictEqual([49,48,47,46,45,44,43,42,41,40])
        expect(tc.autoUpdateCount.value).toBe(2)

        // Generates 2 new entries in tc
        tc.endKey += 2

        // Refresh #3
        jest.runOnlyPendingTimers()
        await flushPromises()
        expect(tc.autoRefresh.value).toBe(true)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.rows.value).toStrictEqual([51,50,49,48,47,46,45,44,43,42])
        expect(tc.autoUpdateCount.value).toBe(3)

        // Generates one page of entries => tc will trash buffer tail
        tc.endKey += tc.pageSize.value

        // Refresh #4
        jest.runOnlyPendingTimers()
        await flushPromises()
        expect(tc.autoRefresh.value).toBe(true)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.rows.value).toStrictEqual([61,60,59,58,57,56,55,54,53,52])
        expect(tc.autoUpdateCount.value).toBe(4)

        // Unmount
        tc.unmount()
        await flushPromises()
        expect(tc.autoRefresh.value).toBe(false)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.rows.value).toStrictEqual([])
        expect(tc.autoUpdateCount.value).toBe(0)

    })


    test("source watch and reload", async () => {
        const scale = ref(1)
        const tc = new TestTableController(0, 50, 10, computed(() => scale.value))

        // Mount
        tc.mount()
        await flushPromises()
        expect(tc.autoRefresh.value).toBe(true)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.rows.value).toStrictEqual([49,48,47,46,45,44,43,42,41,40])
        expect(tc.autoUpdateCount.value).toBe(1)

        // Refresh #2
        jest.runOnlyPendingTimers()
        await flushPromises()
        expect(tc.autoRefresh.value).toBe(true)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.rows.value).toStrictEqual([49,48,47,46,45,44,43,42,41,40])
        expect(tc.autoUpdateCount.value).toBe(2)

        // Updates scale value
        scale.value = 2
        await flushPromises()
        expect(tc.autoRefresh.value).toBe(true)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.rows.value).toStrictEqual([98,96,94,92,90,88,86,84,82,80])
        expect(tc.autoUpdateCount.value).toBe(1)

        // Unmount
        tc.unmount()
        await flushPromises()
        expect(tc.autoRefresh.value).toBe(false)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.rows.value).toStrictEqual([])
        expect(tc.autoUpdateCount.value).toBe(0)

    })


    test("paging", async () => {
        const tc = new TestTableController(0, 50, 10)

        // Mount
        tc.mount()
        await flushPromises()
        expect(tc.autoRefresh.value).toBe(true)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.rows.value).toStrictEqual([49,48,47,46,45,44,43,42,41,40])
        expect(tc.autoUpdateCount.value).toBe(1)
        expect(tc.currentPage.value).toBe(1)

        // Refresh #2
        jest.runOnlyPendingTimers()
        await flushPromises()
        expect(tc.autoRefresh.value).toBe(true)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.rows.value).toStrictEqual([49,48,47,46,45,44,43,42,41,40])
        expect(tc.autoUpdateCount.value).toBe(2)
        expect(tc.currentPage.value).toBe(1)

        // Goto page #2
        tc.onPageChange(2)
        await flushPromises()
        expect(tc.autoRefresh.value).toBe(false)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.rows.value).toStrictEqual([39,38,37,36,35,34,33,32,31,30])
        expect(tc.autoUpdateCount.value).toBe(2)
        expect(tc.currentPage.value).toBe(2)

        // Goto page #4
        tc.onPageChange(4)
        await flushPromises()
        expect(tc.autoRefresh.value).toBe(false)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.rows.value).toStrictEqual([19,18,17,16,15,14,13,12,11,10])
        expect(tc.autoUpdateCount.value).toBe(2)
        expect(tc.currentPage.value).toBe(4)
    })


    test("shadow pages", async() => {

        const tc = new TestTableController(0, 50, 10)

        // Preset page and key query params
        await tc.router.replace({query: {p: 4, k: 19}})
        await flushPromises()

        // Mount => page 4 is loaded
        tc.mount()
        await flushPromises()
        expect(tc.autoRefresh.value).toBe(false)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.rows.value).toStrictEqual([19,18,17,16,15,14,13,12,11,10])
        expect(tc.autoUpdateCount.value).toBe(0)
        expect(tc.currentPage.value).toBe(4)

        // Goto page #2
        tc.onPageChange(2)
        await flushPromises()
        expect(tc.autoRefresh.value).toBe(false)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.rows.value).toStrictEqual([39,38,37,36,35,34,33,32,31,30])
        expect(tc.autoUpdateCount.value).toBe(0)
        expect(tc.currentPage.value).toBe(2)

        // Goto page #3
        tc.onPageChange(3)
        await flushPromises()
        expect(tc.autoRefresh.value).toBe(false)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.rows.value).toStrictEqual([29,28,27,26,25,24,23,22,21,20])
        expect(tc.autoUpdateCount.value).toBe(0)
        expect(tc.currentPage.value).toBe(3)

        // Goto page #1
        tc.onPageChange(1)
        await flushPromises()
        expect(tc.autoRefresh.value).toBe(false)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.rows.value).toStrictEqual([49,48,47,46,45,44,43,42,41,40])
        expect(tc.autoUpdateCount.value).toBe(0)
        expect(tc.currentPage.value).toBe(1)

    })


    test("shadow pages (inconsistent)", async() => {

        const tc = new TestTableController(0, 50, 10)

        // Preset page and key query params
        await tc.router.replace({query: {p: 40, k: 21}})
        await flushPromises()

        // Mount => page 40 is loaded
        tc.mount()
        await flushPromises()
        expect(tc.autoRefresh.value).toBe(false)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.rows.value).toStrictEqual([21,20,19,18,17,16,15,14,13,12])
        expect(tc.autoUpdateCount.value).toBe(0)
        expect(tc.currentPage.value).toBe(40)

        // Goto page #38
        tc.onPageChange(38)
        await flushPromises()
        expect(tc.autoRefresh.value).toBe(false)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.rows.value).toStrictEqual([41,40,39,38,37,36,35,34,33,32])
        expect(tc.autoUpdateCount.value).toBe(0)
        expect(tc.currentPage.value).toBe(38)

        // Goto page #1
        tc.onPageChange(1)
        await flushPromises()
        expect(tc.autoRefresh.value).toBe(false)
        expect(tc.autoStopped.value).toBe(false)
        expect(tc.rows.value).toStrictEqual([49,48,47,46,45,44,43,42,41,40])
        expect(tc.autoUpdateCount.value).toBe(0)
        expect(tc.currentPage.value).toBe(1)

    })
})

class TestTableController extends TableController<number, number> {

    public static readonly PRESUMED_ROW_COUNT = 100
    public static readonly UPDATED_PERIOD = 5000
    public static readonly MAX_UPDATE_COUNT = 5
    public static readonly MAX_LIMIT = 12

    public startKey: number
    public endKey: number

    private readonly scale: ComputedRef<number>

    constructor(startKey: number, endKey: number, pageSize: number, scale = computed(() => 1)) {
        super(makeRouter(), computed(() => pageSize),
            TestTableController.PRESUMED_ROW_COUNT,
            TestTableController.UPDATED_PERIOD,
            TestTableController.MAX_UPDATE_COUNT,
            TestTableController.MAX_LIMIT)
        this.startKey = startKey
        this.endKey = endKey
        this.scale = scale
        this.watchAndReload([scale])
    }

    //
    // TableController
    //

    keyFor(row: number): number {
        return row;
    }

    public stringFromKey(key: number): string {
        return key.toString()
    }

    public keyFromString(s: string): number|null {
        const n = parseInt(s)
        return isNaN(n) ? null : n
    }

    public async load(key: number|null, operator: KeyOperator, order: SortOrder, limit: number): Promise<number[]|null> {
        let result = new Array<number>()

        let fromKey: number
        let toKey: number
        if (key !== null) {
            key = Math.max(Math.min(key, this.endKey), this.startKey)
            switch(operator) {
                case KeyOperator.gt:
                    if (order == SortOrder.ASC) {
                        /*
                                  startKey                         key                             endKey
                                 |________________________________|_______________________________|
                                                                   |...................|
                         */
                        fromKey = key+1
                        toKey = Math.min(fromKey + limit, this.endKey)
                    } else {
                        /*
                                  startKey                         key                             endKey
                                 |________________________________|_______________________________|
                                                                              |...................|
                         */
                        toKey = this.endKey
                        fromKey = Math.max(toKey - limit, key + 1)
                    }
                    break
                case KeyOperator.gte:
                    if (order == SortOrder.ASC) {
                        /*
                                  startKey                         key                             endKey
                                 |________________________________|_______________________________|
                                                                  |...................|
                         */
                        fromKey = key
                        toKey = Math.min(fromKey + limit, this.endKey)
                    } else {
                        /*
                                  startKey                         key                             endKey
                                 |________________________________|_______________________________|
                                                                              |...................|
                         */
                        toKey = this.endKey
                        fromKey = Math.max(toKey - limit, key)
                    }
                    break
                case KeyOperator.lt:
                    if (order == SortOrder.ASC) {
                        /*
                                  startKey                         key                             endKey
                                 |________________________________|_______________________________|
                                 |...................|
                         */
                        fromKey = this.startKey
                        toKey = Math.min(fromKey + limit, key)
                    } else {
                        /*
                                  startKey                         key                             endKey
                                 |________________________________|_______________________________|
                                              |...................|
                         */
                        toKey = key
                        fromKey = Math.max(toKey - limit, this.startKey)
                    }
                    break
                case KeyOperator.lte:
                    if (order == SortOrder.ASC) {
                        /*
                                  startKey                         key                             endKey
                                 |________________________________|_______________________________|
                                 |...................|
                         */
                        fromKey = this.startKey
                        toKey = Math.min(fromKey + limit, key+1)
                    } else {
                        /*
                                  startKey                         key                             endKey
                                 |________________________________|_______________________________|
                                               |...................|
                         */
                        toKey = key+1
                        fromKey = Math.max(toKey - limit, this.startKey)
                    }
                    break
            }
        } else {
            if (order == SortOrder.ASC) {
                /*
                          startKey                                                          endKey
                         |________________________________________________________________|
                         |...................|
                 */
                fromKey = this.startKey
                toKey = Math.min(fromKey + limit, this.endKey)
            } else {
                /*
                          startKey                                                          endKey
                         |________________________________________________________________|
                                                                      |...................|
                 */
                toKey = this.endKey
                fromKey = Math.max(this.endKey - limit, this.startKey)
            }
        }
        for (let k = fromKey; k < toKey; k += 1) {
            result.push(k * this.scale.value)
        }
        if (order == SortOrder.DESC) {
            result.reverse()
        }

        return result
    }
}