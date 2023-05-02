/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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

import {flushPromises} from "@vue/test-utils";
import {SerialCache} from "@/utils/cache/base/SerialCache";

describe("SerialCache.ts", () => {


    test("sequential", () => {
        const c = new TestCache()

        for (let k = 0; k < 10; k += 1) {
            c.lookup(k).then((value: TestData) => {
                expect(value.key).toBe(value.seq)
            })
        }

        flushPromises()

    })


    test("concurrent", async () => {
        const c = new TestCache()

        const promises = new Array<Promise<TestData>>()

        const count = 10
        for (let k = 0; k < count; k += 1) {
            promises.push(c.lookup(k))
        }

        const responses = new Array<TestData>()
        for (const p of promises) {
            p.then((r: TestData) => {
                responses.push(r)
            })
        }

        await flushPromises()

        for (const response of responses) {
            expect(response.seq).toBe(response.key)
        }

    })
})

class TestCache extends SerialCache<number, TestData> {

    private counter = 0

    //
    // Collector
    //

    protected load(key: number): Promise<TestData> {
        const result = new TestData(key, this.counter)
        this.counter += 1
        return Promise.resolve(result);
    }


}

class TestData {
    public readonly key: number
    public readonly seq: number
    constructor(key: number, seq: number) {
        this.key = key
        this.seq = seq
    }
}
