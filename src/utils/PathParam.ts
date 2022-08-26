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
import {EntityID} from "@/utils/EntityID";

export class PathParam { // Block Hash or Number

    public static parseBlockHashOrNumber(s: string|undefined): string|null {
        let result: string|null

        if (s) {
            const bytes = hexToByte(s)
            if (bytes != null && bytes.length == 48 ) { // SHA384 byte count
                result = byteToHex(bytes)
            } else {
                const n = parseInt(s)
                if (isNaN(n) || n < 0 || n.toString() != s) {
                    result = null
                } else {
                    result = n.toString()
                }
            }

        } else {
            result = null
        }

        return result
    }

    public static parseAccountIdOrAliasOrEvmAddress(s: string|undefined): string|null {
        let result: string|null

        if (s) {
            const id = EntityID.parse(s)
            if (id !== null) {
                result = id.toString()
            } else {
                const alias = base32ToAlias(s)
                if (alias !== null) {
                    result = aliasToBase32(alias)
                } else {
                    const address = hexToByte(s)
                    result = address !== null && address.length == 20 ? "0x" + byteToHex(address) : null
                }
            }
        } else {
            result = null
        }

        return result
    }

    public static parseNodeId(s: string|undefined): number|null {
        let result: number|null

        if (s) {
            const n = parseInt(s)
            result =  isNaN(n) || n < 0 ? null : n
        } else {
            result = null
        }

        return result
    }
}