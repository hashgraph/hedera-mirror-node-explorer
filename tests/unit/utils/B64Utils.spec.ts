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

import {byteToHex, hexToByte} from "@/utils/B64Utils";
import base32Decode from "base32-decode";
import base32Encode from "base32-encode";

describe("B64Utils.ts", () => {

    const hexString = "12200000fc0634e2ab455eff393f04819efa262fe5e6ab1c7ed1d4f85fbcd8e6e296"
    const base32String = "CIQAAAH4AY2OFK2FL37TSPYEQGPPUJRP4XTKWHD62HKPQX543DTOFFQ"


    test("hexToByte() <=> byteToHex()", ()=> {
        const decodedBytes = hexToByte(hexString)
        expect(decodedBytes).not.toBeNull()
        const hexString2 = byteToHex(decodedBytes!)
        expect(hexString2).toEqual(hexString)
    })

    test("hexToByte() <=> byteToHex()   with 0x prefix", ()=> {
        const decodedBytes = hexToByte("0x" + hexString)
        expect(decodedBytes).not.toBeNull()
        const hexString2 = byteToHex(decodedBytes!)
        expect(hexString2).toEqual(hexString)
    })

    test("base32Encode", () => {

        const decodedBytes = hexToByte(hexString)
        expect(decodedBytes).not.toBeNull()

        const encodedString = base32Encode(decodedBytes!, 'RFC4648', { padding: false })
        expect(encodedString).toEqual(base32String)
    })


    test("base32Decode", () => {

        const decodedBytes = base32Decode(base32String, 'RFC4648')
        expect(decodedBytes).not.toBeNull()

        const decodedHex = byteToHex(new Uint8Array(decodedBytes))
        expect(decodedHex).toEqual(hexString)
    })

})

