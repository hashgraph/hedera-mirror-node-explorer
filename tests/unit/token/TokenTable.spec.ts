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

import {flushPromises, mount} from "@vue/test-utils"
import router from "@/router";
import axios from "axios";
import {SAMPLE_TOKENS} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import Oruga from "@oruga-ui/oruga-next";
import TokenTable from "@/components/token/TokenTable.vue";
import {HMSF} from "@/utils/HMSF";
import {Token} from "@/schemas/HederaSchemas";

/*
    Bookmarks
        https://jestjs.io/docs/api
        https://test-utils.vuejs.org/api/

 */

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

HMSF.forceUTC = true

describe("TokenTable.vue", () => {

    test("all types", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const matcher = "/api/v1/tokens"
        mock.onGet(matcher).reply(200, SAMPLE_TOKENS);

        const wrapper = mount(TokenTable, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                nbItems: 42,
                tokens: SAMPLE_TOKENS.tokens as Array<Token>
            },
        });

        await flushPromises()
        // console.log(wrapper.find('thead').text())
        // console.log(wrapper.find('tbody').text())

        expect(wrapper.find('thead').text()).toBe("Token Symbol")
        expect(wrapper.find('tbody').text()).toBe(
            "0.0.29662956" +
            "QmVGABnvpbPwLcfG4iuW2JSzY8MLkALhd54bdPAbJxoEkB" +
            "0.0.748383" +
            "ĦFRENSKINGDOM"
        )
    });

});
