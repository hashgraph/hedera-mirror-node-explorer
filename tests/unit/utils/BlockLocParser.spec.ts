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

import {Ref, ref} from "vue";
import {flushPromises} from "@vue/test-utils";
import {SAMPLE_BLOCK} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {CacheUtils} from "@/utils/cache/CacheUtils";
import {BlockLocParser} from "@/utils/parser/BlockLocParser";
import {PathParam} from "@/utils/PathParam";

describe("BlockLocParser.ts", () => {

    beforeEach(() => CacheUtils.clearAll())

    //
    // mount + set/unset block loc + unmount
    //

    test("mount + set/unset block loc + unmount", async () => {

        const mock = new MockAdapter(axios)

        const matcher1 = "/api/v1/blocks/" + SAMPLE_BLOCK.number
        mock.onGet(matcher1).reply(200, SAMPLE_BLOCK);

        // 0) Creates parser
        const blockLoc: Ref<string|null> = ref(null)
        const parser = new BlockLocParser(blockLoc)
        await flushPromises()
        expect(parser.blockLoc.value).toBeNull()
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBeNull()

        // 1) Mounts parser
        parser.mount()
        await flushPromises()
        expect(parser.blockLoc.value).toBeNull()
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBeNull()

        // 2) Sets with block number
        blockLoc.value = SAMPLE_BLOCK.number.toString()
        expect(parser.blockLoc.value).toBe(SAMPLE_BLOCK.number.toString())
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBeNull()
        await flushPromises()
        expect(parser.blockLoc.value).toBe(SAMPLE_BLOCK.number.toString())
        expect(parser.block.value).toStrictEqual(SAMPLE_BLOCK)
        expect(parser.blockNumber.value).toBe(SAMPLE_BLOCK.number)
        expect(parser.blockCount.value).toBe(SAMPLE_BLOCK.count)
        expect(parser.toTimestamp.value).toBe(SAMPLE_BLOCK.timestamp.to)
        expect(parser.errorNotification.value).toBe(null)

        // 3) Unsets
        blockLoc.value = null
        await flushPromises()
        expect(parser.blockLoc.value).toBeNull()
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBeNull()

        // 4) Unmounts parser
        parser.unmount()
        await flushPromises()
        expect(parser.blockLoc.value).toBeNull()
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBeNull()
    })

    //
    // set block loc + mount + unmount + unset block loc
    //

    test("set block loc + mount + unmount + unset block loc", async () => {

        const mock = new MockAdapter(axios)

        const matcher1 = "/api/v1/blocks/" + SAMPLE_BLOCK.number
        mock.onGet(matcher1).reply(200, SAMPLE_BLOCK);

        // 0) Creates parser
        const blockLoc: Ref<string|null> = ref(null)
        const parser = new BlockLocParser(blockLoc)
        await flushPromises()
        expect(parser.blockLoc.value).toBeNull()
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBeNull()

        // 1) Sets with block number
        blockLoc.value = SAMPLE_BLOCK.number.toString()
        expect(parser.blockLoc.value).toBe(SAMPLE_BLOCK.number.toString())
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBeNull()
        await flushPromises()
        expect(parser.blockLoc.value).toBe(SAMPLE_BLOCK.number.toString())
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBeNull()

        // 2) Mounts parser
        parser.mount()
        await flushPromises()
        expect(parser.blockLoc.value).toBe(SAMPLE_BLOCK.number.toString())
        expect(parser.block.value).toStrictEqual(SAMPLE_BLOCK)
        expect(parser.blockNumber.value).toBe(SAMPLE_BLOCK.number)
        expect(parser.blockCount.value).toBe(SAMPLE_BLOCK.count)
        expect(parser.toTimestamp.value).toBe(SAMPLE_BLOCK.timestamp.to)
        expect(parser.errorNotification.value).toBe(null)

        // 3) Unmounts parser
        parser.unmount()
        await flushPromises()
        expect(parser.blockLoc.value).toBe(SAMPLE_BLOCK.number.toString())
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBeNull()

        // Unsets
        blockLoc.value = null
        await flushPromises()
        expect(parser.block.value).toBeNull()
        expect(parser.blockLoc.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBeNull()
    })

    //
    // set block loc with hash
    //

    test("set block loc with block hash", async () => {

        const mock = new MockAdapter(axios)

        const SAMPLE_BLOCK_HASH = PathParam.parseBlockLoc(SAMPLE_BLOCK.hash)!.toString()
        const matcher1 = "/api/v1/blocks/" + SAMPLE_BLOCK_HASH
        mock.onGet(matcher1).reply(200, SAMPLE_BLOCK);

        // 0) Creates parser
        const blockLoc: Ref<string|null> = ref(null)
        const parser = new BlockLocParser(blockLoc)
        await flushPromises()
        expect(parser.blockLoc.value).toBeNull()
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBeNull()

        // 1) Mounts parser
        parser.mount()
        await flushPromises()
        expect(parser.blockLoc.value).toBeNull()
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBeNull()

        // 2) Sets with block hash
        blockLoc.value = SAMPLE_BLOCK.hash
        expect(parser.blockLoc.value).toBe(SAMPLE_BLOCK.hash)
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBeNull()
        await flushPromises()
        expect(parser.blockLoc.value).toBe(SAMPLE_BLOCK.hash)
        expect(parser.block.value).toStrictEqual(SAMPLE_BLOCK)
        expect(parser.blockNumber.value).toBe(SAMPLE_BLOCK.number)
        expect(parser.blockCount.value).toBe(SAMPLE_BLOCK.count)
        expect(parser.toTimestamp.value).toBe(SAMPLE_BLOCK.timestamp.to)
        expect(parser.errorNotification.value).toBe(null)

        // 3) Unsets
        blockLoc.value = null
        await flushPromises()
        expect(parser.blockLoc.value).toBeNull()
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBeNull()

        // 4) Unmounts parser
        parser.unmount()
        await flushPromises()
        expect(parser.blockLoc.value).toBeNull()
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBeNull()
    })

    //
    // set block loc with unknown block number
    //

    test("set block loc with unknown block number", async () => {

        const mock = new MockAdapter(axios)

        const UNKNOWN_NB = 42
        const matcher1 = "/api/v1/blocks/" + UNKNOWN_NB
        mock.onGet(matcher1).reply(404);

        // 0) Creates parser
        const blockLoc: Ref<string|null> = ref(null)
        const parser = new BlockLocParser(blockLoc)
        await flushPromises()
        expect(parser.blockLoc.value).toBeNull()
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBeNull()

        // 1) Mounts parser
        parser.mount()
        await flushPromises()
        expect(parser.blockLoc.value).toBeNull()
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBeNull()

        // 2) Sets with block number
        blockLoc.value = UNKNOWN_NB.toString()
        expect(parser.blockLoc.value).toBe(UNKNOWN_NB.toString())
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBeNull()
        await flushPromises()
        expect(parser.blockLoc.value).toBe(UNKNOWN_NB.toString())
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBe("Block with number 42 was not found")

        // 3) Unsets
        blockLoc.value = null
        await flushPromises()
        expect(parser.blockLoc.value).toBeNull()
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBeNull()

        // 4) Unmounts parser
        parser.unmount()
        await flushPromises()
        expect(parser.blockLoc.value).toBeNull()
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBeNull()
    })


    //
    // set block loc with unknown hash
    //

    test("set block loc with unknown ethereum hash", async () => {

        const mock = new MockAdapter(axios)

        const UNKNOWN_HASH = "0x0011223344556677001122334455667700112233445566770011223344556677"
        const matcher1 = "/api/v1/blocks/" + UNKNOWN_HASH
        mock.onGet(matcher1).reply(404);

        // 0) Creates parser
        const blockLoc: Ref<string|null> = ref(null)
        const parser = new BlockLocParser(blockLoc)
        await flushPromises()
        expect(parser.blockLoc.value).toBeNull()
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBeNull()

        // 1) Mounts parser
        parser.mount()
        await flushPromises()
        expect(parser.blockLoc.value).toBeNull()
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBeNull()

        // 2) Sets with block hash
        blockLoc.value = UNKNOWN_HASH
        expect(parser.blockLoc.value).toBe(UNKNOWN_HASH)
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBeNull()
        await flushPromises()
        expect(parser.blockLoc.value).toBe(UNKNOWN_HASH)
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBe("Block with hash 0x0011223344556677001122334455667700112233445566770011223344556677 was not found")

        // 3) Unsets
        blockLoc.value = null
        await flushPromises()
        expect(parser.blockLoc.value).toBeNull()
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBeNull()

        // 4) Unmounts parser
        parser.unmount()
        await flushPromises()
        expect(parser.blockLoc.value).toBeNull()
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBeNull()
    })


    //
    // set block loc with dummy value
    //

    test("set block loc with dummy value", async () => {

        const DUMMY_LOC = "dummy block loc"

        // 0) Creates parser
        const blockLoc: Ref<string|null> = ref(null)
        const parser = new BlockLocParser(blockLoc)
        await flushPromises()
        expect(parser.blockLoc.value).toBeNull()
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBeNull()

        // 1) Mounts parser
        parser.mount()
        await flushPromises()
        expect(parser.blockLoc.value).toBeNull()
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBeNull()

        // 2) Sets with dummy loc
        blockLoc.value = DUMMY_LOC
        expect(parser.blockLoc.value).toBe(DUMMY_LOC)
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBe("Invalid block number or hash: dummy block loc")
        await flushPromises()
        expect(parser.blockLoc.value).toBe(DUMMY_LOC)
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBe("Invalid block number or hash: dummy block loc")

        // 3) Unsets
        blockLoc.value = null
        await flushPromises()
        expect(parser.blockLoc.value).toBeNull()
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBeNull()

        // 4) Unmounts parser
        parser.unmount()
        await flushPromises()
        expect(parser.blockLoc.value).toBeNull()
        expect(parser.block.value).toBeNull()
        expect(parser.blockNumber.value).toBeNull()
        expect(parser.blockCount.value).toBeNull()
        expect(parser.toTimestamp.value).toBeNull()
        expect(parser.errorNotification.value).toBeNull()
    })

})
