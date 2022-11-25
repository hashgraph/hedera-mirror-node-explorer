// noinspection DuplicatedCode

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


import {nextTick, Ref, ref} from "vue";
import {ContractAction} from "@/schemas/HederaSchemas";
import {SignatureAnalyzer} from "@/utils/SignatureAnalyzer";
import {SAMPLE_4BYTE_0xB01EF608, SAMPLE_CONTRACT_ACTIONS} from "../Mocks";
import {flushPromises} from "@vue/test-utils";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

describe("SignatureAnalyzer.spec.ts", () => {

    test("call_type: CALL", async () => {

        const action: Ref<ContractAction|null> = ref(null)

        const analyzer = new SignatureAnalyzer(action)
        expect(analyzer.functionHash.value).toBeNull()
        expect(analyzer.signature.value).toBeNull()

        analyzer.mount()
        expect(analyzer.functionHash.value).toBeNull()
        expect(analyzer.signature.value).toBeNull()

        const mock = new MockAdapter(axios);
        const matcher1 = "https://www.4byte.directory/api/v1/signatures/"
        mock.onGet(matcher1).reply(200, SAMPLE_4BYTE_0xB01EF608)

        action.value = SAMPLE_CONTRACT_ACTIONS.actions[0] as ContractAction
        await flushPromises()
        expect(analyzer.functionHash.value).toBe("0xb01ef608")
        expect(analyzer.signature.value).toBe("buyV2(address,uint256,uint256,address)")

        action.value = null
        await nextTick()
        expect(analyzer.functionHash.value).toBeNull()
        expect(analyzer.signature.value).toBeNull()

        analyzer.mount()
        await nextTick()
        expect(analyzer.functionHash.value).toBeNull()
        expect(analyzer.signature.value).toBeNull()
    })

    test("call_type: SYSTEM", async () => {

        const abi = require('../../../public/abi/IHederaTokenService.json')
        const mock = new MockAdapter(axios);
        const matcher1 = "http://localhost/abi/IHederaTokenService.json"
        mock.onGet(matcher1).reply(200, abi)

        const action: Ref<ContractAction|null> = ref(null)

        const analyzer = new SignatureAnalyzer(action)
        expect(analyzer.functionHash.value).toBeNull()
        expect(analyzer.signature.value).toBeNull()

        analyzer.mount()
        expect(analyzer.functionHash.value).toBeNull()
        expect(analyzer.signature.value).toBeNull()

        action.value = SAMPLE_CONTRACT_ACTIONS.actions[3] as ContractAction
        await flushPromises()
        expect(analyzer.functionHash.value).toBe("0x49146bde")
        expect(analyzer.signature.value).toBe("associateToken(address,address)")

        action.value = null
        await nextTick()
        expect(analyzer.functionHash.value).toBeNull()
        expect(analyzer.signature.value).toBeNull()

        analyzer.mount()
        await nextTick()
        expect(analyzer.functionHash.value).toBeNull()
        expect(analyzer.signature.value).toBeNull()
    })

})

