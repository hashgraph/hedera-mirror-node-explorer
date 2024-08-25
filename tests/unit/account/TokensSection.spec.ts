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

import {afterAll, beforeAll, describe, expect, test} from 'vitest'
import {flushPromises, mount} from "@vue/test-utils"
import axios from "axios";
import {
    SAMPLE_ACCOUNT,
    SAMPLE_ASSOCIATED_TOKEN,
    SAMPLE_ASSOCIATED_TOKEN_2,
    SAMPLE_NFTS,
    SAMPLE_NONFUNGIBLE,
    SAMPLE_TOKEN_ASSOCIATIONS
} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import Oruga from "@oruga-ui/oruga-next";
import TokensSection from "../../../src/components/token/TokensSection.vue";
import Tabs from "../../../src/components/Tabs.vue";
import {HMSF} from "../../../src/utils/HMSF";
import router from "../../../src/router";

/*
    Bookmarks
        https://jestjs.io/docs/api
        https://test-utils.vuejs.org/api/

 */

HMSF.forceUTC = true

describe("TokensSection.vue", () => {

    const accountId = SAMPLE_ACCOUNT.account
    const mock = new MockAdapter(axios);

    beforeAll(async () => {
        const matcher1 = `/api/v1/accounts/${accountId}/nfts`
        mock.onGet(matcher1).reply(200, SAMPLE_NFTS)

        const matcher2 = "/api/v1/tokens/" + SAMPLE_NFTS.nfts[0].token_id
        mock.onGet(matcher2).reply(200, SAMPLE_NONFUNGIBLE)

        const matcher3 = `/api/v1/accounts/${accountId}/tokens`
        mock.onGet(matcher3).reply(200, SAMPLE_TOKEN_ASSOCIATIONS)

        const matcher4 = "/api/v1/tokens/" + SAMPLE_ASSOCIATED_TOKEN.token_id
        mock.onGet(matcher4).reply(200, SAMPLE_ASSOCIATED_TOKEN)

        const matcher5 = "/api/v1/tokens/" + SAMPLE_ASSOCIATED_TOKEN_2.token_id
        mock.onGet(matcher5).reply(200, SAMPLE_ASSOCIATED_TOKEN_2)
    })

    afterAll(() => {
        mock.restore()
    })

    test("Tabs are present", async () => {

        const wrapper = mount(TokensSection, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                accountId: accountId
            },
        });

        await flushPromises()
        // console.log(wrapper.html())

        const tokensSection = wrapper.find("#tokensSection")
        expect(tokensSection.exists()).toBe(true)

        const tab = tokensSection.findComponent(Tabs)
        expect(tab.exists()).toBe(true)

        const tabs = tab.findAll('li')
        expect(tabs.length).toBe(2)
        expect(tabs[0].text()).toBe('NFTs')
        expect(tabs[1].text()).toBe('Associations')

        wrapper.unmount()
        await flushPromises()
    });

    test("Content of NFTs tab", async () => {

        const wrapper = mount(TokensSection, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                accountId: accountId
            },
        });

        await flushPromises()
        // console.log(wrapper.html())

        const tokensSection = wrapper.find("#tokensSection")
        const tab = tokensSection.get('#tab-nfts')
        await tab.trigger('click')

        const nftsTable = tokensSection.get("#nftsTable")
        expect(nftsTable.find('thead').text()).toBe("Image Token ID # Collection Name Creator Description")
        expect(nftsTable.find('tbody').text()).toBe(
            "NFT" + "0.0.748383" + "2" + "Ħ Frens Kingdom (ĦFRENSKINGD…) " +
            "NFT" + "0.0.748383" + "1" + "Ħ Frens Kingdom (ĦFRENSKINGD…) " +
            "NFT" + "0.0.748383" + "342" + "Ħ Frens Kingdom (ĦFRENSKINGD…)"
        )

        wrapper.unmount()
        await flushPromises()
    });

    test("Content of Associations tab", async () => {

        const wrapper = mount(TokensSection, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                accountId: accountId
            },
        });

        await flushPromises()
        // console.log(wrapper.html())

        const tokensSection = wrapper.find("#tokensSection")
        const tab = tokensSection.get('#tab-associations')
        await tab.trigger('click')
        await flushPromises()

        const associationsTable = tokensSection.get("#associationsTable")
        expect(associationsTable.find('thead').text()).toBe("Token Name Symbol Type Balance Nb. of NFTs")
        expect(associationsTable.find('tbody').text()).toBe(
            "0.0.34332104" + "HSUITE" + "HSuite" + "Fungible" + "0.0000" +
            "0.0.49292859" + "Token SymbolA7" + "TokenA7" + "Fungible" + "0.00000000"
        )

        wrapper.unmount()
        await flushPromises()
    });
});
