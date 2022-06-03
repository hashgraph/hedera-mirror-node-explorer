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

import {flushPromises, mount} from "@vue/test-utils"
import router from "@/router";
import axios from "axios";
import {SAMPLE_COINGECKO, SAMPLE_NETWORK_SUPPLY, SAMPLE_TOKEN, SAMPLE_TRANSACTIONS} from "./Mocks";
import App from "@/App.vue";
import TopNavBar from "@/components/TopNavBar.vue";
import HbarMarketDashboard from "@/components/dashboard/HbarMarketDashboard.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import MockAdapter from "axios-mock-adapter";
import Oruga from "@oruga-ui/oruga-next";
import {HMSF} from "@/utils/HMSF";

/*
    Bookmarks
        https://jestjs.io/docs/api
        https://test-utils.vuejs.org/api/

 */

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

HMSF.forceUTC = true

describe("App.vue", () => {

    test("normal screen", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error
        Object.defineProperty(window, 'innerWidth', {writable: true, configurable: true, value: 1920})

        const mock = new MockAdapter(axios)

        const matcher1 = "/api/v1/transactions"
        mock.onGet(matcher1).reply(200, SAMPLE_TRANSACTIONS)

        const matcher2 = "/api/v1/tokens/" + SAMPLE_TOKEN.token_id
        mock.onGet(matcher2).reply(200, SAMPLE_TOKEN)

        const matcher3 = "https://api.coingecko.com/api/v3/coins/hedera-hashgraph"
        mock.onGet(matcher3).reply(200, SAMPLE_COINGECKO);

        const matcher4 = "/api/v1/network/supply/"
        mock.onGet(matcher4).reply(200, SAMPLE_NETWORK_SUPPLY);

        const wrapper = mount(App, {
            global: {
                plugins: [router, Oruga]
            },
            props: {},
        });

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        const sections = wrapper.findAll('section')
        expect(sections.length).toBe(3)

        const navBar = wrapper.findComponent(TopNavBar)
        expect(navBar.exists()).toBe(true)
        expect(navBar.text()).toBe(
            "Hedera Mirror Node Explorer is a ledger explorer for the Hedera network" +
            "Build date: not available" +
            "MAINNETTESTNETPREVIEWNETDashboardTransactionsTokensTopicsContractsAccounts")

        expect(wrapper.findComponent(HbarMarketDashboard).exists()).toBe(true)

        const cards = wrapper.findAllComponents(DashboardCard)
        expect(cards.length).toBe(3)
        expect(cards[0].text()).toMatch(RegExp("^Crypto Transfers"))
        expect(cards[1].text()).toMatch(RegExp("^Smart Contract Calls"))
        expect(cards[2].text()).toMatch(RegExp("^HCS Messages"))

        const logos = wrapper.findAll("img")
        expect(logos.length).toBe(6)
        expect(logos[0].attributes('alt')).toBe("Product Logo")
        expect(logos[1].attributes('alt')).toBe("Built On Hedera")
        expect(logos[2].attributes('alt')).toBe("Trend Up")
        expect(logos[3].attributes('alt')).toBe("Trend Up")
        expect(logos[4].attributes('alt')).toBe("Built On Hedera")
        expect(logos[5].attributes('alt')).toBe("Sponsor Logo")

        wrapper.unmount()
    });

});
