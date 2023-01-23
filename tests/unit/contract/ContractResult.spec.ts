/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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
import {SAMPLE_CONTRACT_RESULT_DETAILS} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import {HMSF} from "@/utils/HMSF";
import ContractResult from "@/components/contract/ContractResult.vue";
import Oruga from "@oruga-ui/oruga-next";

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

describe("ContractResult.vue", () => {

    it("Should display the contract result and logs, given transaction ID", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const transactionId = "0.0.846260-1662655524-114667756"
        const contractId = SAMPLE_CONTRACT_RESULT_DETAILS.contract_id
        const timestamp = SAMPLE_CONTRACT_RESULT_DETAILS.timestamp

        const mock = new MockAdapter(axios);
        const matcher1 = "/api/v1/contracts/results/" + transactionId
        mock.onGet(matcher1).reply(200, SAMPLE_CONTRACT_RESULT_DETAILS)

        const wrapper = mount(ContractResult, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                transactionIdOrHash: transactionId,
                topLevel: true
            },
        });
        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("^Contract Result for " + contractId + " at " + timestamp))
        expect(wrapper.get("#resultValue").text()).toBe("SUCCESS")
        expect(wrapper.get("#fromValue").text()).toBe("0x00000000000000000000000000000000000ce9b4(0.0.846260)")
        expect(wrapper.get("#toValue").text()).toBe("0x0000000000000000000000000000000000103783(0.0.1062787)")
        expect(wrapper.get("#typeValue").text()).toBe("None")
        // expect(wrapper.get("#functionParametersValue").text()).toBe("18cb afe5 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0017 4876 e800 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 001b 2702 b2a0 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 00a0 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 000c e9b4 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0183 1e10 602d 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0003 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 000c ba44 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 000d 1ea6 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0010 3708Copy to Clipboard")
        expect(wrapper.get("#errorMessageValue").text()).toBe("None")
        expect(wrapper.get("#gasLimitValue").text()).toBe("480,000")
        expect(wrapper.get("#gasUsedValue").text()).toBe("384,000")
        expect(wrapper.get("#maxFeePerGasValue").text()).toBe("None")
        expect(wrapper.get("#maxPriorityFeePerGasValue").text()).toBe("None")
        expect(wrapper.get("#gasPriceValue").text()).toBe("None")

        expect(wrapper.findAll("#logIndexValue").length).toBe(3)
    });
});
