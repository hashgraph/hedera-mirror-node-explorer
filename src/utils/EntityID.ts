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

import {byteToHex} from "./B64Utils";
import router from "@/router";
import {NetworkRegistry} from "@/schemas/NetworkRegistry";

export class EntityID {

    public readonly shard: number
    public readonly realm: number
    public readonly num: number


    //
    // Public
    //

    public static parse(s: string, autoComplete = false): EntityID|null {
        let result: EntityID|null

        const i1 = s.indexOf(".")
        const i2 = i1 != -1 ? s.indexOf(".", i1+1) : -1
        const i3 = i2 != -1 ? s.indexOf(".", i2+1) : -1
        if (i1 != -1 && i2 != -1 && i3 == -1) {
            const shardString = s.substring(0, i1)
            const realmString = s.substring(i1+1, i2)
            const numString   = s.substring(i2+1)
            const shard = EntityID.parsePositiveInt(shardString)
            const realm = EntityID.parsePositiveInt(realmString)
            const num   = EntityID.parsePositiveInt(numString)
            if (shard == null || realm == null || num == null) {
                result = null
            } else {
                result = new EntityID(shard, realm, num)
            }
        } else if (i1 === -1 && i2 === -1 && autoComplete) {
            const num = EntityID.parsePositiveInt(s)
            if (num == null) {
                result = null
            } else {
                result = new EntityID(0, 0, num)
            }
        } else {
            result = null
        }
        return result
    }

    public static normalize(s: string): string|null {
        const id = EntityID.parse(s, true)
        return id !== null ? id.toString() : null
    }

    public static isValid(id: string, checksum: string | null = null): boolean {
        const entityID = EntityID.parse(id, true)
        return (entityID != null) && (checksum === null || entityID.isValidChecksum(checksum))
    }

    public isValidChecksum(checksum: string): boolean {
        return this.makeChecksum() == checksum
    }

    public makeChecksum(): string {
        const ledger = router.currentRoute.value.params.network
        const ledgerId = (ledger === NetworkRegistry.MAIN_NETWORK) ? 0
            : (ledger === NetworkRegistry.TEST_NETWORK) ? 1 : 2

        return checksum(ledgerId, this.toString())
    }

    public toString(): string {
        return this.shard + "." + this.realm + "." + this.num
    }

    public toAddress(): string {
        const buffer = new Uint8Array(20);
        const view = new DataView(buffer.buffer, 0, 20);

        view.setInt32(0, this.shard);
        view.setBigInt64(4, BigInt(this.realm));
        view.setBigInt64(12, BigInt(this.num));

        return byteToHex(buffer)
    }

    /*
     * Compare two account ID.
     * Accounts are sorted in ascending but account ids < 100 are put at the end.
     */
    public compareAccountID(that: EntityID): number {
        let result = compareNumber(this.shard, that.shard)
        if (result == 0) {
            result = compareNumber(this.realm, that.realm)
        }
        if (result == 0) {
            if (this.num < 100 && that.num >= 100) {
                // We put this.num at the end
                result = +1
            } else if (that.num < 100 && this.num >= 100) {
                // We put that.num at the end
                result = -1
            } else {
                result = compareNumber(this.num, that.num)
            }
        }
        return result
    }

    // Utility

    private static readonly MAX_INT = Math.pow(2, 32) // Max supported by mirror node rest api on May 30, 2022

    public static parsePositiveInt(s: string): number|null {
        const n = s.length >= 1 ? Number(s) : -1
        return (isNaN(n) || Math.floor(n) != n || n < 0 || n >= EntityID.MAX_INT) ? null : n
    }

    public static stripChecksum(address: string): string {
        const dash = address.indexOf('-')
        return dash != -1 ? address.substring(0, dash) : address
    }

    public static extractChecksum(address: string): string | null {
        const dash = address.indexOf('-')
        return dash != -1 ? address.substring(dash + 1) : null
    }

    //
    // Private
    //

