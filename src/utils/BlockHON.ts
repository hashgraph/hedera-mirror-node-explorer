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

export class BlockHON { // Block Hash or Number

    public static parse(s: string): string|null {
        return BlockHON.parseBlockHash(s) ?? BlockHON.parseBlockNumber(s)
    }

    //
    // Private
    //

    private static parseBlockNumber(s: string): string|null {
        const n = parseInt(s, 10)
        return n > 0 && n.toString() == s ? n.toString() : null
    }

    private static parseBlockHash(s: string): string|null {
        const bytes = hexToByte(s)
        return bytes != null && bytes.length == 48 ? byteToHex(bytes) : null
    }
}