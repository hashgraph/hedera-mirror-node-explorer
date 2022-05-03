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
import {SAMPLE_TOKEN, SAMPLE_TRANSACTIONS} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import Oruga from "@oruga-ui/oruga-next";
import TransactionTable from "@/components/transaction/TransactionTable.vue";
import {HMSF} from "@/utils/HMSF";
import PlayPauseState from "@/components/PlayPauseButton.vue";
import {TransactionType} from "@/schemas/HederaSchemas";

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

describe("TransactionTable.vue", () => {

    test("all props", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios)

        const matcher1 = "/api/v1/transactions"
        mock.onGet(matcher1).reply(200, SAMPLE_TRANSACTIONS)

        const matcher2 = "/api/v1/tokens/" + SAMPLE_TOKEN.token_id
        mock.onGet(matcher2).reply(200, SAMPLE_TOKEN)

        const wrapper = mount(TransactionTable, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                narrowed: true,
                nbItems: 42,
                accountIdFilter: "0.0.42",
                transactionTypeFilter: TransactionType.CRYPTOTRANSFER,
                cacheState: PlayPauseState.Pause
            },
        });

        await flushPromises()

        expect(wrapper.find('thead').text()).toBe("ID Type Content Time")
        expect(wrapper.find('tbody').text()).toBe(
            "0.0.29624024@1646025139.152901498CRYPTO TRANSFER0.0.29624024\n\n" +
            "1\n\n" +
            "0.0.296939115:12:31.6676 AMFeb 28, 2022"
        )
    });

});