    private constructor(shard: number, realm: number, num: number) {
        this.shard = shard
        this.realm = realm
        this.num = num
    }
}


function compareNumber(n1: number, n2: number): number {
    let result: number
    if (n1 < n2) {
        result = -1
    } else if (n1 > n2) {
        result = +1
    } else {
        result = 0
    }
    return result
}

//
// From https://github.com/hashgraph/hedera-improvement-proposal/blob/master/assets/hip-15/HIP-15-javascript.html
//
// Given a ledger ID and an address like "0.0.123", return a checksum like "vfmkw" . The address must be in no-checksum
// format, with no extra characters (so not "0.0.00123" or "==0.0.123==" or "0.0.123-vfmkw"). The algorithm is defined
// by the HIP-15 standard to be:
//
// a = a valid no-checksum address string, such as 0.0.123
// d = int array for the digits of a (using 10 to represent "."), so 0.0.123 is [0,10,0,10,1,2,3]
// h = unsigned byte array containing the ledger ID followed by 6 zero bytes
// p3 = 26 * 26 * 26
// p5 = 26 * 26 * 26 * 26 * 26
// sd0 = (d[0] + d[2] + d[4] + d[6] + ...) mod 11
// sd1 = (d[1] + d[3] + d[5] + d[7] + ...) mod 11
// sd = (...((((d[0] * 31) + d[1]) * 31) + d[2]) * 31 + ... ) * 31 + d[d.length-1]) mod p3
// sh = (...(((h[0] * 31) + h[1]) * 31) + h[2]) * 31 + ... ) * 31 + h[h.length-1]) mod p5
// c = (((d.length mod 5) * 11 + sd0) * 11 + sd1) * p3 + sd + sh ) mod p5
// cp = (c * 1000003) mod p5
// checksum = cp, written as 5 digits in base 26, using a-z
//
//in ports to other languages, answer can be a string, digits an int32[] and the rest int32 (or uint32[] and uint32)

function checksum(ledgerId: number, addr: string) {
    let answer = "";
    const d = [];      //digits with 10 for ".", so if addr == "0.0.123" then d == [0, 10, 0, 10, 1, 2, 3] *** FIX ***
    let sd0 = 0;      //sum of even positions (mod 11)
    let sd1 = 0;      //sum of odd positions (mod 11)
    let sd = 0;       //weighted sum of all positions (mod p3)
    let sh = 0;      //hash of the ledger ID
    let cp: number;       //the checksum, as a single number
    const p3 = 26 * 26 * 26;           //3 digits in base 26
    const p5 = 26 * 26 * 26 * 26 * 26; //5 digits in base 26
    const ascii_a = "a".charCodeAt(0);  //97  *** FIX ***
    const m = 1_000_003; //min prime greater than a million. Used for the final permutation.
    const w = 31; //sum s of digit values weights them by powers of w. Should be coprime to p5.

    let id = ledgerId + "000000000000";
    const h = []; // *** FIX ***
    if (id.length % 2 == 1) id = "0" + id;
    for (let i=0; i<id.length; i+=2) {  // *** FIX ***
        h.push(parseInt(id.substr(i,2),16));
    }
    for (let i = 0; i < addr.length; i++) {
        d.push(addr[i]=="." ? 10 : parseInt(addr[i],10));
    }
    for (let i=0; i<d.length; i++) {
        sd = (w * sd + d[i]) % p3;
        if (i % 2 == 0) {
            sd0 = (sd0 + d[i]) % 11;
        } else {
            sd1 = (sd1 + d[i]) % 11;
        }
    }
    for (let i=0; i<h.length; i++) {
        sh = (w * sh + h[i]) % p5;
    }
    const c = ((((addr.length % 5) * 11 + sd0) * 11 + sd1) * p3 + sd + sh) % p5;  //the checksum, before the final permutation
    cp = (c * m) % p5;

    for (let i=0; i<5; i++) {
        answer = String.fromCharCode(ascii_a + (cp % 26)) + answer;
        cp /= 26;
    }

    return answer;
}