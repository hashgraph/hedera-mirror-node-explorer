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


import {BlockHON} from "@/utils/BlockHON";

describe("BlockHON", () => {

    test("BlockHON.parse() with a hash", () => {

        const sampleHash = "aa1c941f33e06fc8458bf82880527b01473ca7dff9dee0159542c00971038109dbd86515ff4ff1f4d9fd25428d39489b"

        let hon = BlockHON.parse(sampleHash)
        expect(hon).toBe(sampleHash)

        hon = BlockHON.parse("0x" + sampleHash)
        expect(hon).toBe(sampleHash)
    })

    test("BlockHON.parse() with a number", () => {

        const sampleNb = "444"
        const hon = BlockHON.parse(sampleNb)
        expect(hon).toBe(sampleNb)
    })

    test("BlockHON.parse() with invalid block number", () => {
        expect(BlockHON.parse("-1")).toBeNull()
    })

    test("BlockHON.parse() with invalid block hash", () => {

        const tooShort = "1c941f33e06fc8458bf82880527b01473ca7dff9dee0159542c00971038109dbd86515ff4ff1f4d9fd25428d39489b"

        let hon = BlockHON.parse(tooShort)
        expect(hon).toBeNull()

        hon = BlockHON.parse("0x" + tooShort)
        expect(hon).toBeNull()

        const tooLong = "aa1c941f33e06fc8458bf82880527b01473ca7dff9dee0159542c00971038109dbd86515ff4ff1f4d9fd25428d39489b00"

        hon = BlockHON.parse(tooLong)
        expect(hon).toBeNull()

        hon = BlockHON.parse("0x" + tooShort)
        expect(hon).toBeNull()
    })
})
