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
import {SAMPLE_NETWORK_NODES} from "../Mocks";
import DashboardCard from "@/components/DashboardCard.vue";
import MockAdapter from "axios-mock-adapter";
import Oruga from "@oruga-ui/oruga-next";
import {HMSF} from "@/utils/HMSF";
import Nodes from "@/pages/Nodes.vue";
import NodeTable from "@/components/node/NodeTable.vue";
import NetworkDashboardItem from "@/components/node/NetworkDashboardItem.vue";

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

describe("Nodes.vue", () => {

    it("should display the nodes pages containing the node table", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const matcher1 = "/api/v1/network/nodes"
        mock.onGet(matcher1).reply(200, SAMPLE_NETWORK_NODES);

        const wrapper = mount(Nodes, {
            global: {
                plugins: [router, Oruga]
            }
        });

        await flushPromises()
        // console.log(wrapper.text())

        const cards = wrapper.findAllComponents(DashboardCard)
        expect(cards.length).toBe(2)

        expect(cards[0].text()).toMatch(RegExp("^Network"))
        const items = cards[0].findAllComponents(NetworkDashboardItem)
        expect(items.length).toBe(6)
        expect(items[0].text()).toMatch(RegExp("Total Nodes"))
        expect(items[1].text()).toMatch(RegExp("Last Staked"))
        expect(items[2].text()).toMatch(RegExp("Total Staked"))
        expect(items[3].text()).toMatch(RegExp("Staking Period"))
        expect(items[4].text()).toMatch(RegExp("Total Rewarded"))
        expect(items[5].text()).toMatch(RegExp("Staking Period"))

        expect(cards[1].text()).toMatch(RegExp("^Nodes"))
        const table = cards[1].findComponent(NodeTable)
        expect(table.exists()).toBe(true)
        expect(table.get('thead').text()).toBe("Node Account Hosted By Location Stake Stake Range % of Total Stake")
        expect(wrapper.get('tbody').text()).toBe(
            "0" + "0.0.3" + "None" + "None" + "12352698.00000000" + "3,8%" +
            "1" + "0.0.4" + "None" + "None" + "12352698.00000000" + "3,8%" +
            "2" + "0.0.5" + "None" + "None" + "12352698.00000000" + "3,8%"
        )
    });

});
