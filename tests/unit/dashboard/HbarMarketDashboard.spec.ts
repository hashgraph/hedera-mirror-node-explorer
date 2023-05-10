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


/*
    Bookmarks
        https://test-utils.vuejs.org/api/

 */

import {flushPromises, mount} from "@vue/test-utils";
import HbarMarketDashboard from "@/components/dashboard/HbarMarketDashboard.vue";
import {SAMPLE_NETWORK_EXCHANGERATE, SAMPLE_NETWORK_SUPPLY} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import router from "@/router";

describe("HbarMarketDashboard.vue ", () => {

    it("should display the market dashboard banner", async () => {

        await router.push({name: "MainDashboard", params: { network: 'mainnet' }})

        const mock = new MockAdapter(axios);

        const matcher1 = "/api/v1/network/supply"
        mock.onGet(matcher1).reply(200, SAMPLE_NETWORK_SUPPLY);

        const matcher2 = "/api/v1/network/exchangerate"
        mock.onGet(matcher2).reply(200, SAMPLE_NETWORK_EXCHANGERATE);

        const wrapper = mount(HbarMarketDashboard);

        await flushPromises()
        // console.log(wrapper.text())

        expect(wrapper.vm.marketDataCache.hbarPriceCache.autoRefresh.value).toBe(true)
        expect(wrapper.vm.marketDataCache.hbarPrice24hCache.autoRefresh.value).toBe(true)
        expect(wrapper.vm.marketDataCache.hbarSupplyCache.autoRefresh.value).toBe(true)
        expect(wrapper.vm.marketDataCache.hbarSupply24hCache.autoRefresh.value).toBe(true)

        expect(wrapper.text()).toBe(
            "$0.2460" +
            "0.00%" +
            "HBAR PRICE" +
            "$5,186,816,738" +
            "0.00%" +
            "HBAR MARKET CAP" +
            "21,084,620,884.43" +
            "HBAR RELEASED" +
            "50,000,000,000" +
            "HBAR TOTAL"
        )

        const logos = wrapper.findAll("img")
        expect(logos.length).toBe(2)

        expect(logos[0].attributes('alt')).toBe("Trend Up")
        expect(logos[1].attributes('alt')).toBe("Trend Up")

        wrapper.unmount()
        await flushPromises()

        expect(wrapper.vm.marketDataCache.hbarPriceCache.autoRefresh.value).toBe(false)
        expect(wrapper.vm.marketDataCache.hbarPrice24hCache.autoRefresh.value).toBe(false)
        expect(wrapper.vm.marketDataCache.hbarSupplyCache.autoRefresh.value).toBe(false)
        expect(wrapper.vm.marketDataCache.hbarSupply24hCache.autoRefresh.value).toBe(false)
    });

    it("should display the testnet banner", async () => {

        await router.push({name: "MainDashboard", params: { network: 'testnet' }})

        const wrapper = mount(HbarMarketDashboard);
        await flushPromises()
        // console.log(wrapper.text())

        expect(wrapper.text()).toBe("TESTNET")

        wrapper.unmount()
        await flushPromises()
    });

    it("should display the previewnet banner", async () => {

        await router.push({name: "MainDashboard", params: { network: 'previewnet' }})

        const wrapper = mount(HbarMarketDashboard);
        await flushPromises()
        // console.log(wrapper.text())

        expect(wrapper.text()).toBe("PREVIEWNET")

        wrapper.unmount()
        await flushPromises()
    });
});
