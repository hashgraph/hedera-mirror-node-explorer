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
import router from "@/router";
import {flushPromises, mount} from "@vue/test-utils";
import {Transaction, TransactionDetail} from "@/schemas/MirrorNodeSchemas";
import RewardTransferGraph from "@/components/transfer_graphs/RewardTransferGraph.vue";
import {
    SAMPLE_CRYPTO_TRANSFER_WITH_ONLY_FEE,
    SAMPLE_CRYPTO_TRANSFER_WITH_REWARDS,
    SAMPLE_NETWORK_EXCHANGERATE
} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

describe("RewardTransferGraph.vue", () => {

    test("Without transaction prop", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(RewardTransferGraph, {
            global: {
                plugins: [router]
            },
            props: {},
        })

        await flushPromises()

        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toBe("")

        wrapper.unmount()
        await flushPromises()
    })

    test("with transfers and no rewards", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(RewardTransferGraph, {
            global: {
                plugins: [router]
            },
            props: {
                transaction: SAMPLE_CRYPTO_TRANSFER_WITH_ONLY_FEE as Transaction,
            },
        })

        await flushPromises()

        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toBe("")

        wrapper.unmount()
    })

    test.skip("with multiple transfers and rewards", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);
        const matcher1 = "/api/v1/network/exchangerate"
        mock.onGet(matcher1).reply(200, SAMPLE_NETWORK_EXCHANGERATE);

        const wrapper = mount(RewardTransferGraph, {
            global: {
                plugins: [router]
            },
            props: {
                transaction: SAMPLE_CRYPTO_TRANSFER_WITH_REWARDS as TransactionDetail,

            },
        })

        await flushPromises()

        // console.log(wrapper.html())
        // console.log(wrapper.text())

        /*
            0.0.800     ->      0.0.788887      2.10704256
                        ->      0.0.2254995     22.89378672
         */

        expect(wrapper.text()).toBe(
            "Staking Rewards" +
            "Reward AccountAccountAmount Rewarded" +
            "0.0.800\n\n" +
            "0.0.788887" +
            "2.10704256ℏ" + "$0.51840\n\n" +
            "0.0.2254995" +
            "22.89378672ℏ" + "$5.63263")

        mock.restore()
        wrapper.unmount()
    })

})

