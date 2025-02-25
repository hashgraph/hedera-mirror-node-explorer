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
import {flushPromises, mount} from "@vue/test-utils";
import TokenCell, {TokenCellItem} from "../../../src/components/token/TokenCell.vue";
import router from "../../../src/router";
import Oruga from "@oruga-ui/oruga-next";
import {SAMPLE_ASSOCIATED_TOKEN, SAMPLE_NONFUNGIBLE} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {fetchGetURLs} from "../MockUtils";

describe("TokenCell.vue", () => {

    test("default props", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const wrapper = mount(TokenCell, {
            global: {
                plugins: [router, Oruga]
            },
            props: {},
        })

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(fetchGetURLs(mock)).toStrictEqual([])

        expect(wrapper.text()).toBe('?')

        wrapper.unmount()
    })

    test("tokenId and default property", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        // Mock axios
        const mock = new MockAdapter(axios)

        const tokenId = SAMPLE_NONFUNGIBLE.token_id
        const name = SAMPLE_NONFUNGIBLE.name

        const matcher1 = "/api/v1/tokens/" + tokenId
        mock.onGet(matcher1).reply(200, SAMPLE_NONFUNGIBLE);

        const wrapper = mount(TokenCell, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                tokenId: tokenId
            },
        })

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(fetchGetURLs(mock)).toStrictEqual([
            "api/v1/tokens/" + SAMPLE_NONFUNGIBLE.token_id,
        ])

        expect(wrapper.text()).toBe(name)

        wrapper.unmount()
    })

    test("tokenId and property for NFT", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        // Mock axios
        const mock = new MockAdapter(axios)

        const token = SAMPLE_NONFUNGIBLE
        const tokenId = token.token_id

        const matcher1 = "/api/v1/tokens/" + tokenId
        mock.onGet(matcher1).reply(200, token);

        const wrapper = mount(TokenCell, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                tokenId: tokenId,
                property: TokenCellItem.tokenName
            },
        })

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(fetchGetURLs(mock)).toStrictEqual([
            "api/v1/tokens/" + SAMPLE_NONFUNGIBLE.token_id,
        ])

        expect(wrapper.text()).toBe(token.name)

        await wrapper.setProps({
            property: TokenCellItem.tokenSymbol
        })
        await flushPromises()
        expect(wrapper.text()).toBe("ĦFRENSKINGD…")

        await wrapper.setProps({
            property: TokenCellItem.tokenType
        })
        await flushPromises()
        expect(wrapper.text()).toBe('NFT')

        await wrapper.setProps({
            property: TokenCellItem.tokenNbSerials,
            balanceOrNbSerials: 42,
        })
        await flushPromises()
        expect(wrapper.text()).toBe('42')

        await wrapper.setProps({
            property: TokenCellItem.tokenBalance,
            balanceOrNbSerials: 42,
        })
        await flushPromises()
        expect(wrapper.text()).toBe('')

        wrapper.unmount()
    })

    test("tokenId and property for Fungible", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        // Mock axios
        const mock = new MockAdapter(axios)

        const token = SAMPLE_ASSOCIATED_TOKEN
        const tokenId = token.token_id

        const matcher1 = "/api/v1/tokens/" + tokenId
        mock.onGet(matcher1).reply(200, token);

        const wrapper = mount(TokenCell, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                tokenId: tokenId,
                property: TokenCellItem.tokenName
            },
        })

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(fetchGetURLs(mock)).toStrictEqual([
            "api/v1/tokens/" + SAMPLE_ASSOCIATED_TOKEN.token_id,
        ])

        expect(wrapper.text()).toBe(token.name)

        await wrapper.setProps({
            property: TokenCellItem.tokenSymbol
        })
        await flushPromises()
        expect(wrapper.text()).toBe(token.symbol)

        await wrapper.setProps({
            property: TokenCellItem.tokenType
        })
        await flushPromises()
        expect(wrapper.text()).toBe('Fungible')

        await wrapper.setProps({
            property: TokenCellItem.tokenNbSerials,
            balanceOrNbSerials: 42,
        })
        await flushPromises()
        expect(wrapper.text()).toBe('')

        await wrapper.setProps({
            property: TokenCellItem.tokenBalance,
            balanceOrNbSerials: 42,
        })
        await flushPromises()
        expect(wrapper.text()).toBe('0.0042')

        wrapper.unmount()
    })
})

