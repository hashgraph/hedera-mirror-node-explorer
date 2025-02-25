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
import {SAMPLE_NETWORK_EXCHANGERATE, SAMPLE_NETWORK_SUPPLY, SAMPLE_TOKEN, SAMPLE_TRANSACTIONS} from "./Mocks";
import App from "@/App.vue";
import MockAdapter from "axios-mock-adapter";
import Oruga from "@oruga-ui/oruga-next";
import {HMSF} from "@/utils/HMSF";
import {NetworkConfig} from "../../src/config/NetworkConfig";
import {routeManager} from "../../src/router";
import MainDashboardHeader from "@/components/page/header/MainDashboardHeader.vue";
import Footer from "@/components/page/Footer.vue";
import ChartView from "@/charts/core/ChartView.vue";

/*
    Bookmarks
        https://jestjs.io/docs/api
        https://test-utils.vuejs.org/api/

 */

HMSF.forceUTC = true

describe("App.vue", () => {

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

        const networkConfig = NetworkConfig.parse([
            {
                name: "customnet1",
                url: "/testurl1",
                ledgerID: "01",
                enableWallet: true,
                enableStaking: false,
                enableExpiry: true,
                enableMarket: false,
                sourcifySetup: null
            },
            {
                name: "customnet2",
                url: "/testurl2",
                ledgerID: "02",
                enableWallet: true,
                enableStaking: false,
                enableExpiry: true,
                enableMarket: false,
                sourcifySetup: null
            },
            {
                name: "customnet3",
                url: "/testurl3",
                ledgerID: "03",
                enableWallet: true,
                enableStaking: false,
                enableExpiry: true,
                enableMarket: false,
                sourcifySetup: null
            }
        ]);
        routeManager.configure(routeManager.coreConfig, networkConfig)
        await router.push("/")

        const wrapper = mount(App, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                coreConfig: routeManager.coreConfig,
                networkConfig: routeManager.networkConfig
            },
        });
        expect(routeManager.currentNetwork.value).toBe("customnet1")

        await flushPromises()

        // console.log(wrapper.html())
        // console.log(wrapper.text())

        const charts = wrapper.findAllComponents(ChartView)
        expect(charts.length).toBe(3)
        expect(charts[0].text()).toMatch(RegExp("^Transactions Over Time"))
        expect(charts[1].text()).toMatch(RegExp("^Network Fees"))
        expect(charts[2].text()).toMatch(RegExp("^Active Accounts"))

        expect(wrapper.findComponent(MainDashboardHeader).exists()).toBe(true)
        expect(wrapper.findComponent(Footer).exists()).toBe(true)

        mock.restore()
        wrapper.unmount()
        await flushPromises()
    });

});
