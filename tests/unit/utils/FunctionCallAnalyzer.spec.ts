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

import {FunctionCallAnalyzer, NameTypeValue} from "@/utils/FunctionCallAnalyzer";
import {Ref, ref} from "vue";
import {flushPromises} from "@vue/test-utils";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {BigNumber} from "ethers";

describe("FunctionCallAnalyzer.spec.ts", () => {

    test("basic flow", async () => {

        const abi = require('../../../public/abi/IHederaTokenService.json')
        const mock = new MockAdapter(axios);
        const matcher1 = "http://localhost/abi/IHederaTokenService.json"
        mock.onGet(matcher1).reply(200, abi)

        // 1) new
        const input: Ref<string|null> = ref(null)
        const output: Ref<string|null> = ref(null)
        const contractId: Ref<string|null> = ref(null)
        const functionCallAnalyzer = new FunctionCallAnalyzer(input, output, contractId)
        expect(functionCallAnalyzer.functionHash.value).toBeNull()
        expect(functionCallAnalyzer.signature.value).toBeNull()
        expect(functionCallAnalyzer.inputs.value).toStrictEqual([])
        expect(functionCallAnalyzer.outputs.value).toStrictEqual([])

        // 2) mount
        functionCallAnalyzer.mount()
        await flushPromises()
        expect(functionCallAnalyzer.functionHash.value).toBeNull()
        expect(functionCallAnalyzer.signature.value).toBeNull()
        expect(functionCallAnalyzer.inputs.value).toStrictEqual([])
        expect(functionCallAnalyzer.outputs.value).toStrictEqual([])

        // 3) input setup
        input.value = "0x49146bde000000000000000000000000845b706151aed537b1fd81c1ea4ea03920097abd0000000000000000000000000000000000000000000000000000000002e6ae09"
        output.value = "0x0000000000000000000000000000000000000000000000000000000005a995c0"
        contractId.value = "0.0.359"
        await flushPromises()
        expect(functionCallAnalyzer.functionHash.value).toBe("0x49146bde")
        expect(functionCallAnalyzer.signature.value).toBe("associateToken(address,address)")
        expect(functionCallAnalyzer.inputs.value).toStrictEqual([
            new NameTypeValue("account", "address", "0x845b706151aEd537b1FD81c1Ea4EA03920097ABD"),
            new NameTypeValue("token", "address", "0x0000000000000000000000000000000002E6Ae09"),
        ])
        expect(functionCallAnalyzer.outputs.value).toStrictEqual([
            new NameTypeValue("responseCode", "int64", BigNumber.from("0x05a995c0")),
        ])

        // 4) unmount
        functionCallAnalyzer.unmount()
        await flushPromises()
        expect(functionCallAnalyzer.functionHash.value).toBeNull()
        expect(functionCallAnalyzer.signature.value).toBeNull()
        expect(functionCallAnalyzer.inputs.value).toStrictEqual([])
        expect(functionCallAnalyzer.outputs.value).toStrictEqual([])

    })

})
