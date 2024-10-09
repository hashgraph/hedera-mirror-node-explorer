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

import {aliasToBase32, base32ToAlias, byteToHex, hexToByte} from "@/utils/B64Utils";

export class AccountAlias {

    public readonly bytes: Uint8Array

    //
    // Public
    //

    public static parse(a: string): AccountAlias | null {
        let bytes = base32ToAlias(a)
        if (bytes === null) {
            bytes = hexToByte(a)
        }
        return bytes !== null && bytes.length >= 32 ? new AccountAlias(bytes) : null
    }

    public toString(): string {
        return aliasToBase32(this.bytes)
    }

    public toHexString(): string {
        return byteToHex(this.bytes)
    }

    //
    // Private
    //

    private constructor(bytes: Uint8Array) {
        this.bytes = bytes
    }

}
