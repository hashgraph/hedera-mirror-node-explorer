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
import TokenLink from "@/components/values/TokenLink.vue";
import router from "@/router";
import {SAMPLE_TOKEN, SAMPLE_TOKEN_DUDE} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

const mock = new MockAdapter(axios);
const matcher = "/api/v1/tokens/" + SAMPLE_TOKEN.token_id
mock.onGet(matcher).reply(200, SAMPLE_TOKEN);
const matcher2 = "/api/v1/tokens/" + SAMPLE_TOKEN_DUDE.token_id
mock.onGet(matcher2).reply(200, SAMPLE_TOKEN_DUDE);

describe("TokenLink.vue", () => {

    it("props.topicId set", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(TokenLink, {
            global: {
                plugins: [router]
            },
            props: {
                tokenId: SAMPLE_TOKEN.token_id
            },
        });

        await flushPromises()

        const testTokenId = SAMPLE_TOKEN.token_id
        expect(wrapper.text()).toBe(testTokenId)
        expect(wrapper.get("a").attributes("href")).toMatch(RegExp("/token/" + testTokenId + "$"))
        expect(wrapper.find(".h-is-extra-text").exists()).toBe(false)
    });

    it("props.topicId set and showExtra", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(TokenLink, {
            global: {
                plugins: [router]
            },
            props: {
                tokenId: SAMPLE_TOKEN.token_id,
                showExtra: true
            },
        });

        await flushPromises()

        expect(wrapper.text()).toBe(SAMPLE_TOKEN.token_id + SAMPLE_TOKEN.name)
        expect(wrapper.get("a").attributes("href")).toMatch(RegExp("/token/" + SAMPLE_TOKEN.token_id + "$"))
        expect(wrapper.get(".h-is-extra-text").text()).toBe(SAMPLE_TOKEN.name)

        await wrapper.setProps({
            tokenId: SAMPLE_TOKEN_DUDE.token_id
        })
        await flushPromises()

        expect(wrapper.text()).toBe(SAMPLE_TOKEN_DUDE.token_id + SAMPLE_TOKEN_DUDE.name)
        expect(wrapper.get("a").attributes("href")).toMatch(RegExp("/token/" + SAMPLE_TOKEN_DUDE.token_id + "$"))
        expect(wrapper.get(".h-is-extra-text").text()).toBe(SAMPLE_TOKEN_DUDE.name)
    });

    it("props.topicId unset", async () => {

        await router.push("/mainnet/dashboard") // To avoid "missing required param 'network'" error

        const wrapper = mount(TokenLink, {
            global: {
                plugins: [router]
            },
            props: {
            },
        });

        expect(wrapper.text()).toBe("?")
        expect(wrapper.find("a").exists()).toBe(false)
    });
});
