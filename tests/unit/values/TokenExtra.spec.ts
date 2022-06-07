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
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import TokenExtra from "@/components/values/TokenExtra.vue";

const mock = new MockAdapter(axios);
const matcher = "/api/v1/tokens/" + SAMPLE_TOKEN.token_id
mock.onGet(matcher).reply(200, SAMPLE_TOKEN);
const matcher2 = "/api/v1/tokens/" + SAMPLE_TOKEN_DUDE.token_id
mock.onGet(matcher2).reply(200, SAMPLE_TOKEN_DUDE);

describe("TokenExtra.vue", () => {

    it("no props then with token id", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(TokenExtra, {
            global: {
                plugins: [router]
            },
            props: {
            },
        });
        await flushPromises()
        expect(wrapper.text()).toBe("")


        await wrapper.setProps({
            tokenId: SAMPLE_TOKEN.token_id
        })
        await flushPromises()
        expect(wrapper.find('a').exists()).toBeFalsy()
        expect(wrapper.get('.h-is-extra-text').text()).toBe(SAMPLE_TOKEN.name)

        await wrapper.setProps({
            useAnchor: true
        })
        await flushPromises()
        expect(wrapper.get('a').attributes('href')).toMatch(RegExp("/token/" + SAMPLE_TOKEN.token_id + "$"))
        expect(wrapper.get('.h-is-extra-text').text()).toBe(SAMPLE_TOKEN.name)
    });

});
