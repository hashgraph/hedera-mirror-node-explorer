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


import base32Decode from "base32-decode";
import base32Encode from "base32-encode";
import {ethers} from "ethers";

//
// https://developer.mozilla.org/en-US/docs/Glossary/Base64
//

export function base64DecToArr(sBase64: string, nBlocksSize: number | undefined = undefined): Uint8Array {

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

export function b64ToUint6(nChr: number): number {

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


export function base64EncArr(aBytes: Uint8Array): string {
    let nMod3 = 2;
    let sB64Enc = "";

    const nLen = aBytes.length;
    let nUint24 = 0;
    for (let nIdx = 0; nIdx < nLen; nIdx++) {
        nMod3 = nIdx % 3;
        if (nIdx > 0 && ((nIdx * 4) / 3) % 76 === 0) {
            sB64Enc += "\r\n";
        }

        nUint24 |= aBytes[nIdx] << ((16 >>> nMod3) & 24);
        if (nMod3 === 2 || aBytes.length - nIdx === 1) {
            sB64Enc += String.fromCodePoint(
                uint6ToB64((nUint24 >>> 18) & 63),
                uint6ToB64((nUint24 >>> 12) & 63),
                uint6ToB64((nUint24 >>> 6) & 63),
                uint6ToB64(nUint24 & 63)
            );
            nUint24 = 0;
        }
    }
    return (
        sB64Enc.substr(0, sB64Enc.length - 2 + nMod3) +
        (nMod3 === 2 ? "" : nMod3 === 1 ? "=" : "==")
    );
}

function uint6ToB64(nUint6: number) {
    return nUint6 < 26
        ? nUint6 + 65
        : nUint6 < 52
            ? nUint6 + 71
            : nUint6 < 62
                ? nUint6 - 4
                : nUint6 === 62
                    ? 43
                    : nUint6 === 63
                        ? 47
                        : 65;
}


//
// Hexa conversion
//

export function byteToHex(bytes: Uint8Array): string {
    return ethers.hexlify(bytes).slice(2)
}

export function paddedBytes(bytes: Uint8Array, length: number): Uint8Array {
    const result = new Uint8Array(length)
    const paddingLength = Math.max(0, length - bytes.length)
    result.set(bytes, paddingLength)
    return result
}

export function hexToByte(hex: string): Uint8Array | null {
    let result: Uint8Array | null
    try {
        hex = hex.startsWith("0x") ? hex : "0x" + hex
        result = ethers.getBytes(hex)
    } catch {
        result = null
    }
    return result
}

//
// Alias conversion
//

export function aliasToBase32(bytes: Uint8Array): string {
    return base32Encode(bytes, 'RFC4648', {padding: false})
}

export function base32ToAlias(aliasBase32: string): Uint8Array | null {
    let result: Uint8Array | null
    try {
        result = new Uint8Array(base32Decode(aliasBase32, 'RFC4648'))
    } catch {
        result = null
    }
    return result
}
