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


import {describe, test, expect} from 'vitest'
import {SAMPLE_CONTRACT_RESULT_DETAILS, SAMPLE_ERROR_RESULTS} from "../../Mocks";
import {flushPromises} from "@vue/test-utils";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {ContractResultByTsCache} from "@/utils/cache/ContractResultByTsCache";
import {ContractResultByHashCache} from "@/utils/cache/ContractResultByHashCache";

describe("ContractResultByTsCache", () => {

    test("contract results with contract_id", async () => {

        expect(ContractResultByTsCache.instance.isEmpty()).toBeTruthy()

        const mock = new MockAdapter(axios);

        const timestamp = SAMPLE_CONTRACT_RESULT_DETAILS.timestamp
        const matcher1 = "/api/v1/contracts/results"
        const param1 = {
            timestamp: timestamp,
            internal: true
        }
        mock.onGet(matcher1, param1).reply(200, {
            results: [SAMPLE_CONTRACT_RESULT_DETAILS], "links": {"next": null}
        });
        const contractId = SAMPLE_CONTRACT_RESULT_DETAILS.contract_id
        const matcher2 = "/api/v1/contracts/" + contractId + "/results/" + timestamp
        mock.onGet(matcher2).reply(200, SAMPLE_CONTRACT_RESULT_DETAILS);

        // 1) First lookup() triggers http requests
        const contractResult = await ContractResultByTsCache.instance.lookup(timestamp)
        expect(contractResult).toStrictEqual(SAMPLE_CONTRACT_RESULT_DETAILS)
        expect(mock.history.get.length).toBe(2)

        // 2) Second lookup() triggers no http requests
        mock.resetHistory()
        const contractResult2 = await ContractResultByTsCache.instance.lookup(timestamp)
        await flushPromises()
        expect(contractResult2).toStrictEqual(SAMPLE_CONTRACT_RESULT_DETAILS)
        expect(mock.history.get.length).toBe(0)

        // Checks that ContractResultByHashCache has been populated
        if (contractResult?.hash) {
            expect(ContractResultByHashCache.instance.contains(contractResult.hash))
        }

        mock.restore()
    })

    test("contract result without contract_id", async () => {

        expect(ContractResultByTsCache.instance.isEmpty()).toBeTruthy()

        const mock = new MockAdapter(axios);

        const timestamp = SAMPLE_ERROR_RESULTS.results[0].timestamp
        const matcher1 = "/api/v1/contracts/results"
        const param1 = {
            timestamp: timestamp,
            internal: true
        }
        mock.onGet(matcher1, param1).reply(200, SAMPLE_ERROR_RESULTS);
        const ethereumHash = SAMPLE_ERROR_RESULTS.results[0].hash
        const matcher2 = "/api/v1/contracts/results/" + ethereumHash
        mock.onGet(matcher2).reply(200, SAMPLE_ERROR_RESULTS.results[0]);

        // 1) First lookup() triggers http requests
        const contractResult = await ContractResultByTsCache.instance.lookup(timestamp)
        expect(contractResult).toStrictEqual(SAMPLE_ERROR_RESULTS.results[0])
        expect(mock.history.get.length).toBe(2)

        // 2) Second lookup() triggers no http requests
        mock.resetHistory()
        const contractResult2 = await ContractResultByTsCache.instance.lookup(timestamp)
        await flushPromises()
        expect(contractResult2).toStrictEqual(SAMPLE_ERROR_RESULTS.results[0])
        expect(mock.history.get.length).toBe(0)

        // Checks that ContractResultByHashCache has been populated
        if (contractResult?.hash) {
            expect(ContractResultByHashCache.instance.contains(contractResult.hash))
        }

        mock.restore()
    })
})
