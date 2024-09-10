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

import {beforeEach, describe, expect, test} from 'vitest'
import {flushPromises, mount} from "@vue/test-utils"
import router from "@/router";
import axios from "axios";
import {SAMPLE_NETWORK_EXCHANGERATE, SAMPLE_NETWORK_SUPPLY, SAMPLE_TOKEN, SAMPLE_TRANSACTIONS} from "./Mocks";
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

HMSF.forceUTC = true

describe("App.vue", () => {

    beforeEach(() => {
        Object.assign(import.meta.env, {VITE_APP_ENABLE_STAKING: false});
    })

    test("normal screen", async () => {

        await router.push({name: "MainDashboard", params: {network: 'mainnet'}})
        Object.defineProperty(window, 'innerWidth', {writable: true, configurable: true, value: 1920})

        const mock = new MockAdapter(axios)

        const matcher1 = "/api/v1/transactions"
        mock.onGet(matcher1).reply(200, SAMPLE_TRANSACTIONS)

        const matcher2 = "/api/v1/tokens/" + SAMPLE_TOKEN.token_id
        mock.onGet(matcher2).reply(200, SAMPLE_TOKEN)

        const matcher3 = "/api/v1/network/supply"
        mock.onGet(matcher3).reply(200, SAMPLE_NETWORK_SUPPLY);

        const matcher4 = "/api/v1/network/exchangerate"
        mock.onGet(matcher4).reply(200, SAMPLE_NETWORK_EXCHANGERATE);

        const matcher10 = window.location.origin + '/networks-config.json'
        mock.onGet(matcher10).reply(200, [
            {name: "customnet1", url: "/testurl1", ledgerID: "01", sourcifySetup: null},
            {name: "customnet2", url: "/testurl2", ledgerID: "02", sourcifySetup: null},
            {name: "customnet3", url: "/testurl3", ledgerID: "03", sourcifySetup: null}
        ]);

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
            "Connect WalletCANCELCONNECT DisclaimerPlease don't show me this next timeCANCELAGREEDashboardTransactionsTokensTopicsContractsAccountsNodesBlocksCUSTOMNET1CUSTOMNET2CUSTOMNET3CONNECT WALLET...")

        expect(wrapper.findComponent(HbarMarketDashboard).exists()).toBe(true)

        const cards = wrapper.findAllComponents(DashboardCard)
        expect(cards.length).toBe(3)
        expect(cards[0].text()).toMatch(RegExp("^Crypto Transfers"))
        expect(cards[1].text()).toMatch(RegExp("^Smart Contract Calls"))
        expect(cards[2].text()).toMatch(RegExp("^HCS Messages"))

        const logos = wrapper.findAll("img")
        expect(logos.length).toBe(16)
        expect(logos[0].attributes('alt')).toBe("")
        expect(logos[1].attributes('alt')).toBe("wallet logo")
        expect(logos[2].attributes('alt')).toBe("wallet logo")
        expect(logos[3].attributes('alt')).toBe("wallet logo")
        expect(logos[4].attributes('alt')).toBe("wallet logo")
        expect(logos[5].attributes('alt')).toBe("wallet logo")
        expect(logos[6].attributes('alt')).toBe("Modal close icon")
        expect(logos[7].attributes('alt')).toBe("Product Logo")
        expect(logos[8].attributes('alt')).toBe("Modal close icon")
        expect(logos[9].attributes('alt')).toBe("Trend Up")
        expect(logos[10].attributes('alt')).toBe("Trend Up")
        expect(logos[11].attributes('alt')).toBe("Pause")
        expect(logos[12].attributes('alt')).toBe("Pause")
        expect(logos[13].attributes('alt')).toBe("Pause")
        expect(logos[14].attributes('alt')).toBe("Built On Hedera")
        expect(logos[15].attributes('alt')).toBe("Sponsor Logo")

        mock.restore()
        wrapper.unmount()
        await flushPromises()
    });

});
