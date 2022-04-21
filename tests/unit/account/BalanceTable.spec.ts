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
import {SAMPLE_ACCOUNT_BALANCES, SAMPLE_NONFUNGIBLE, SAMPLE_TOKEN} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import Oruga from "@oruga-ui/oruga-next";
import BalanceTable from "@/components/account/BalanceTable.vue";
import {HMSF} from "@/utils/HMSF";

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

describe("BalanceTable.vue", () => {

    test("all props", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const testAccount = SAMPLE_ACCOUNT_BALANCES.balances[0].account
        const matcher1 = "/api/v1/balances"
        mock.onGet(matcher1).reply(200, SAMPLE_ACCOUNT_BALANCES);

        const matcher2 = "/api/v1/tokens/"
        mock.onGet(matcher2 + SAMPLE_TOKEN.token_id).reply(200, SAMPLE_TOKEN)
        mock.onGet(matcher2 + SAMPLE_NONFUNGIBLE.token_id).reply(200, SAMPLE_NONFUNGIBLE)

        const wrapper = mount(BalanceTable, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                accountId: testAccount,
                nbItems: 42
            },
        });

        await flushPromises()
        // console.log(wrapper.find('thead').text())
        // console.log(wrapper.find('tbody').text())

        expect(wrapper.find('thead').text()).toBe("Token Balance")
        expect(wrapper.find('tbody').text()).toBe(
            "0.0.2966295623423" +
            "998" +
            "0.0.748383" +
            "Ħ Frens Kingdom" +
            "1"
        )

        wrapper.unmount()
        await flushPromises()
    });

});
