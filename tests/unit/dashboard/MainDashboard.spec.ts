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
import {SAMPLE_COINGECKO, SAMPLE_NETWORK_SUPPLY, SAMPLE_TOKEN, SAMPLE_TRANSACTIONS} from "../Mocks";
import MainDashboard from "@/pages/MainDashboard.vue";
import HbarMarketDashboard from "@/components/dashboard/HbarMarketDashboard.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import PlayPauseButton from "@/components/PlayPauseButton.vue";
import CryptoTransactionTable from "@/components/dashboard/CryptoTransactionTable.vue";
import ContractCallTransactionTable from "@/components/dashboard/ContractCallTransactionTable.vue";
import MessageTransactionTable from "@/components/dashboard/MessageTransactionTable.vue";
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

describe("MainDashboard.vue", () => {

    test("no props", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios)

        const matcher1 = "/api/v1/transactions"
        mock.onGet(matcher1).reply(200, SAMPLE_TRANSACTIONS)

        const matcher2 = "/api/v1/tokens/" + SAMPLE_TOKEN.token_id
        mock.onGet(matcher2).reply(200, SAMPLE_TOKEN)

        const matcher3 = "https://api.coingecko.com/api/v3/coins/hedera-hashgraph"
        mock.onGet(matcher3).reply(200, SAMPLE_COINGECKO);

        const matcher4 = "/api/v1/network/supply/"
        mock.onGet(matcher4).reply(200, SAMPLE_NETWORK_SUPPLY);

        const wrapper = mount(MainDashboard, {
            global: {
                plugins: [router, Oruga]
            },
            props: {},
        });

        await flushPromises()
        // console.log(wrapper.html())

        const dash = wrapper.findComponent(HbarMarketDashboard)
        expect(dash.exists()).toBe(true)
        expect(dash.text()).toBe(
            "$0.24608.42%HBAR PRICE" +
            "$4,486,259,9418.42%HBAR MARKET CAP" +
            "21,084,620,884.43HBAR RELEASED" +
            "50,000,000,000HBAR TOTAL")

        const cards = wrapper.findAllComponents(DashboardCard)
        expect(cards.length).toBe(3)

        expect(cards[0].text()).toMatch(RegExp("^Crypto Transfers"))
        expect(cards[0].findComponent(PlayPauseButton).exists()).toBe(true)
        const t0 = cards[0].findComponent(CryptoTransactionTable)
        expect(t0.exists()).toBe(true)
        expect(t0.get('thead').text()).toBe("ID Content Time")
        expect(t0.get('tbody').text()).toBe(
            "0.0.29624024@1646025139.1529014980.0.29624024\n\n" +
            "1\n\n" +
            "0.0.296939115:12:31.6676 AMFeb 28, 2022"
        )

        expect(cards[1].text()).toMatch(RegExp("^Smart Contract Calls"))
        expect(cards[1].findComponent(PlayPauseButton).exists()).toBe(true)
        const t1 = cards[1].findComponent(ContractCallTransactionTable)
        expect(t1.exists()).toBe(true)
        expect(t1.get('thead').text()).toBe("ID Content Time")
        expect(t1.get('tbody').text()).toBe(
            "0.0.29624024@1646025139.1529014980.0.29624024\n\n" +
            "1\n\n" +
            "0.0.296939115:12:31.6676 AMFeb 28, 2022"
        )

        expect(cards[2].text()).toMatch(RegExp("^HCS Messages"))
        expect(cards[2].findComponent(PlayPauseButton).exists()).toBe(true)
        const t2 = cards[2].findComponent(MessageTransactionTable)
        expect(t2.exists()).toBe(true)
        expect(t2.get('thead').text()).toBe("Topic ID Memo Time")
        expect(t2.get('tbody').text()).toBe(
            "0.0.29662956" +
            "None" +
            "5:12:31.6676 AMFeb 28, 2022"
        )

    });

});
