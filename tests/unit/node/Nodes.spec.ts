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

import {describe, expect, it} from 'vitest'
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

/*
    Bookmarks
        https://jestjs.io/docs/api
        https://test-utils.vuejs.org/api/

 */

HMSF.forceUTC = true

describe("Nodes.vue", () => {

    const tooltipStake = "Total amount of HBAR staked to this specific validator for consensus."
    const tooltipPercentage = "Total amount of HBAR staked to this validator for consensus / total amount of HBAR staked to all validators for consensus."
    const tooltipRewardRate = "Approximate annual reward rate based on the reward earned during the " +
        "last 24h period."

    it("should display the nodes pages containing the node table", async () => {


        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const matcher1 = "/api/v1/network/nodes"
        mock.onGet(matcher1).reply(200, SAMPLE_NETWORK_NODES);

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
        expect(items.length).toBe(9)
        expect(items[0].text()).toMatch("Last Staked")
        expect(items[1].text()).toMatch("Next Staking Period")
        expect(items[2].text()).toMatch("Staking Period24h")
        expect(items[3].text()).toMatch("Total Staked24,000,000HBAR")
        expect(items[4].text()).toMatch("Staked for Reward19,000,000HBAR")
        expect(items[5].text()).toMatch("Maximum Staked for Reward0HBAR")
        expect(items[6].text()).toMatch("Rewarded Last Period1,095HBAR")
        expect(items[7].text()).toMatch("Maximum Reward Rate0%")
        expect(items[8].text()).toMatch("Current Reward Rate0%")

        expect(cards[1].text()).toMatch("3  Nodes")
        const table = cards[1].findComponent(NodeTable)
        expect(table.exists()).toBe(true)
        expect(table.get('thead').text()).toBe("Node Description Stake for Consensus % Stake Range Reward Rate")
        expect(wrapper.get('tbody').text()).toBe(
            "0" +
            "Hosted by Hedera | East Coast, USA" +
            tooltipStake + "6,000,000ℏ" +
            tooltipPercentage + "25%" +
            "Rewarded:5,000,000ℏNot Rewarded:1,000,000ℏMin:1,000,000ℏMax:30,000,000ℏ" +
            tooltipRewardRate + "1%" +
            "1" +
            "Hosted by Hedera | East Coast, USA" +
            tooltipStake + "9,000,000ℏ" +
            tooltipPercentage + "37.5%" +
            "Rewarded:7,000,000ℏNot Rewarded:2,000,000ℏMin:1,000,000ℏMax:30,000,000ℏ" +
            tooltipRewardRate + "2%" +
            "2" +
            "Hosted by Hedera | Central, USA" +
            tooltipStake + "9,000,000ℏ" +
            tooltipPercentage + "37.5%" +
            "Rewarded:7,000,000ℏNot Rewarded:2,000,000ℏMin:1,000,000ℏMax:30,000,000ℏ" +
            tooltipRewardRate + "3%"
        )

        mock.restore()
        wrapper.unmount()
        await flushPromises()
    });

});
