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
import {SAMPLE_NETWORK_NODES} from "../Mocks";
import Oruga from "@oruga-ui/oruga-next";
import {HMSF} from "@/utils/HMSF";
import NodeTable from "@/components/node/NodeTable.vue";
import {NetworkNode} from "@/schemas/HederaSchemas";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
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

describe("NodeTable.vue", () => {

    const tooltipStake = "This is the total amount staked to this node, followed by its consensus weight" +
        " (weight is absent when the amount staked is below minimum)."
    const tooltipNotRewarded = "This is the total amount staked to this node by accounts that have chosen " +
        "to decline rewards (and all accounts staked to those accounts)."
    const tooltipRewardRate = "This is an approximate annual reward rate based on the reward earned during the " +
        "last 24h period."

    const mock = new MockAdapter(axios);
    const matcher1 = "/api/v1/network/nodes"
    mock.onGet(matcher1).reply(200, SAMPLE_NETWORK_NODES);
    NodeRegistry.instance.reload()

    it("should list the 3 nodes in the table", async () => {

        process.env = Object.assign(process.env, { VUE_APP_ENABLE_STAKING: true });

        await router.push("/") // To avoid "missing required param 'network'" error

        let testTotalStaked = 0
        for (const node of SAMPLE_NETWORK_NODES.nodes) {
            testTotalStaked += node.stake
        }
        const wrapper = mount(NodeTable, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                nodes: SAMPLE_NETWORK_NODES.nodes as Array<NetworkNode>,
                unclampedStakeTotal: testTotalStaked,
                stakeTotal: testTotalStaked
            }
        });

        await flushPromises()
        // console.log(wrapper.text())
        // console.log(wrapper.html())

        expect(wrapper.get('thead').text()).toBe("Node Description Stake Staked For No Reward Stake Range Reward Rate")
        expect(wrapper.get('tbody').findAll('tr').length).toBe(3)
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

        wrapper.unmount()
        await flushPromises()
    });

});
