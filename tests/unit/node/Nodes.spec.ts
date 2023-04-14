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
import axios from "axios";
import {SAMPLE_NETWORK_NODES, SAMPLE_NETWORK_STAKE} from "../Mocks";
import DashboardCard from "@/components/DashboardCard.vue";
import MockAdapter from "axios-mock-adapter";
import Oruga from "@oruga-ui/oruga-next";
import {HMSF} from "@/utils/HMSF";
import Nodes from "@/pages/Nodes.vue";
import NodeTable from "@/components/node/NodeTable.vue";
import NetworkDashboardItem from "@/components/node/NetworkDashboardItem.vue";
import {NodeRegistry} from "@/components/node/NodeRegistry";

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

    const tooltipStake = "This is the total amount staked to this node, followed by its consensus weight" +
        " (weight is absent when the amount staked is below minimum)."
    const tooltipNotRewarded = "This is the total amount staked to this node by accounts that have chosen " +
        "to decline rewards (and all accounts staked to those accounts)."
    const tooltipRewardRate = "This is an approximate annual reward rate based on the reward earned during the " +
        "last 24h period."

    it("should display the nodes pages containing the node table", async () => {

        process.env = Object.assign(process.env, { VUE_APP_ENABLE_STAKING: true });

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const matcher1 = "/api/v1/network/nodes"
        mock.onGet(matcher1).reply(200, SAMPLE_NETWORK_NODES);
        NodeRegistry.instance.reload()

        const matcher2 = "/api/v1/network/stake"
        mock.onGet(matcher2).reply(200, SAMPLE_NETWORK_STAKE);

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
        expect(items[0].text()).toMatch(RegExp("Total Nodes3"))
        expect(items[1].text()).toMatch(RegExp("Last Staked"))
        expect(items[2].text()).toMatch(RegExp("Total Staked24,000,000HBAR"))
        expect(items[3].text()).toMatch(RegExp("Next Staking Periodin"))
        expect(items[4].text()).toMatch(RegExp("Last Period Reward1,095HBAR"))
        expect(items[5].text()).toMatch(RegExp("Staking Period24h"))

        expect(cards[1].text()).toMatch(RegExp("^Nodes"))
        const table = cards[1].findComponent(NodeTable)
        expect(table.exists()).toBe(true)
        expect(table.get('thead').text()).toBe("Node Description Stake Staked For No Reward Stake Range Reward Rate")
        expect(wrapper.get('tbody').text()).toBe(
            "0" +
            "Hosted by Hedera | East Coast, USA" +
            tooltipStake + "6,000,000(25%)" +
            tooltipNotRewarded + "1,000,000" +
            "Rewarded:5,000,000Not Rewarded:1,000,000Min:1,000,000Max:30,000,000" +
            tooltipRewardRate + "1%" +
            "1" +
            "Hosted by Hedera | East Coast, USA" +
            tooltipStake + "9,000,000(37.5%)" +
            tooltipNotRewarded + "2,000,000" +
            "Rewarded:7,000,000Not Rewarded:2,000,000Min:1,000,000Max:30,000,000" +
            tooltipRewardRate + "2%" +
            "2" +
            "Hosted by Hedera | Central, USA" +
            tooltipStake + "9,000,000(37.5%)" +
            tooltipNotRewarded + "2,000,000" +
            "Rewarded:7,000,000Not Rewarded:2,000,000Min:1,000,000Max:30,000,000" +
            tooltipRewardRate + "3%"
        )
    });

});
