/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2024 Hedera Hashgraph, LLC
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

import {describe, expect, test} from 'vitest'
import {flushPromises, mount} from "@vue/test-utils"
import router from "@/router";
import axios from "axios";
import {
    SAMPLE_NETWORK_EXCHANGERATE,
    SAMPLE_NETWORK_SUPPLY,
} from "../Mocks";
import MainDashboard from "@/pages/MainDashboard.vue";
import MockAdapter from "axios-mock-adapter";
import Oruga from "@oruga-ui/oruga-next";
import {HMSF} from "@/utils/HMSF";
import MarketDashboard from "@/components/dashboard/MarketDashboard.vue";
import {fetchGetURLs} from "../MockUtils";

/*
    Bookmarks
        https://jestjs.io/docs/api
        https://test-utils.vuejs.org/api/

 */

HMSF.forceUTC = true

describe("MainDashboard.vue", () => {

    test("no props", async () => {

        await router.push({name: "MainDashboard", params: {network: 'mainnet'}})

        const mock = new MockAdapter(axios)

        const matcher3 = "/api/v1/network/supply"
        mock.onGet(matcher3).reply(200, SAMPLE_NETWORK_SUPPLY);

        const matcher4 = "/api/v1/network/exchangerate"
        mock.onGet(matcher4).reply(200, SAMPLE_NETWORK_EXCHANGERATE);

        const wrapper = mount(MainDashboard, {
            global: {
                plugins: [router, Oruga]
            },
            props: {},
        });

        await flushPromises()
        // console.log(wrapper.html())

        expect(fetchGetURLs(mock)).toStrictEqual([
            "api/v1/network/exchangerate",
            "api/v1/network/exchangerate",
            "api/v1/network/supply",
            "api/v1/network/supply",
        ])

        const dash = wrapper.findComponent(MarketDashboard)
        expect(dash.exists()).toBe(true)
        expect(dash.text()).toBe(
            "HBAR PRICE" +
            "$0.2460" +
            "HBAR MARKET CAP" +
            "$5,186,816,738" +
            "HBAR RELEASED" +
            "21,084,620,884.43" +
            "HBAR TOTAL50,000,000,000")


        mock.restore()
        wrapper.unmount()
        await flushPromises()
    });
});
