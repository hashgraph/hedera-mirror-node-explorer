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


import {PathParam} from "@/utils/PathParam";

describe("PathParam", () => {

    //
    // parseBlockHashOrNumber()
    //

    test("PathParam.parseBlockHashOrNumber() with a hash", () => {

        const sampleHash = "aa1c941f33e06fc8458bf82880527b01473ca7dff9dee0159542c00971038109dbd86515ff4ff1f4d9fd25428d39489b"

        let hon = PathParam.parseBlockHashOrNumber(sampleHash)
        expect(hon).toBe(sampleHash)

        hon = PathParam.parseBlockHashOrNumber("0x" + sampleHash)
        expect(hon).toBe(sampleHash)
    })

    test("PathParam.parseBlockHashOrNumber() with a number", () => {

        const sampleNb = "444"
        const hon = PathParam.parseBlockHashOrNumber(sampleNb)
        expect(hon).toBe(sampleNb)
    })

    test("PathParam.parse() with invalid block number", () => {
        expect(PathParam.parseBlockHashOrNumber("-1")).toBeNull()
    })

    test("PathParam.parseBlockHashOrNumber() with invalid block hash", () => {

        const tooShort = "1c941f33e06fc8458bf82880527b01473ca7dff9dee0159542c00971038109dbd86515ff4ff1f4d9fd25428d39489b"

        let hon = PathParam.parseBlockHashOrNumber(tooShort)
        expect(hon).toBeNull()

        hon = PathParam.parseBlockHashOrNumber("0x" + tooShort)
        expect(hon).toBeNull()

        const tooLong = "aa1c941f33e06fc8458bf82880527b01473ca7dff9dee0159542c00971038109dbd86515ff4ff1f4d9fd25428d39489b00"

        hon = PathParam.parseBlockHashOrNumber(tooLong)
        expect(hon).toBeNull()

        hon = PathParam.parseBlockHashOrNumber("0x" + tooShort)
        expect(hon).toBeNull()
    })

    //
    // parseAccountIdOrAliasOrEvmAddress()
    //

    test("PathParam.parseAccountIdOrAliasOrEvmAddress() with entity id", () => {

        const accountId = "0.0.1234"

        const pp = PathParam.parseAccountIdOrAliasOrEvmAddress(accountId)
        expect(pp).toBe(accountId)
    })

    test("PathParam.parseAccountIdOrAliasOrEvmAddress() with alias in base32", () => {

        const alias = "HIQQGOSRIF3EM35ICXWUQH722CIRBIWTIT3MTN4MDUKK7Q2RYOSRXYZ5"

        const pp = PathParam.parseAccountIdOrAliasOrEvmAddress(alias)
        expect(pp).toBe(alias)
    })

    test("PathParam.parseAccountIdOrAliasOrEvmAddress() with alias in hex", () => {

        const alias = "HIQQGOSRIF3EM35ICXWUQH722CIRBIWTIT3MTN4MDUKK7Q2RYOSRXYZ5"
        const aliasInHex = "0x3a21033a514176466fa815ed481ffad09110a2d344f6c9b78c1d14afc351c3a51be33d"

        const pp = PathParam.parseAccountIdOrAliasOrEvmAddress(aliasInHex)
        expect(pp).toBe(alias)
    })

    test("PathParam.parseAccountIdOrAliasOrEvmAddress() with evm address", () => {

        const evmAddress = "a94f5374fce5edbc8e2a8697c15331677e6ebf0b"

        let pp = PathParam.parseAccountIdOrAliasOrEvmAddress(evmAddress)
        expect(pp).toBe("0x" + evmAddress)
        pp = PathParam.parseAccountIdOrAliasOrEvmAddress("0x" + evmAddress)
        expect(pp).toBe("0x" + evmAddress)
    })
})
