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
import {SAMPLE_PARENT_CHILD_TRANSACTIONS} from "../Mocks";
import Oruga from "@oruga-ui/oruga-next";
import {HMSF} from "@/utils/HMSF";
import {Transaction} from "@/schemas/HederaSchemas";
import TransactionByIdTable from "@/components/transaction/TransactionByIdTable.vue";

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

describe("TransactionByIdTable.vue", () => {

    test("all props", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(TransactionByIdTable, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                narrowed: true,
                nbItems: 42,
                transactions: SAMPLE_PARENT_CHILD_TRANSACTIONS.transactions as Array<Transaction>,
            },
        });

        await flushPromises()
        // console.log(wrapper.text())

        expect(wrapper.find('thead').text()).toBe("Time Type Content Relationship Nonce")
        expect(wrapper.find('tbody').text()).toBe(
            "1:29:17.0144 PMSep 6, 2022, UTCCONTRACT CALLContract ID: 0.0.48193749Parent0" +
            "1:29:17.0144 PMSep 6, 2022, UTCTOKEN MINTMINT\n\n0.0.48193741\n\n0.0.48113503Child1" +
            "1:29:17.0144 PMSep 6, 2022, UTCCRYPTO TRANSFER0.0.48113503\n\n0.0.48193741\n\n0.0.48193739Child2"
        )
    });

});
