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

import {describe, test, expect} from 'vitest'
import {FunctionCallAnalyzer, NameTypeValue} from "@/utils/analyzer/FunctionCallAnalyzer";
import {Ref, ref} from "vue";
import {flushPromises} from "@vue/test-utils";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {BigNumber} from "ethers";

describe("FunctionCallAnalyzer.spec.ts", () => {

    test("basic flow", async () => {

        const abi = require('../../../../public/abi/IHederaTokenService.json')
        const mock = new MockAdapter(axios);
        const matcher1 = "http://localhost:3000/abi/IHederaTokenService.json"
        mock.onGet(matcher1).reply(200, abi)

        // 1) new
        const input: Ref<string|null> = ref(null)
        const output: Ref<string|null> = ref(null)
        const error: Ref<string|null> = ref(null)
        const contractId: Ref<string|null> = ref(null)
        const functionCallAnalyzer = new FunctionCallAnalyzer(input, output, error, contractId)
        expect(functionCallAnalyzer.functionHash.value).toBeNull()
        expect(functionCallAnalyzer.signature.value).toBeNull()
        expect(functionCallAnalyzer.inputs.value).toStrictEqual([])
        expect(functionCallAnalyzer.outputs.value).toStrictEqual([])
        expect(functionCallAnalyzer.errorHash.value).toBeNull()
        expect(functionCallAnalyzer.errorSignature.value).toBeNull()
        expect(functionCallAnalyzer.errorInputs.value).toStrictEqual([])
        expect(functionCallAnalyzer.inputDecodingStatus.value).toBeNull()
        expect(functionCallAnalyzer.outputDecodingStatus.value).toBeNull()
        expect(functionCallAnalyzer.errorDecodingStatus.value).toBeNull()

        // 2) mount
        functionCallAnalyzer.mount()
        await flushPromises()
        expect(functionCallAnalyzer.functionHash.value).toBeNull()
        expect(functionCallAnalyzer.signature.value).toBeNull()
        expect(functionCallAnalyzer.inputs.value).toStrictEqual([])
        expect(functionCallAnalyzer.outputs.value).toStrictEqual([])
        expect(functionCallAnalyzer.errorHash.value).toBeNull()
        expect(functionCallAnalyzer.errorSignature.value).toBeNull()
        expect(functionCallAnalyzer.errorInputs.value).toStrictEqual([])
        expect(functionCallAnalyzer.inputDecodingStatus.value).toBeNull()
        expect(functionCallAnalyzer.outputDecodingStatus.value).toBeNull()
        expect(functionCallAnalyzer.errorDecodingStatus.value).toBeNull()

        // 3) input setup (valid encoding)
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
        expect(functionCallAnalyzer.errorHash.value).toBeNull()
        expect(functionCallAnalyzer.errorSignature.value).toBeNull()
        expect(functionCallAnalyzer.errorInputs.value).toStrictEqual([])
        expect(functionCallAnalyzer.inputDecodingStatus.value).toBeNull()
        expect(functionCallAnalyzer.outputDecodingStatus.value).toBeNull()
        expect(functionCallAnalyzer.errorDecodingStatus.value).toBeNull()

        // 4) input setup (invalid input encoding)
        input.value = "0x618dc65e0000000000000000000000000000000000163b5a70a082310000000000000000000000005fe56763c7633efefe8c2272f19732521a48e300"
        output.value = "0x00000000000000000000000000000000000000000000000000003dc604b33217"
        contractId.value = "0.0.359"
        await flushPromises()
        expect(functionCallAnalyzer.functionHash.value).toBeNull()
        expect(functionCallAnalyzer.signature.value).toBeNull()
        expect(functionCallAnalyzer.inputs.value).toStrictEqual([])
        expect(functionCallAnalyzer.outputs.value).toStrictEqual([])
        expect(functionCallAnalyzer.errorHash.value).toBeNull()
        expect(functionCallAnalyzer.errorSignature.value).toBeNull()
        expect(functionCallAnalyzer.errorInputs.value).toStrictEqual([])
        expect(functionCallAnalyzer.inputDecodingStatus.value).toBe("Decoding Error (data out-of-bounds)")
        expect(functionCallAnalyzer.outputDecodingStatus.value).toBe("Decoding Error (data out-of-bounds)")
        expect(functionCallAnalyzer.errorDecodingStatus.value).toBeNull()

        // 5) output setup (invalid output encoding)
        input.value = "0x49146bde000000000000000000000000845b706151aed537b1fd81c1ea4ea03920097abd0000000000000000000000000000000000000000000000000000000002e6ae09"
        output.value = "0x000000009999999999999999999999999"
        contractId.value = "0.0.359"
        await flushPromises()
        expect(functionCallAnalyzer.functionHash.value).toBe("0x49146bde")
        expect(functionCallAnalyzer.signature.value).toBe("associateToken(address,address)")
        expect(functionCallAnalyzer.inputs.value).toStrictEqual([
            new NameTypeValue("account", "address", "0x845b706151aEd537b1FD81c1Ea4EA03920097ABD"),
            new NameTypeValue("token", "address", "0x0000000000000000000000000000000002E6Ae09"),
        ])
        expect(functionCallAnalyzer.outputs.value).toStrictEqual([])
        expect(functionCallAnalyzer.errorHash.value).toBeNull()
        expect(functionCallAnalyzer.errorSignature.value).toBeNull()
        expect(functionCallAnalyzer.errorInputs.value).toStrictEqual([])
        expect(functionCallAnalyzer.inputDecodingStatus.value).toBeNull()
        expect(functionCallAnalyzer.outputDecodingStatus.value).toBe("Decoding Error (hex data is odd-length)")
        expect(functionCallAnalyzer.errorDecodingStatus.value).toBeNull()


        // 6) unmount
        functionCallAnalyzer.unmount()
        await flushPromises()
        expect(functionCallAnalyzer.functionHash.value).toBeNull()
        expect(functionCallAnalyzer.signature.value).toBeNull()
        expect(functionCallAnalyzer.inputs.value).toStrictEqual([])
        expect(functionCallAnalyzer.outputs.value).toStrictEqual([])
        expect(functionCallAnalyzer.errorHash.value).toBeNull()
        expect(functionCallAnalyzer.errorSignature.value).toBeNull()
        expect(functionCallAnalyzer.errorInputs.value).toStrictEqual([])
        expect(functionCallAnalyzer.inputDecodingStatus.value).toBeNull()
        expect(functionCallAnalyzer.outputDecodingStatus.value).toBeNull()
        expect(functionCallAnalyzer.errorDecodingStatus.value).toBeNull()

        mock.restore()
    })

})
