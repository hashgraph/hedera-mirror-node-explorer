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
import {SAMPLE_CONTRACTS} from "../Mocks";
import Oruga from "@oruga-ui/oruga-next";
import {HMSF} from "@/utils/HMSF";
import ContractTable from "@/components/contract/ContractTable.vue";
import {Contract} from "@/schemas/HederaSchemas";

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

describe("ContractTable.vue", () => {

    test("all props", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(ContractTable, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                nbItems: 42,
                contracts: SAMPLE_CONTRACTS.contracts as Array<Contract>
            },
        });

        await flushPromises()
        // console.log(wrapper.find('thead').text())
        // console.log(wrapper.find('tbody').text())

        expect(wrapper.find('thead').text()).toBe("Contract Created Memo")
        expect(wrapper.find('tbody').text()).toBe(
            "0.0.749775" +
            "3:09:15.9474 PMMar 7, 2022, UTC" +
            "Mirror Node acceptance test: 2022-03-07T15:09:15.228564328Z Create contract"
        )
    });

});
