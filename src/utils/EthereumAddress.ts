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

import {byteToHex, hexToByte} from "@/utils/B64Utils";
import {EntityID} from "@/utils/EntityID";
import web3Utils  from "web3-utils";

export class EthereumAddress {

    public readonly bytes: Uint8Array

    //
    // Public
    //

    public static parse(byteString: string): EthereumAddress|null {
        const bytes = hexToByte(byteString)
        return bytes !== null && bytes.length == 20 ? new EthereumAddress(bytes) : null
    }

    public static normalizeEIP55(byteString: string): string {
        // https://eips.ethereum.org/EIPS/eip-55
        // https://web3js.readthedocs.io/en/v1.2.11/web3-utils.html#tochecksumaddress
        return web3Utils.toChecksumAddress(byteString)
    }

    public toString(): string {
        return "0x" + byteToHex(this.bytes)
    }

    public toCompactString(digitKept=6): string {
       return "0x"
           + byteToHex(this.bytes.slice(0, 1))
           + "…" + byteToHex(this.bytes.slice(-digitKept/2))
    }

    public toEntityID(): EntityID|null {
        let result: EntityID | null
        if (this.isLongZeroForm()) {
            const view = new DataView(this.bytes.buffer)
            const bigNum = view.getBigInt64(12)
            const num = 0 <= bigNum && bigNum < EntityID.MAX_INT ? Number(bigNum) : null
            result = num != null ? new EntityID(0, 0, num) : null
        } else {
            result = null
        }
        return result
    }

    public isLongZeroForm(): boolean {
        return this.bytes.slice(0,12).every((value) => value === 0)
    }

    //
    // Private
    //

    private constructor(bytes: Uint8Array) {
        this.bytes = bytes
    }
}
