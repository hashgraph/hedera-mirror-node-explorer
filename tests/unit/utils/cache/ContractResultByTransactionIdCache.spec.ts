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
import {SAMPLE_CONTRACT_RESULT_DETAILS,} from "../../Mocks";
import {flushPromises} from "@vue/test-utils";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {ContractResultByTransactionIdCache} from "@/utils/cache/ContractResultByTransactionIdCache";

describe("ContractResultByTransactionIdCache", () => {

    test("ContractResultByTransactionIdCache", async () => {

        expect(ContractResultByTransactionIdCache.instance.isEmpty()).toBeTruthy()

        const mock = new MockAdapter(axios as any);

        const transactionId = "0.0.2307776@1683720888.979207121"
        const matcher1 = "/api/v1/contracts/results/" + transactionId
        mock.onGet(matcher1).reply(200, SAMPLE_CONTRACT_RESULT_DETAILS);

        // 1) First lookup() triggers http requests
        const contractResult = await ContractResultByTransactionIdCache.instance.lookup(transactionId)
        expect(contractResult).toStrictEqual(SAMPLE_CONTRACT_RESULT_DETAILS)
        expect(mock.history.get.length).toBe(1)

        // 2) Second lookup() triggers no http requests
        mock.resetHistory()
        const contractResult2 = await ContractResultByTransactionIdCache.instance.lookup(transactionId)
        await flushPromises()
        expect(contractResult2).toStrictEqual(SAMPLE_CONTRACT_RESULT_DETAILS)
        expect(mock.history.get.length).toBe(0)

        // Checks that ContractResultByTransactionIdCache has been populated
        expect(ContractResultByTransactionIdCache.instance.contains(transactionId))

        mock.restore()
    })
})
