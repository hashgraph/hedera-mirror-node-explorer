// noinspection DuplicatedCode

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
import MockAdapter from "axios-mock-adapter";
import Oruga from "@oruga-ui/oruga-next";
import {HMSF} from "@/utils/HMSF";
import NodeDetails from "@/pages/NodeDetails.vue";

/*
    Bookmarks
        https://jestjs.io/docs/api
        https://test-utils.vuejs.org/api/

 */

HMSF.forceUTC = true

describe.skip("NodeDetails.vue", () => {

    it("should display node details", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error
        //
        // const config = [
        //     {
        //         "name": "mainnet",
        //         "displayName": "MAINNET",
        //         "url": "https://mainnet-public.mirrornode.hedera.com/",
        //         "ledgerID": "00",
        //         "enableWallet": true,
        //         "enableStaking": true,
        //         "sourcifySetup": null
        //     }
        // ]

        const mock = new MockAdapter(axios);
        //
        //
        // const configUrl = NetworkRegistry.NETWORKS_CONFIG_URL
        // mock.onGet(configUrl).reply(200, config)
        // networkRegistry.readCustomConfig()

        const node = 0
        const matcher1 = "api/v1/network/nodes"
        mock.onGet(matcher1).reply(200, SAMPLE_NETWORK_NODES);

        const matcher2 = "api/v1/network/stake"
        mock.onGet(matcher2).reply(200, SAMPLE_NETWORK_STAKE);

        const wrapper = mount(NodeDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                nodeId: node.toString()
            }
        });

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("Node " + node))
        expect(wrapper.get("#nodeAccountValue").text()).toBe("0.0.3")
        expect(wrapper.get("#descriptionValue").text()).toBe("Hosted by Hedera | East Coast, USA")
        expect(wrapper.get("#publicKeyValue").text()).toBe("3082 01a2 300d 0609CopyRSA")
        expect(wrapper.get("#fileValue").text()).toBe("0.0.102")
        expect(wrapper.get("#rangeFromValue").text()).toBe("4:10:06.0411 PMJun 6, 2022, UTC")
        expect(wrapper.get("#rangeToValue").text()).toBe("None")
        expect(wrapper.get("#nodeCertHashValue").text()).toBe("d316 b5ef 57b7 6daf 37e3 bebb e3b6 9e6f 67b6 69ce 1dd1 ed75 e5c6 9a69 bf75 f36d 376f 475f 7b57 1d79 a6f8 e37e 37f1 f736 f3d6 9b73 c6da f1ae 9a7d ff37 75be 5fd5 bdf7 e34e 3a75 af3c 73Copy")
        expect(wrapper.get("#serviceEndpointsValue").text()).toBe("3.211.248.172:502113.211.248.172:5021235.231.208.148:035.231.208.148:5021135.231.208.148:50212")

        expect(wrapper.get("#yearlyRate").text()).toBe("Last Period Reward Rate1%APPROX ANNUAL EQUIVALENT")
        expect(wrapper.get("#consensusStake").text()).toBe("Stake for Consensus6,000,000HBAR")
        expect(wrapper.get("#consensusStakePercent").text()).toBe("25% of total")
        expect(wrapper.get("#minStake").text()).toBe("Min Stake1,000,000HBAR")
        expect(wrapper.get("#maxStake").text()).toBe("Max Stake30,000,000HBAR")
        expect(wrapper.get("#rewarded").text()).toBe("Staked for Reward5,000,000HBAR")
        expect(wrapper.get("#rewardedPercent").text()).toBe("26.32% of total")
        expect(wrapper.get("#notRewarded").text()).toBe("Staked For No Reward1,000,000HBAR")
        expect(wrapper.get("#notRewardedPercent").text()).toBe("20% of total")
        expect(wrapper.get("#stakingPeriod").text()).toBe("Current Staking Period24HOURS")

        mock.restore()
        wrapper.unmount()
        await flushPromises()
    });

    it("should update when node id changes", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error
        const mock = new MockAdapter(axios);

        let node = 0
        const matcher1 = "api/v1/network/nodes"
        mock.onGet(matcher1).reply(200, SAMPLE_NETWORK_NODES);

        const matcher2 = "api/v1/network/stake"
        mock.onGet(matcher2).reply(200, SAMPLE_NETWORK_STAKE);

        const wrapper = mount(NodeDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                nodeId: node.toString()
            }
        });

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("Node " + node))
        expect(wrapper.get("#nodeAccountValue").text()).toBe("0.0.3")
        expect(wrapper.get("#descriptionValue").text()).toBe("Hosted by Hedera | East Coast, USA")
        expect(wrapper.get("#nodeCertHashValue").text()).toBe("d316 b5ef 57b7 6daf 37e3 bebb e3b6 9e6f 67b6 69ce 1dd1 ed75 e5c6 9a69 bf75 f36d 376f 475f 7b57 1d79 a6f8 e37e 37f1 f736 f3d6 9b73 c6da f1ae 9a7d ff37 75be 5fd5 bdf7 e34e 3a75 af3c 73Copy")

        node = 1
        await wrapper.setProps({
            nodeId: node.toString()
        })
        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("Node " + node))
        expect(wrapper.get("#nodeAccountValue").text()).toBe("0.0.4")
        expect(wrapper.get("#descriptionValue").text()).toBe("Hosted by Hedera | East Coast, USA")
        expect(wrapper.get("#nodeCertHashValue").text()).toBe("d31e f8d3 d75e 7367 b8f7 86fa dbb7 9ee3 d73a f5bd bde1 b7b5 71e6 9e6d c6b7 7dd7 1a7f 7ebb f3d7 bcf1 f73b 7796 f479 e7f9 e7ad 5fe7 66fc d9dd f9d7 dd5a dfd7 367d b79d eb4d bbdb aef5 ebCopy")

        mock.restore()
        wrapper.unmount()
        await flushPromises()
    });

});
