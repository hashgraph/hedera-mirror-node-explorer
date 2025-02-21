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
import {flushPromises, mount} from "@vue/test-utils"
import router from "@/router";
import axios from "axios";
import {SAMPLE_TOKENS} from "../Mocks";
import Tokens from "@/pages/Tokens.vue";
import DashboardCardV2 from "@/components/DashboardCardV2.vue";
import TokenTable from "@/components/token/TokenTable.vue";
import MockAdapter from "axios-mock-adapter";
import Oruga from "@oruga-ui/oruga-next";
import {HMSF} from "@/utils/HMSF";

/*
    Bookmarks
        https://jestjs.io/docs/api
        https://test-utils.vuejs.org/api/

 */

HMSF.forceUTC = true

describe("Tokens.vue", () => {

    test.skip("no props", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const matcher = "/api/v1/tokens"
        mock.onGet(matcher).reply(200, SAMPLE_TOKENS);

        const wrapper = mount(Tokens, {
            global: {
                plugins: [router, Oruga]
            },
            props: {},
        });

        await flushPromises()
        // console.log(wrapper.text())

        expect(wrapper.vm.nftTableController.mounted.value).toBe(true)
        expect(wrapper.vm.tokenTableController.mounted.value).toBe(true)

        const cards = wrapper.findAllComponents(DashboardCardV2)
        expect(cards.length).toBe(2)

        expect(cards[0].text()).toMatch(RegExp("^Recent Non Fungible Tokens"))
        const table1 = cards[0].findComponent(TokenTable)
        expect(table1.exists()).toBe(true)
        expect(table1.get('thead').text()).toBe("Token Name Symbol")
        expect(table1.get('tbody').text()).toBe(
            SAMPLE_TOKENS.tokens[0].token_id +
            SAMPLE_TOKENS.tokens[0].name +
            SAMPLE_TOKENS.tokens[0].symbol +
            SAMPLE_TOKENS.tokens[1].token_id +
            SAMPLE_TOKENS.tokens[1].name +
            SAMPLE_TOKENS.tokens[1].symbol
        )

        expect(cards[1].text()).toMatch(RegExp("^Recent Fungible Tokens"))
        const table2 = cards[1].findComponent(TokenTable)
        expect(table2.exists()).toBe(true)
        expect(table2.get('thead').text()).toBe("Token Name Symbol")
        expect(table2.get('tbody').text()).toBe(
            SAMPLE_TOKENS.tokens[0].token_id +
            SAMPLE_TOKENS.tokens[0].name +
            SAMPLE_TOKENS.tokens[0].symbol +
            SAMPLE_TOKENS.tokens[1].token_id +
            SAMPLE_TOKENS.tokens[1].name +
            SAMPLE_TOKENS.tokens[1].symbol
        )

        mock.restore()
        wrapper.unmount()
        await flushPromises()

        expect(wrapper.vm.nftTableController.mounted.value).toBe(false)
        expect(wrapper.vm.tokenTableController.mounted.value).toBe(false)
    });

});
