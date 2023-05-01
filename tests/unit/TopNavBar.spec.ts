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

import {flushPromises, mount} from "@vue/test-utils"
import router from "@/router";
import SearchBar from "@/components/SearchBar.vue";
import TopNavBar from "@/components/TopNavBar.vue";
import Oruga from "@oruga-ui/oruga-next";
import {HMSF} from "@/utils/HMSF";

/*
    Bookmarks
        https://jestjs.io/docs/api
        https://test-utils.vuejs.org/api/

 */

HMSF.forceUTC = true

describe("TopNavBar.vue", () => {

    it("Should display page links without Staking and Blocks", async () => {
        process.env = Object.assign(process.env, { VUE_APP_ENABLE_STAKING: true });

        await router.push("/") // To avoid "missing required param 'network'" error
        Object.defineProperty(window, 'innerWidth', {writable: true, configurable: true, value: 1920})

        const wrapper = mount(TopNavBar, {
            global: {
                plugins: [router, Oruga]
            },
            props: {},
        });

        await flushPromises()
        // console.log(wrapper.text())

        expect(wrapper.text()).toBe(
            "MAINNETTESTNETPREVIEWNETDashboardTransactionsTokensTopicsContractsAccountsNodesStakingBlocks")

        const links = wrapper.findAll("a")
        expect(links.length).toBe(11)

        wrapper.unmount()
        await flushPromises()
    })

    it("Should display logos, page links and full search bar", async () => {
        process.env = Object.assign(process.env, { VUE_APP_ENABLE_STAKING: true });

        await router.push("/") // To avoid "missing required param 'network'" error
        Object.defineProperty(window, 'innerWidth', {writable: true, configurable: true, value: 1920})

        const wrapper = mount(TopNavBar, {
            global: {
                plugins: [router, Oruga]
            },
            props: {},
        });

        await flushPromises()
        // console.log(wrapper.text())

        expect(wrapper.text()).toBe(
            "MAINNETTESTNETPREVIEWNETDashboardTransactionsTokensTopicsContractsAccountsNodesStakingBlocks")

        const links = wrapper.findAll("a")
        expect(links.length).toBe(11)

        expect(links[2].text()).toBe("Dashboard")
        expect(links[3].text()).toBe("Transactions")
        expect(links[4].text()).toBe("Tokens")
        expect(links[5].text()).toBe("Topics")
        expect(links[6].text()).toBe("Contracts")
        expect(links[7].text()).toBe("Accounts")
        expect(links[8].text()).toBe("Nodes")
        expect(links[9].text()).toBe("Staking")
        expect(links[10].text()).toBe("Blocks")

        expect(wrapper.findComponent(SearchBar).exists()).toBe(true)

        const logos = wrapper.findAll("img")
        expect(logos.length).toBe(2)
        expect(logos[0].attributes('alt')).toBe("Product Logo")
        expect(logos[1].attributes('alt')).toBe("Modal close icon")

        wrapper.unmount()
        await flushPromises()
    });

    it("Should display the drop-down Network selection menu", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error
        Object.defineProperty(window, 'innerWidth', {writable: true, configurable: true, value: 960})

        const wrapper = mount(TopNavBar, {
            global: {
                plugins: [router, Oruga],
                provide: {
                    isXLargeScreen: false
                }
            },
            props: {},
        });

        await flushPromises()
        // console.log(wrapper.text())
        // console.log(wrapper.html())

        const options = wrapper.findAll("option")
        expect(options.length).toBe(3)
        expect(options[0].text()).toBe("MAINNET")
        expect(options[1].text()).toBe("TESTNET")
        expect(options[2].text()).toBe("PREVIEWNET")

        wrapper.unmount()
        await flushPromises()
    });

});
