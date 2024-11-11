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
import {SAMPLE_NETWORK_NODES} from "../Mocks";
import Oruga from "@oruga-ui/oruga-next";
import {HMSF} from "@/utils/HMSF";
import NodeTable from "@/components/node/NodeTable.vue";
import {NetworkNode} from "@/schemas/HederaSchemas";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

/*
    Bookmarks
        https://jestjs.io/docs/api
        https://test-utils.vuejs.org/api/

 */

HMSF.forceUTC = true

describe("NodeTable.vue", () => {

    const tooltipStake = "Total amount of HBAR staked to this specific validator for consensus."
    const tooltipPercentage = "Total amount of HBAR staked to this validator for consensus / total amount of HBAR staked to all validators for consensus."
    const tooltipRewardRate = "Approximate annual reward rate based on the reward earned during the last 24h period."

    it("should list the 3 nodes in the table", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);
        const matcher1 = "/api/v1/network/nodes"
        mock.onGet(matcher1).reply(200, SAMPLE_NETWORK_NODES);

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
                stakeTotal: testTotalStaked
            }
        });

        await flushPromises()
        // console.log(wrapper.text())
        // console.log(wrapper.html())

        expect(wrapper.get('thead').text()).toBe("Node Description Stake for Consensus % Stake Range Reward Rate")
        expect(wrapper.get('tbody').findAll('tr').length).toBe(3)
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
