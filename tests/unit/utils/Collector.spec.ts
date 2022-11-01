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
import axios, {AxiosResponse} from "axios";
import {flushPromises} from "@vue/test-utils";
import {CoinGeckoCollector} from "@/utils/CoinGeckoCollector";
import {SAMPLE_COINGECKO} from "../Mocks";
import MockAdapter from "axios-mock-adapter";

describe("Collector.ts", () => {


    test("resolve", () => {
        const c = new TestCollector()

        for (let k = 0; k < 100; k += 1) {
            c.fetch(k).then((value: AxiosResponse<TestData>) => {
                expect(value.data.key).toBe(value.data.seq)
            }, (reason: unknown) => {
                throw new Error("Unexpected reject with reason " + reason)
            })
        }

        flushPromises()

    })

    test("CoinGeckoCollector", async () => {

        const mock = new MockAdapter(axios);
        const matcher = "https://api.coingecko.com/api/v3/coins/hedera-hashgraph"
        mock.onGet(matcher).reply(200, SAMPLE_COINGECKO);

        const r1 = await CoinGeckoCollector.instance.fetch(null)
        const r2 = await CoinGeckoCollector.instance.fetch(null)
        expect(r2.data).toBe(r1.data)
        expect(mock.history.get.length).toBe(1)

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
