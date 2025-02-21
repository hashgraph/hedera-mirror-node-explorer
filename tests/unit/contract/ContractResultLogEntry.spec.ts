// noinspection DuplicatedCode

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

    it.skip("Should display the contract result and logs, given consensus timestamp", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const matcher1 = "api/v1/contracts/" + SAMPLE_CONTRACT.contract_id
        const mock = new MockAdapter(axios);
        mock.onGet(matcher1).reply(200, SAMPLE_CONTRACT)

        const networkEntry = routeManager.currentNetworkEntry.value
        const requestURL = networkEntry.sourcifySetup?.makeRequestURL(SAMPLE_CONTRACT.evm_address)
        mock.onGet(requestURL).reply(200, SAMPLE_SOURCIFY_RESPONSE)

        const wrapper = mount(ContractResultLogEntry, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                log: SAMPLE_LOG_RESULT,
                transactionHash: "0xc7b2ecffdefdec56b809f93bef6c8528dad22e58a02a33c20d275f2ef27936d56b1ed64b53f920fbac85d9cada4a4e78",
                blockNumber: 9
            },
        });
        await flushPromises()

        expect(wrapper.get("#transactionHash").text()).toBe("Transaction Hashc7b2 ecff defd ec56 b809 f93b ef6c 8528 dad2 2e58 a02a 33c2 0d27 5f2e f279 36d5 6b1e d64b 53f9 20fb ac85 d9ca da4a 4e78Copy")
        expect(wrapper.get("#blockNumber").find("a").exists()).toBeTruthy
        expect(wrapper.get("#blockNumber").get("a").text()).toBe('9')
        expect(wrapper.get("#blockNumber").text()).toBe("Block9")
        expect(wrapper.get("#address").text()).toBe("Address0x00000000000000000000000000000000000b70cfCopy(TestEvent)")
        expect(wrapper.get("#Args").text()).toBe("LogsFlightEvent (string phase, int256 airspeed, int256 verticalSpeed)Topic 0  signature hash0x01f789d670afa3030578cc570ac4d43ace6f1575dd6c395a711e72a30051efd2string  phaseHolding pointint256  airspeed0int256  verticalSpeed0")
        expect(wrapper.get("#logArg_phase").text()).toBe("string  phaseHolding point")
        expect(wrapper.get("#logArg_airspeed").text()).toBe("int256  airspeed0")
        expect(wrapper.get("#logArg_verticalSpeed").text()).toBe("int256  verticalSpeed0")

        wrapper.unmount()
        await flushPromises()
    });

});

