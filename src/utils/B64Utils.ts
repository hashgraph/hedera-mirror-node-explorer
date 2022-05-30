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


import base32Decode from "base32-decode";
import base32Encode from "base32-encode";

//
// https://developer.mozilla.org/en-US/docs/Glossary/Base64
//

export function base64DecToArr (sBase64: string, nBlocksSize: number|undefined = undefined): Uint8Array {

    const sB64Enc = sBase64.replace(/[^A-Za-z0-9+/]/g, "")
    const nInLen = sB64Enc.length
    const nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2
    const taBytes = new Uint8Array(nOutLen)

    for (let nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx += 1) {
        nMod4 = nInIdx & 3;
        nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 6 * (3 - nMod4);
        if (nMod4 === 3 || nInLen - nInIdx === 1) {
            for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
                taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
            }
            nUint24 = 0;
        }
    }

    return taBytes;
}

export function b64ToUint6 (nChr: number): number {

  return nChr > 64 && nChr < 91 ?
      nChr - 65
    : nChr > 96 && nChr < 123 ?
      nChr - 71
    : nChr > 47 && nChr < 58 ?
      nChr + 4
    : nChr === 43 ?
      62
    : nChr === 47 ?
      63
    :
      0;

}


//
// Hexa conversion
//

export function byteToHex(bytes: Uint8Array): string {
    let result = ""
    for (let i = 0; i < bytes.length; i += 1) {
        const b = bytes[i]
        const h = ('0' + b.toString(16)).slice(-2)
        result += h
    }
    return result
}

const HEXSET = "0123456789ABCDEF"

export function hexToByte(hex: string): Uint8Array|null {
    let result: Uint8Array|null
    if (hex.length % 2 == 0) {
        const startIndex = hex.startsWith("0x") ? 1 : 0
        const bytes = Array<number>()
        let ok = true
        for (let i = startIndex, endIndex = hex.length / 2; i < endIndex && ok; i += 1) {
            const b1 = hex[2*i].toUpperCase()
            const b0 = hex[2*i+1].toUpperCase()
            const okB1 = HEXSET.indexOf(b1) != -1
            const okB0 = HEXSET.indexOf(b0) != -1
            if (okB0 && okB1) {
                const b = Number.parseInt(b1 + b0, 16)
                bytes.push(b)
            } else {
                ok = false
            }
        }
        result = ok ? new Uint8Array(bytes) : null
    } else {
        result = null
    }
    return result
}

//
// Alias conversion
//

export function aliasToBase32(bytes: Uint8Array): string {
    return base32Encode(bytes, 'RFC4648', { padding: false })
}

export function base32ToAlias(aliasBase32: string): Uint8Array {
    return new Uint8Array(base32Decode(aliasBase32, 'RFC4648'))
}
