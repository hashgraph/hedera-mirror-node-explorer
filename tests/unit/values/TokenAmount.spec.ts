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


/*
    Bookmarks
        https://test-utils.vuejs.org/api/

 */

import {flushPromises, mount} from "@vue/test-utils";
import router from "@/router";
import {SAMPLE_TOKEN, SAMPLE_TOKEN_DUDE} from "../Mocks";
import TokenAmount from "@/components/values/TokenAmount.vue";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

const mock = new MockAdapter(axios);
const matcher = "/api/v1/tokens/" + SAMPLE_TOKEN.token_id
mock.onGet(matcher).reply(200, SAMPLE_TOKEN);
const matcher2 = "/api/v1/tokens/" + SAMPLE_TOKEN_DUDE.token_id
mock.onGet(matcher2).reply(200, SAMPLE_TOKEN_DUDE);

describe("TokenAmount.vue", () => {

    it("no amount; tokenId", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const expectedAmount = 0

        const wrapper = mount(TokenAmount, {
            global: {
                plugins: [router]
            },
            props: {
                tokenId: SAMPLE_TOKEN.token_id,
            },
        });
        await flushPromises()

        expect(wrapper.text()).toBe(expectedAmount.toString())

        await wrapper.setProps({
                tokenId: SAMPLE_TOKEN.token_id,
                showExtra: true
            })
        await flushPromises()

        expect(wrapper.get('span').text()).toBe(expectedAmount.toString())
        expect(wrapper.get('a').attributes('href')).toMatch(RegExp("/token/" + SAMPLE_TOKEN.token_id + "$"))
        expect(wrapper.get('.h-is-extra-text').text()).toBe(SAMPLE_TOKEN.name)
    });

    it("amount; no tokenId", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const testAmount = 42

        const wrapper = mount(TokenAmount, {
            global: {
                plugins: [router]
            },
            props: {
                amount: testAmount,
            },
        });
        await flushPromises()

        expect(wrapper.get('span').text()).toBe("")
        expect(() => wrapper.get('a')).toThrowError()
    });

    it("amount; tokenId", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const testAmount = 42

        const wrapper = mount(TokenAmount, {
            global: {
                plugins: [router]
            },
            props: {
                amount: testAmount,
                tokenId: SAMPLE_TOKEN.token_id,
            },
        });
        await flushPromises()

        expect(wrapper.text()).toBe(testAmount.toString())

        await wrapper.setProps({
            tokenId: SAMPLE_TOKEN.token_id,
            showExtra: true
        })
        await flushPromises()

        expect(wrapper.get('span').text()).toBe(testAmount.toString())
        expect(wrapper.get('a').attributes('href')).toMatch(RegExp("/token/" + SAMPLE_TOKEN.token_id + "$"))
        expect(wrapper.get('.h-is-extra-text').text()).toBe(SAMPLE_TOKEN.name)

        await wrapper.setProps({
            tokenId: SAMPLE_TOKEN_DUDE.token_id,
            showExtra: true
        })
        await flushPromises()

        expect(wrapper.get('span').text()).toBe((testAmount / 100).toString())
        expect(wrapper.get('a').attributes('href')).toMatch(RegExp("/token/" + SAMPLE_TOKEN_DUDE.token_id + "$"))
        expect(wrapper.get('.h-is-extra-text').text()).toBe(SAMPLE_TOKEN_DUDE.name)
    });

});
