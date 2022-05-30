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

import {aliasToBase32, base32ToAlias, byteToHex, hexToByte} from "@/utils/B64Utils";

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

    test("aliasToBase32()", () => {

        const decodedBytes = hexToByte(hexString)
        expect(decodedBytes).not.toBeNull()

        const encodedString = aliasToBase32(decodedBytes!)
        expect(encodedString).toEqual(base32String)
    })


    test("base32ToAlias", () => {

        const decodedBytes = base32ToAlias(base32String)
        expect(decodedBytes).not.toBeNull()

        const decodedHex = byteToHex(new Uint8Array(decodedBytes))
        expect(decodedHex).toEqual(hexString)
    })

})

