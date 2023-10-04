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

import {
    base64DecToArr,
    base64EncArr,
    byteToHex,
    hexToByte,
} from "@/utils/B64Utils";

export class TransactionHash {
    public readonly bytes: Uint8Array;

    //
    // Public
    //

    public static parse(byteString: string): TransactionHash | null {
        const bytes = hexToByte(byteString);
        return bytes !== null && bytes.length == 48
            ? new TransactionHash(bytes)
            : null;
    }

    public static parseBase64(base64: string): TransactionHash | null {
        const bytes = base64DecToArr(base64);
        return bytes !== null && bytes.length == 48
            ? new TransactionHash(bytes)
            : null;
    }

    public toString(): string {
        return byteToHex(this.bytes);
    }

    public toBase64(): string {
        return base64EncArr(this.bytes);
    }

    //
    // Private
    //

    private constructor(bytes: Uint8Array) {
        this.bytes = bytes;
    }
}
