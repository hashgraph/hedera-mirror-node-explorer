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

import {Collector} from "@/utils/Collector";
import {AxiosResponse} from "axios";
import {flushPromises} from "@vue/test-utils";

describe("Collector.ts", () => {


    test("sequential", () => {
        const c = new TestCollector()

        for (let k = 0; k < 10; k += 1) {
            c.fetch(k).then((value: AxiosResponse<TestData>) => {
                expect(value.data.key).toBe(value.data.seq)
            })
        }

        flushPromises()

    })


    test("concurrent", async () => {
        const c = new TestCollector()

        const promises = new Array<Promise<AxiosResponse<TestData>>>()

        const count = 10
        for (let k = 0; k < count; k += 1) {
            promises.push(c.fetch(k))
        }

        const responses = new Array<AxiosResponse<TestData>>()
        for (const p of promises) {
            p.then((r: AxiosResponse<TestData>) => {
                responses.push(r)
            })
        }

        await flushPromises()

        for (const response of responses) {
            expect(response.data.seq).toBe(response.data.key)
        }

    })
})

class TestCollector extends Collector<TestData, number> {

    private counter = 0

    //
    // Collector
    //

    protected load(key: number): Promise<AxiosResponse<TestData>> {
        const response: AxiosResponse<TestData> = {
            data: new TestData(key, this.counter),
            status: 200,
            statusText: "",
            headers: {},
            config: {}
        }
        this.counter += 1
        return Promise.resolve(response);
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
