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

import {ComplexKeyLine} from "@/utils/ComplexKeyLine";
import hashgraph from "@hashgraph/proto/lib/proto";
import {hexToByte} from "@/utils/B64Utils";

const COMPLEX_KEY = "0x2a880208021283020a562a54080112500a2632240a221220ef2d877b88b7464d9253560b8851316f5c2f6ddf935eb4eec0761a3262b0a48c0a2632240a221220a95d54cf49c1d08cd16d8908f37dfad95637134ffaf528a1d96da7f28d45f1390aa8012aa501080212a0010a2632240a221220c44c911fa45166e356b498463184459dd9ee760bacc083de348691d6357e06340a2632240a221220ef2d877b88b7464d9253560b8851316f5c2f6ddf935eb4eec0761a3262b0a48c0a2632240a221220a95d54cf49c1d08cd16d8908f37dfad95637134ffaf528a1d96da7f28d45f1390a2632240a221220daa5da866bf4e990c14eff4336f5ab4b416c85a31289c8cb8ae1b4a54ce8c111"
const CONTRACT_KEY = "0a0418caba02" // Contract ID: 0.0.40266

describe("ComplexKeyLine.ts", () => {

    test("0.0.4 key", () => {

        const keyBytes = hexToByte(COMPLEX_KEY)
        expect(keyBytes).not.toBeNull()

        const key = hashgraph.proto.Key.decode(keyBytes!)
        expect(key).not.toBeNull()

        const lines = ComplexKeyLine.flattenComplexKey(key)
        expect(lines.length).toBe(9)
    })

    test("Key with contract id", () => {

        const keyBytes = hexToByte(CONTRACT_KEY)
        expect(keyBytes).not.toBeNull()

        const key = hashgraph.proto.Key.decode(keyBytes!)
        expect(key).not.toBeNull()

        const lines = ComplexKeyLine.flattenComplexKey(key)
        expect(lines.length).toBe(1)
        expect(lines[0].contractId()).toBe("0.0.40266")
    })

})

