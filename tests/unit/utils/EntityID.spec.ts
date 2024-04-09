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

import {describe, expect, test} from 'vitest'
import {EntityID} from "@/utils/EntityID";

describe("EntityID.ts", () => {

    //
    // EntityID.parse()
    //

    test("0.0.0", () => {
        const str = "0.0.0"
        const obj = EntityID.parse(str)
        expect(obj?.shard).toBe(0)
        expect(obj?.realm).toBe(0)
        expect(obj?.num).toBe(0)
        expect(obj?.checksum).toBeNull()
        expect(obj?.toString()).toBe(str)

        const str2 = "0.0.0-abcde"
        expect(EntityID.parse(str2)).toBeNull()
        const obj2 = EntityID.parseWithChecksum(str2)
        expect(obj2?.shard).toBe(0)
        expect(obj2?.realm).toBe(0)
        expect(obj2?.num).toBe(0)
        expect(obj2?.checksum).toBe("abcde")
        expect(obj2?.toString()).toBe(str)
    })

    test("1.1.1", () => {
        const str = "1.1.1"
        const obj = EntityID.parse(str)
        expect(obj?.shard).toBe(1)
        expect(obj?.realm).toBe(1)
        expect(obj?.num).toBe(1)
        expect(obj?.checksum).toBeNull()
        expect(obj?.toString()).toBe(str)

        const str2 = "1.1.1-abcde"
        expect(EntityID.parse(str2)).toBeNull()
        const obj2 = EntityID.parseWithChecksum(str2)
        expect(obj2?.shard).toBe(1)
        expect(obj2?.realm).toBe(1)
        expect(obj2?.num).toBe(1)
        expect(obj2?.checksum).toBe("abcde")
        expect(obj2?.toString()).toBe(str)
    })

    test("0.0.98", () => {
        const str = "0.0.98"
        const obj = EntityID.parse(str)
        expect(obj?.shard).toBe(0)
        expect(obj?.realm).toBe(0)
        expect(obj?.num).toBe(98)
        expect(obj?.checksum).toBeNull()
        expect(obj?.toString()).toBe(str)

        const str2 = "0.0.98-abcde"
        expect(EntityID.parse(str2)).toBeNull()
        const obj2 = EntityID.parseWithChecksum(str2)
        expect(obj2?.shard).toBe(0)
        expect(obj2?.realm).toBe(0)
        expect(obj2?.num).toBe(98)
        expect(obj2?.checksum).toBe("abcde")
        expect(obj2?.toString()).toBe(str)
    })

    test("0.0.721838", () => {
        const str = "0.0.721838"
        const obj = EntityID.parse(str)
        expect(obj?.shard).toBe(0)
        expect(obj?.realm).toBe(0)
        expect(obj?.num).toBe(721838)
        expect(obj?.checksum).toBeNull()
        expect(obj?.toString()).toBe(str)

        const str2 = "0.0.721838-abcde"
        expect(EntityID.parse(str2)).toBeNull()
        const obj2 = EntityID.parseWithChecksum(str2)
        expect(obj2?.shard).toBe(0)
        expect(obj2?.realm).toBe(0)
        expect(obj2?.num).toBe(721838)
        expect(obj2?.checksum).toBe("abcde")
        expect(obj2?.toString()).toBe(str)
    })

    test("98", () => {
        const str = "98"
        expect(EntityID.parse(str)).toBeNull()
        const obj = EntityID.parse(str, true)
        expect(obj?.shard).toBe(0)
        expect(obj?.realm).toBe(0)
        expect(obj?.num).toBe(98)
        expect(obj?.checksum).toBeNull()
        expect(obj?.toString()).toBe("0.0.98")

        const str2 = "98-abcde"
        expect(EntityID.parse(str2)).toBeNull()
        expect(EntityID.parse(str2, true)).toBeNull()
        expect(EntityID.parseWithChecksum(str2)).toBeNull()
        const obj2 = EntityID.parseWithChecksum(str2, true, true)
        expect(obj2?.shard).toBe(0)
        expect(obj2?.realm).toBe(0)
        expect(obj2?.num).toBe(98)
        expect(obj2?.checksum).toBe("abcde")
        expect(obj2?.toString()).toBe("0.0.98")
    })

    test("Very big number", () => {
        const veryBigNum = Math.pow(2, 32) - 1
        const obj = EntityID.parse(veryBigNum.toString())
        expect(obj).toBeNull()
        const obj2 = EntityID.parse(veryBigNum.toString(), true)
        expect(obj2?.shard).toBe(0)
        expect(obj2?.realm).toBe(0)
        expect(obj2?.num).toBe(veryBigNum)
        expect(obj2?.checksum).toBeNull()
        expect(obj2?.toString()).toBe("0.0." + veryBigNum.toString())
    })

    test("1.2.3.4", () => {
        const obj = EntityID.parse("1.2.3.4")
        expect(obj).toBeNull()
    })

    test("a.2.3", () => {
        const obj = EntityID.parse("a.2.3")
        expect(obj).toBeNull()
    })

    test("0.b.3", () => {
        const obj = EntityID.parse("0.b.3")
        expect(obj).toBeNull()
    })

    test("0.0.c", () => {
        const obj = EntityID.parse("0.0.c")
        expect(obj).toBeNull()
    })

    test("0.0.", () => {
        const obj = EntityID.parse("0.0.")
        expect(obj).toBeNull()
    })

    test("0.0", () => {
        const obj = EntityID.parse("0.0")
        expect(obj).toBeNull()
    })

    test("0.", () => {
        const obj = EntityID.parse("0.")
        expect(obj).toBeNull()
    })

    test("..", () => {
        const obj = EntityID.parse("..")
        expect(obj).toBeNull()
    })

    test(".", () => {
        const obj = EntityID.parse(".")
        expect(obj).toBeNull()
    })

    test("0x000000444", () => {
        const obj = EntityID.parse("0x000000444", true)
        expect(obj).toBeNull()
    })

    test("Too Big Number", () => {
        const tooBigNum = Math.pow(2, 32)
        const obj = EntityID.parse(tooBigNum.toString())
        expect(obj).toBeNull()
        const obj2 = EntityID.parse(tooBigNum.toString(), true)
        expect(obj2).toBeNull()
    })

    //
    // EntityID.fromAddress()
    //

    test("0x0000000000000000000000000000000000000000", () => {
        const a = "0x0000000000000000000000000000000000000000"
        const obj = EntityID.fromAddress(a)
        expect(obj?.shard).toBe(0)
        expect(obj?.realm).toBe(0)
        expect(obj?.num).toBe(0)
        expect(obj?.toString()).toBe("0.0.0")
    })

    test("0x00000000000000000000000000000000000000ff", () => {
        const a = "0x00000000000000000000000000000000000000ff"
        const obj = EntityID.fromAddress(a)
        expect(obj?.shard).toBe(0)
        expect(obj?.realm).toBe(0)
        expect(obj?.num).toBe(255)
        expect(obj?.toString()).toBe("0.0.255")
    })

    test("0x00000000000000000000000000000000ffffffff", () => {
        const a = "0x00000000000000000000000000000000ffffffff"
        const obj = EntityID.fromAddress(a)
        expect(obj?.shard).toBe(0)
        expect(obj?.realm).toBe(0)
        expect(obj?.num).toBe(EntityID.MAX_INT - 1)
        expect(obj?.toString()).toBe("0.0.4294967295")
    })

    test("0x0000000000000000000000000000000100000000", () => {
        const a = "0x0000000000000000000000000000000100000000"
        const obj = EntityID.fromAddress(a)
        expect(obj).toBeNull()
    })


    //
    // EntityID.compareAccountID()
    //

    test("0.0.0 < 0.0.1", () => {
        const id1 = EntityID.parse("0.0.0")
        const id2 = EntityID.parse("0.0.1")
        expect(id1 !== null && id2 !== null).toBe(true)
        if (id1 !== null && id2 !== null) {
            expect(id1.compareAccountID(id2) < 0).toBe(true)
            expect(id2.compareAccountID(id1) > 0).toBe(true)
            expect(id1.compareAccountID(id1) == 0).toBe(true)
            expect(id2.compareAccountID(id2) == 0).toBe(true)
        }
    })

    test("0.0.100 < 0.0.101", () => {
        const id1 = EntityID.parse("0.0.100")
        const id2 = EntityID.parse("0.0.101")
        expect(id1 !== null && id2 !== null).toBe(true)
        if (id1 !== null && id2 !== null) {
            expect(id1.compareAccountID(id2) < 0).toBe(true)
            expect(id2.compareAccountID(id1) > 0).toBe(true)
            expect(id1.compareAccountID(id1) == 0).toBe(true)
            expect(id2.compareAccountID(id2) == 0).toBe(true)
        }
    })

    test("0.0.100 < 0.0.99", () => {
        const id1 = EntityID.parse("0.0.100")
        const id2 = EntityID.parse("0.0.99")
        expect(id1 !== null && id2 !== null).toBe(true)
        if (id1 !== null && id2 !== null) {
            expect(id1.compareAccountID(id2) < 0).toBe(true)
            expect(id2.compareAccountID(id1) > 0).toBe(true)
            expect(id1.compareAccountID(id1) == 0).toBe(true)
            expect(id2.compareAccountID(id2) == 0).toBe(true)
        }
    })

    //
    // EntityID.fromAddress()
    //

    test("fromAddress(0x00000000000000000000000000000000000000ff)", () => {
        const evmAddress = "0x00000000000000000000000000000000000000ff"
        const id = EntityID.fromAddress(evmAddress)
        expect(id?.toString()).toBe("0.0.255")
    })

    test("fromAddress(0x6482571dbbE4E68CbcDC6207f82d701804b8664a)", () => {
        const evmAddress = "0x6482571dbbE4E68CbcDC6207f82d701804b8664a"
        const id = EntityID.fromAddress(evmAddress)
        expect(id).toBeNull()
    })
})
