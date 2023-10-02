// noinspection DuplicatedCode

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

import {describe, expect, it} from 'vitest'
import {flushPromises, mount} from "@vue/test-utils"
import router, {routeManager} from "@/router";
import axios from "axios";
import {SAMPLE_CONTRACT} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import {HMSF} from "@/utils/HMSF";
import Oruga from "@oruga-ui/oruga-next";
import ContractResultLogEntry from "@/components/contract/ContractResultLogEntry.vue";
import {SAMPLE_LOG_RESULT, SAMPLE_SOURCIFY_RESPONSE} from "../utils/analyzer/ContractLogAnalyzer.spec";

/*
    Bookmarks
        https://test-utils.vuejs.org/api/

 */

HMSF.forceUTC = true

describe("ContractResultLogEntry.vue", () => {

    it("Should display the contract result and logs, given consensus timestamp", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const matcher1 = "api/v1/contracts/" + SAMPLE_CONTRACT.contract_id
        const mock = new MockAdapter(axios);
        mock.onGet(matcher1).reply(200, SAMPLE_CONTRACT)

        const networkEntry = routeManager.currentNetworkEntry.value
        const requestURL = networkEntry.sourcifySetup?.makeRequestURL(SAMPLE_CONTRACT.evm_address)
        // const contractURL = networkEntry.sourcifySetup?.makeContractLookupURL(SAMPLE_CONTRACT.evm_address)
        mock.onGet(requestURL).reply(200, SAMPLE_SOURCIFY_RESPONSE)

        const wrapper = mount(ContractResultLogEntry, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                log: SAMPLE_LOG_RESULT
            },
        });
        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.get("#logAddress").text()).toBe("Address0x00000000000000000000000000000000000b70cfCopy(0.0.749775)")
        expect(wrapper.get("#logIndex").text()).toBe("Index0")
        expect(wrapper.get("#logTopics").text()).toBe("Topics(0) 01f7 89d6 70af a303 0578 cc57 0ac4 d43a ce6f 1575 dd6c 395a 711e 72a3 0051 efd2Copy")
        expect(wrapper.get("#logSignature").text()).toBe("SignatureFlightEvent(string,int256,int256)")
        expect(wrapper.get("#logArg_phase").text()).toBe("phaseHolding pointstring")
        expect(wrapper.get("#logArg_airspeed").text()).toBe("airspeed0int256")
        expect(wrapper.get("#logArg_verticalSpeed").text()).toBe("verticalSpeed0int256")

        wrapper.unmount()
        await flushPromises()
    });

});

