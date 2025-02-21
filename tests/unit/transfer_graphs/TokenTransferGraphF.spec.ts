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
import TokenTransferGraph from "@/components/transfer_graphs/TokenTransferGraphF.vue";
import {Transaction} from "@/schemas/MirrorNodeSchemas";
import {SAMPLE_TOKEN, SAMPLE_TOKEN_DUDE} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";


const mock = new MockAdapter(axios);
const matcher1 = "/api/v1/tokens/" + SAMPLE_TOKEN.token_id
mock.onGet(matcher1).reply(200, SAMPLE_TOKEN);
const matcher2 = "/api/v1/tokens/" + SAMPLE_TOKEN_DUDE.token_id
mock.onGet(matcher2).reply(200, SAMPLE_TOKEN_DUDE);


describe("TokenTransferGraphF.vue", () => {

    test("Without transaction", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(TokenTransferGraph, {
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

    //
    // Single Token
    //

    test.skip("Single token, zero source, single dest", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const transaction = {
            "token_transfers": [
                {"account": "0.0.200", "amount": +10, "token_id": SAMPLE_TOKEN.token_id},
            ],
        }

        const wrapper = mount(TokenTransferGraph, {
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
            "Token TransfersAccountToken AmountAccountToken AmountMINT-1023423\n\n" +
            "0.0.2001023423")
        expect(wrapper.text()).toMatch(SAMPLE_TOKEN.symbol)

        wrapper.unmount()
        await flushPromises()
    })

    test.skip("Single token, single source, single dest", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const transaction = {
            "token_transfers": [
                {"account": "0.0.100", "amount": -10, "token_id": SAMPLE_TOKEN.token_id},
                {"account": "0.0.200", "amount": +10, "token_id": SAMPLE_TOKEN.token_id},
            ],
        }

        const wrapper = mount(TokenTransferGraph, {
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
            "Token TransfersAccountToken AmountAccountToken Amount0.0.100-1023423\n\n" +
            "0.0.2001023423Transfer")
        expect(wrapper.text()).toMatch(SAMPLE_TOKEN.symbol)

        await router.push("/") // To avoid "missing required param 'network'" error
        const wrapper2 = mount(TokenTransferGraph, {
            global: {
                plugins: [router],
                provide: {isSmallScreen: false}
            },
            props: {
                transaction: transaction as Transaction
            },
        })

        await flushPromises()

        // console.log(wrapper2.html())
        // console.log(wrapper2.text())

        expect(wrapper2.text()).toBe(
            "Token TransfersAccountToken AmountAccountToken Amount0.0.100-10\n\n" +
            "0.0.20010")
        expect(wrapper2.text()).not.toMatch(SAMPLE_TOKEN.name)

        wrapper.unmount()
        await flushPromises()
    })

    test.skip("Single token, single source, two dest", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const transaction = {
            "token_transfers": [
                {"account": "0.0.100", "amount": -10, "token_id": SAMPLE_TOKEN.token_id},
                {"account": "0.0.200", "amount": +2, "token_id": SAMPLE_TOKEN.token_id},
                {"account": "0.0.201", "amount": +8, "token_id": SAMPLE_TOKEN.token_id},
            ],
        }

        const wrapper = mount(TokenTransferGraph, {
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
            "Token TransfersAccountToken AmountAccountToken Amount0.0.100-1023423\n\n" +
            "0.0.200223423Transfer\n\n" +
            "0.0.201823423Transfer")
        expect(wrapper.text()).toMatch(SAMPLE_TOKEN.symbol)

        wrapper.unmount()
        await flushPromises()
    })

    test.skip("Single token, two sources, zero dest", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const transaction = {
            "token_transfers": [
                {"account": "0.0.101", "amount": -3, "token_id": SAMPLE_TOKEN.token_id},
                {"account": "0.0.100", "amount": -7, "token_id": SAMPLE_TOKEN.token_id},
            ],
        }

        const wrapper = mount(TokenTransferGraph, {
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
            "Token TransfersAccountToken AmountAccountToken Amount0.0.100-723423\n\n" +
            "BURN10234230.0.101-323423")
        expect(wrapper.text()).toMatch(SAMPLE_TOKEN.symbol)

        wrapper.unmount()
        await flushPromises()
    })

    test.skip("Single token, two sources, single dest", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const transaction = {
            "token_transfers": [
                {"account": "0.0.101", "amount": -3, "token_id": SAMPLE_TOKEN.token_id},
                {"account": "0.0.100", "amount": -7, "token_id": SAMPLE_TOKEN.token_id},
                {"account": "0.0.200", "amount": +10, "token_id": SAMPLE_TOKEN.token_id},
            ],
        }

        const wrapper = mount(TokenTransferGraph, {
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
            "Token TransfersAccountToken AmountAccountToken Amount0.0.100-723423\n\n" +
            "0.0.2001023423Transfer0.0.101-323423")
        expect(wrapper.text()).toMatch(SAMPLE_TOKEN.symbol)

        wrapper.unmount()
        await flushPromises()
    })

    test.skip("Single token, two sources, two dest", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const transaction = {
            "token_transfers": [
                {"account": "0.0.101", "amount": -3, "token_id": SAMPLE_TOKEN.token_id},
                {"account": "0.0.100", "amount": -7, "token_id": SAMPLE_TOKEN.token_id},
                {"account": "0.0.201", "amount": +8, "token_id": SAMPLE_TOKEN.token_id},
                {"account": "0.0.200", "amount": +2, "token_id": SAMPLE_TOKEN.token_id},
            ],
        }

        const wrapper = mount(TokenTransferGraph, {
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
            "Token TransfersAccountToken AmountAccountToken Amount0.0.100-723423\n\n" +
            "0.0.200223423Transfer0.0.101-323423\n\n" +
            "0.0.201823423Transfer")
        expect(wrapper.text()).toMatch(SAMPLE_TOKEN.symbol)

        wrapper.unmount()
        await flushPromises()
    })


    //
    // Two Tokens
    //

    test.skip("Two token", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const transaction = {
            "token_transfers": [
                {"account": "0.0.101", "amount": -3, "token_id": SAMPLE_TOKEN.token_id},
                {"account": "0.0.100", "amount": -7, "token_id": SAMPLE_TOKEN.token_id},
                {"account": "0.0.201", "amount": +8, "token_id": SAMPLE_TOKEN.token_id},
                {"account": "0.0.200", "amount": +2, "token_id": SAMPLE_TOKEN.token_id},

                {"account": "0.0.100", "amount": -6, "token_id": SAMPLE_TOKEN_DUDE.token_id},
                {"account": "0.0.200", "amount": +6, "token_id": SAMPLE_TOKEN_DUDE.token_id},
            ],
        }

        const wrapper = mount(TokenTransferGraph, {
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

        expect(wrapper.text()).toBe("Token TransfersAccountToken AmountAccountToken Amount0.0.100-723423\n\n" +
            "0.0.200223423Transfer0.0.101-323423\n\n" +
            "0.0.201823423Transfer0.0.100-0.0623423 DUDE\n\n" +
            "0.0.2000.0623423 DUDETransfer")

        wrapper.unmount()
        await flushPromises()
    })

})
