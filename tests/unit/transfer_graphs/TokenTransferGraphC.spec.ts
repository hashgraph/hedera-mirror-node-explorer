// noinspection DuplicatedCode

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

import router from "@/router";
import {flushPromises, mount} from "@vue/test-utils";
import TokenTransferGraphC from "@/components/transfer_graphs/TokenTransferGraphC.vue";
import {Transaction} from "@/schemas/HederaSchemas";
import {SAMPLE_TOKEN, SAMPLE_TOKEN_DUDE} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";


const mock = new MockAdapter(axios);
const matcher1 = "/api/v1/tokens/" + SAMPLE_TOKEN.token_id
mock.onGet(matcher1).reply(200, SAMPLE_TOKEN);
const matcher2 = "/api/v1/tokens/" + SAMPLE_TOKEN_DUDE.token_id
mock.onGet(matcher2).reply(200, SAMPLE_TOKEN_DUDE);


describe("TokenTransferGraphC.vue", () => {

    test("Without transaction", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(TokenTransferGraphC, {
            global: {
                plugins: [router]
            },
            props: {},
        })

        await flushPromises()

        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toBe("")
    })

    //
    // Single Token
    //

    test("Single token, zero source, single dest", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const transaction = {
            "token_transfers": [
                { "account": "0.0.200", "amount": +10, "token_id": SAMPLE_TOKEN.token_id },
            ],
        }

        const wrapper = mount(TokenTransferGraphC, {
            global: {
                plugins: [router]
            },
            props: {
                transaction: transaction as Transaction
            },
        })

        await flushPromises()

        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toBe("MINT\n\n10\n\n0.0.200")
    })

    test("Single token, single source, single dest", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const transaction = {
            "token_transfers": [
                { "account": "0.0.100", "amount": -10, "token_id": SAMPLE_TOKEN.token_id },
                { "account": "0.0.200", "amount": +10, "token_id": SAMPLE_TOKEN.token_id },
            ],
        }

        const wrapper = mount(TokenTransferGraphC, {
            global: {
                plugins: [router]
            },
            props: {
                transaction: transaction as Transaction
            },
        })

        await flushPromises()

        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toBe(
            "0.0.100\n\n" +
            "10\n\n" +
            "0.0.200")
    })

    test("Single token, single source, two dest", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const transaction = {
            "token_transfers": [
                { "account": "0.0.100", "amount": -10, "token_id": SAMPLE_TOKEN.token_id },
                { "account": "0.0.200", "amount": +2, "token_id": SAMPLE_TOKEN.token_id },
                { "account": "0.0.201", "amount": +8, "token_id": SAMPLE_TOKEN.token_id },
            ],
        }

        const wrapper = mount(TokenTransferGraphC, {
            global: {
                plugins: [router]
            },
            props: {
                transaction: transaction as Transaction,
            },
        })

        await flushPromises()

        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toBe(
            "0.0.100\n\n" +
            "10\n\n" +
            "0.0.200\n\n\n\n" +
            "0.0.201")
    })

    test("Single token, two sources, zero dest", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const transaction = {
            "token_transfers": [
                { "account": "0.0.101", "amount": -3, "token_id": SAMPLE_TOKEN.token_id },
                { "account": "0.0.100", "amount": -7, "token_id": SAMPLE_TOKEN.token_id },
            ],
        }

        const wrapper = mount(TokenTransferGraphC, {
            global: {
                plugins: [router]
            },
            props: {
                transaction: transaction as Transaction
            },
        })

        await flushPromises()

        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toBe("0.0.100\n\n10\n\nBURN0.0.101")
    })

    test("Single token, two sources, single dest", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const transaction = {
            "token_transfers": [
                { "account": "0.0.101", "amount": -3, "token_id": SAMPLE_TOKEN.token_id },
                { "account": "0.0.100", "amount": -7, "token_id": SAMPLE_TOKEN.token_id },
                { "account": "0.0.200", "amount": +10, "token_id": SAMPLE_TOKEN.token_id },
            ],
        }

        const wrapper = mount(TokenTransferGraphC, {
            global: {
                plugins: [router]
            },
            props: {
                transaction: transaction as Transaction
            },
        })

        await flushPromises()

        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toBe(
            "0.0.100\n\n" +
            "10\n\n" +
            "0.0.2000.0.101")
    })

    test("Single token, two sources, two dest", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const transaction = {
            "token_transfers": [
                { "account": "0.0.101", "amount": -3, "token_id": SAMPLE_TOKEN.token_id },
                { "account": "0.0.100", "amount": -7, "token_id": SAMPLE_TOKEN.token_id },
                { "account": "0.0.201", "amount": +8, "token_id": SAMPLE_TOKEN.token_id },
                { "account": "0.0.200", "amount": +2, "token_id": SAMPLE_TOKEN.token_id },
            ],
        }

        const wrapper = mount(TokenTransferGraphC, {
            global: {
                plugins: [router]
            },
            props: {
                transaction: transaction as Transaction
            },
        })

        await flushPromises()

        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toBe(
            "0.0.100\n\n" +
            "10\n\n" +
            "0.0.2000.0.101\n\n\n\n" +
            "0.0.201")
    })


    //
    // Two Tokens
    //

    test("Two token", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const transaction = {
            "token_transfers": [
                { "account": "0.0.101", "amount": -3, "token_id": SAMPLE_TOKEN.token_id },
                { "account": "0.0.100", "amount": -7, "token_id": SAMPLE_TOKEN.token_id },
                { "account": "0.0.201", "amount": +8, "token_id": SAMPLE_TOKEN.token_id },
                { "account": "0.0.200", "amount": +2, "token_id": SAMPLE_TOKEN.token_id },

                { "account": "0.0.100", "amount": -6, "token_id": SAMPLE_TOKEN_DUDE.token_id },
                { "account": "0.0.200", "amount": +6, "token_id": SAMPLE_TOKEN_DUDE.token_id },
            ],
        }

        const wrapper = mount(TokenTransferGraphC, {
            global: {
                plugins: [router]
            },
            props: {
                transaction: transaction as Transaction
            },
        })

        await flushPromises()

        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toBe("0.0.100\n\n" +
            "10\n\n" +
            "0.0.2000.0.101\n\n\n\n" +
            "0.0.2010.0.100\n\n" +
            "0.06\n\n" +
            "0.0.200")
    })

})
