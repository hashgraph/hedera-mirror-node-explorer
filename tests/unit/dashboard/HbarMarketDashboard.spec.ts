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


/*
    Bookmarks
        https://test-utils.vuejs.org/api/

 */

import {flushPromises, mount} from "@vue/test-utils";
import HbarMarketDashboard from "@/components/dashboard/HbarMarketDashboard.vue";
import {SAMPLE_COINGECKO} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

const mock = new MockAdapter(axios);
const matcher = "https://api.coingecko.com/api/v3/coins/hedera-hashgraph"
mock.onGet(matcher).reply(200, SAMPLE_COINGECKO);

describe("HbarMarketDashboard.vue ", () => {

    test("with amount set", async () => {

        const wrapper = mount(HbarMarketDashboard, {
            props: {
            },
        });

        await flushPromises()
        // console.log(wrapper.text())

        expect(wrapper.text()).toBe(
            "$0.2460" +
            "↗ 8.42%" +
            "HBAR PRICE" +
            "$4,486,259,941" +
            "↗ 8.42%" +
            "HBAR MARKET CAP"
        )

        const logos = wrapper.findAll("img")
        expect(logos.length).toBe(2)
        expect(logos[0].attributes('alt')).toBe("Hbar Symbol")
        expect(logos[1].attributes('alt')).toBe("World Market Symbol")
    });

});
