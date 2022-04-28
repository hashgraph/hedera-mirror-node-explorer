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
import {SAMPLE_CONTRACT_AS_ACCOUNT} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import Oruga from "@oruga-ui/oruga-next";
import ContractTransactionTable from "@/components/contract/ContractTransactionTable.vue";
import {HMSF} from "@/utils/HMSF";
import PlayPauseState from "@/components/PlayPauseButton.vue";

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

describe("ContractTransactionTable.vue", () => {

    test("all props", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios)

        const testContract = SAMPLE_CONTRACT_AS_ACCOUNT.account
        const matcher1 = "/api/v1/accounts/" + testContract
        mock.onGet(matcher1).reply(200, SAMPLE_CONTRACT_AS_ACCOUNT)

        const wrapper = mount(ContractTransactionTable, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                contractId: testContract,
                nbItems: 42,
                cacheState: PlayPauseState.Pause
            },
        });

        await flushPromises()
        // console.log(wrapper.find('thead').text())
        // console.log(wrapper.find('tbody').text())

        expect(wrapper.find('thead').text()).toBe("ID Type Net Amount Fees Time")
        expect(wrapper.find('tbody').text()).toBe(
            "0.0.178899@1645373457.761328453" +
            "CONTRACT CALL" +
            "1.00000000" +
            "0.75871170" +
            "4:11:07.8897 PMFeb 20, 2022" +
            "0.0.178899@1645373391.947654307" +
            "CONTRACT CALL" +
            "1.00000000" +
            "0.18787079" +
            "4:10:00.5866 PMFeb 20, 2022"
        )
    });

});
