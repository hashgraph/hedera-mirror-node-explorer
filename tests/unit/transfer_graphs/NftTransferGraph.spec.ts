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
import NftTransferGraph from "@/components/transfer_graphs/NftTransferGraph.vue";
import {TransactionDetail} from "@/schemas/MirrorNodeSchemas";
import {SAMPLE_NONFUNGIBLE, SAMPLE_NONFUNGIBLE_DUDE} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

const mock = new MockAdapter(axios);
const matcher1 = "/api/v1/tokens/" + SAMPLE_NONFUNGIBLE.token_id
mock.onGet(matcher1).reply(200, SAMPLE_NONFUNGIBLE);
const matcher2 = "/api/v1/tokens/" + SAMPLE_NONFUNGIBLE_DUDE.token_id
mock.onGet(matcher2).reply(200, SAMPLE_NONFUNGIBLE_DUDE);

describe.skip("NftTransferGraph.vue", () => {

    test("Without transaction", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(NftTransferGraph, {
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

    test("Two tokens, Transfer", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const transaction = {
            "nft_transfers": [
                {
                    "sender_account_id": "0.0.101",
                    "receiver_account_id": "0.0.100",
                    "token_id": SAMPLE_NONFUNGIBLE.token_id,
                    "serial_number": 604
                },
                {
                    "sender_account_id": "0.0.101",
                    "receiver_account_id": "0.0.100",
                    "token_id": SAMPLE_NONFUNGIBLE.token_id,
                    "serial_number": 603
                },
                {
                    "sender_account_id": "0.0.101",
                    "receiver_account_id": "0.0.100",
                    "token_id": SAMPLE_NONFUNGIBLE_DUDE.token_id,
                    "serial_number": 502
                },
                {
                    "sender_account_id": "0.0.100",
                    "receiver_account_id": "0.0.101",
                    "token_id": SAMPLE_NONFUNGIBLE_DUDE.token_id,
                    "serial_number": 501
                },
                {
                    "sender_account_id": "0.0.100",
                    "receiver_account_id": "0.0.101",
                    "token_id": SAMPLE_NONFUNGIBLE.token_id,
                    "serial_number": 602
                },
                {
                    "sender_account_id": "0.0.100",
                    "receiver_account_id": "0.0.101",
                    "token_id": SAMPLE_NONFUNGIBLE.token_id,
                    "serial_number": 601
                },
            ]
        }

        const wrapper = mount(NftTransferGraph, {
            global: {
                plugins: [router]
            },
            props: {
                transaction: transaction as TransactionDetail
            },
        })

        await flushPromises()

        // console.log(wrapper.html())
        // console.log(wrapper.text())

        /*
            0.0.100     ->      0.0.748383 Ħ Frens Kingdom      ->      0.0.101     Transfer
                                #601 #602

            0.0.100     ->      0.0.748384 Ħ Frens Kingdom Dude ->      0.0.101
                                #501

            0.0.101     ->      0.0.748383 Ħ Frens Kingdom      ->      0.0.100
                                #603 #604

            0.0.101     ->      0.0.748384 Ħ Frens Kingdom Dude ->      0.0.100
                                #502

         */

        expect(wrapper.text()).toBe(
            "NFT TransfersAccountNon Fungible TokensAccount0.0.100\n\n" +
            "0.0.748383" + SAMPLE_NONFUNGIBLE_DUDE.symbol + " #601 #602\n\n" +
            "0.0.101Transfer0.0.100\n\n" +
            "0.0.748384" + SAMPLE_NONFUNGIBLE_DUDE.symbol + " #501\n\n" +
            "0.0.101Transfer0.0.101\n\n" +
            "0.0.748383" + SAMPLE_NONFUNGIBLE_DUDE.symbol + " #603 #604\n\n" +
            "0.0.100Transfer0.0.101\n\n" +
            "0.0.748384" + SAMPLE_NONFUNGIBLE_DUDE.symbol + " #502\n\n" +
            "0.0.100Transfer")
        expect(wrapper.text()).toMatch(SAMPLE_NONFUNGIBLE.symbol)
        expect(wrapper.text()).toMatch(SAMPLE_NONFUNGIBLE_DUDE.symbol)

        wrapper.unmount()

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper2 = mount(NftTransferGraph, {
            global: {
                plugins: [router],
                provide: {
                    isSmallScreen: false
                }
            },
            props: {
                transaction: transaction as TransactionDetail
            },
        })

        await flushPromises()

        expect(wrapper2.text()).toBe(
            "NFT TransfersAccountNon Fungible TokensAccount0.0.100\n\n" +
            "0.0.748383" + SAMPLE_NONFUNGIBLE_DUDE.symbol + " #601 #602\n\n" +
            "0.0.1010.0.100\n\n" +
            "0.0.748384" + SAMPLE_NONFUNGIBLE_DUDE.symbol + " #501\n\n" +
            "0.0.1010.0.101\n\n" +
            "0.0.748383" + SAMPLE_NONFUNGIBLE_DUDE.symbol + " #603 #604\n\n" +
            "0.0.1000.0.101\n\n" +
            "0.0.748384" + SAMPLE_NONFUNGIBLE_DUDE.symbol + " #502\n\n" +
            "0.0.100")
        expect(wrapper2.text()).toMatch(SAMPLE_NONFUNGIBLE.symbol)
        expect(wrapper2.text()).toMatch(SAMPLE_NONFUNGIBLE_DUDE.symbol)

        wrapper2.unmount()


    })

    test("Mint, one token, one destination", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const transaction = {
            "nft_transfers": [
                {
                    "sender_account_id": null,
                    "receiver_account_id": "0.0.100",
                    "token_id": SAMPLE_NONFUNGIBLE.token_id,
                    "serial_number": 604
                },
            ]
        }

        const wrapper = mount(NftTransferGraph, {
            global: {
                plugins: [router]
            },
            props: {
                transaction: transaction as TransactionDetail
            },
        })

        await flushPromises()

        // console.log(wrapper.html())
        // console.log(wrapper.text())

        /*
            MINT     ->      0.0.748383 Ħ Frens Kingdom      ->      0.0.100
                             #604

         */

        expect(wrapper.text()).toBe(
            "NFT TransfersAccountNon Fungible TokensAccountMINT\n\n" +
            "0.0.748383" + SAMPLE_NONFUNGIBLE_DUDE.symbol + " #604\n\n" +
            "0.0.100")
        expect(wrapper.text()).toMatch(SAMPLE_NONFUNGIBLE.symbol)

        wrapper.unmount()
        await flushPromises()
    })

    test("Mint, one token, two destinations", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const transaction = {
            "nft_transfers": [
                {
                    "sender_account_id": null,
                    "receiver_account_id": "0.0.100",
                    "token_id": SAMPLE_NONFUNGIBLE.token_id,
                    "serial_number": 604
                },
                {
                    "sender_account_id": null,
                    "receiver_account_id": "0.0.101",
                    "token_id": SAMPLE_NONFUNGIBLE.token_id,
                    "serial_number": 601
                },
            ]
        }

        const wrapper = mount(NftTransferGraph, {
            global: {
                plugins: [router]
            },
            props: {
                transaction: transaction as TransactionDetail
            },
        })

        await flushPromises()

        // console.log(wrapper.html())
        // console.log(wrapper.text())

        /*
            MINT     ->      0.0.748383 Ħ Frens Kingdom      ->      0.0.100
                             #604
            MINT     ->      0.0.748383 Ħ Frens Kingdom      ->      0.0.101
                             #601

         */

        expect(wrapper.text()).toBe(
            "NFT TransfersAccountNon Fungible TokensAccountMINT\n\n" +
            "0.0.748383" + SAMPLE_NONFUNGIBLE_DUDE.symbol + " #604\n\n" +
            "0.0.100MINT\n\n" +
            "0.0.748383" + SAMPLE_NONFUNGIBLE_DUDE.symbol + " #601\n\n" +
            "0.0.101")
        expect(wrapper.text()).toMatch(SAMPLE_NONFUNGIBLE.symbol)

        wrapper.unmount()
        await flushPromises()
    })

    test.skip("Burn, one token, one source", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const transaction = {
            "nft_transfers": [
                {
                    "sender_account_id": "0.0.100",
                    "receiver_account_id": null,
                    "token_id": SAMPLE_NONFUNGIBLE.token_id,
                    "serial_number": 604
                },
            ]
        }

        const wrapper = mount(NftTransferGraph, {
            global: {
                plugins: [router]
            },
            props: {
                transaction: transaction as TransactionDetail
            },
        })

        await flushPromises()

        // console.log(wrapper.html())
        // console.log(wrapper.text())

        /*
            MINT     ->      0.0.748383 Ħ Frens Kingdom      ->      0.0.100
                             #604

         */

        expect(wrapper.text()).toBe(
            "NFT TransfersAccountNon Fungible TokensAccount0.0.100\n\n" +
            "0.0.748383" + SAMPLE_NONFUNGIBLE_DUDE.symbol + " #604\n\n" +
            "BURN")
        expect(wrapper.text()).toMatch(SAMPLE_NONFUNGIBLE.symbol)

        wrapper.unmount()
        await flushPromises()
    })

    test.skip("Burn, one token, two sources", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const transaction = {
            "nft_transfers": [
                {
                    "sender_account_id": "0.0.100",
                    "receiver_account_id": null,
                    "token_id": SAMPLE_NONFUNGIBLE.token_id,
                    "serial_number": 604
                },
                {
                    "sender_account_id": "0.0.101",
                    "receiver_account_id": null,
                    "token_id": SAMPLE_NONFUNGIBLE.token_id,
                    "serial_number": 601
                },
            ]
        }

        const wrapper = mount(NftTransferGraph, {
            global: {
                plugins: [router]
            },
            props: {
                transaction: transaction as TransactionDetail
            },
        })

        await flushPromises()

        // console.log(wrapper.html())
        // console.log(wrapper.text())

        /*
            0.0.100  ->      0.0.748383 Ħ Frens Kingdom      ->      BURN
                             #604
            0.0.101  ->      0.0.748383 Ħ Frens Kingdom      ->      BURN
                             #601

         */

        expect(wrapper.text()).toBe(
            "NFT TransfersAccountNon Fungible TokensAccount0.0.100\n\n" +
            "0.0.748383" + SAMPLE_NONFUNGIBLE_DUDE.symbol + " #604\n\n" +
            "BURN0.0.101\n\n" +
            "0.0.748383" + SAMPLE_NONFUNGIBLE_DUDE.symbol + " #601\n\n" +
            "BURN")
        expect(wrapper.text()).toMatch(SAMPLE_NONFUNGIBLE.symbol)

        wrapper.unmount()
        await flushPromises()
    })
})

