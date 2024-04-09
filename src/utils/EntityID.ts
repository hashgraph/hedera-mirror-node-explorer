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

import {byteToHex, hexToByte} from "./B64Utils";

export class EntityID {

    public readonly shard: number
    public readonly realm: number
    public readonly num: number
    public readonly checksum: string | null


    //
    // Public
    //

    public constructor(shard: number, realm: number, num: number, checksum: string | null) {
        this.shard = shard
        this.realm = realm
        this.num = num
        this.checksum = checksum
    }

    public static parse(s: string, autoComplete = false): EntityID | null {
        let result: EntityID | null

        const i1 = s.indexOf(".")
        const i2 = i1 != -1 ? s.indexOf(".", i1 + 1) : -1
        const i3 = i2 != -1 ? s.indexOf(".", i2 + 1) : -1
        if (i1 != -1 && i2 != -1 && i3 == -1) {
            const shardString = s.substring(0, i1)
            const realmString = s.substring(i1 + 1, i2)
            const numString = s.substring(i2 + 1)
            const shard = EntityID.parsePositiveInt(shardString)
            const realm = EntityID.parsePositiveInt(realmString)
            const num = EntityID.parsePositiveInt(numString)
            if (shard == null || realm == null || num == null) {
                result = null
            } else {
                result = new EntityID(shard, realm, num, null)
            }
        } else if (i1 === -1 && i2 === -1 && autoComplete) {
            const num = EntityID.parsePositiveInt(s)
            if (num == null) {
                result = null
            } else {
                result = new EntityID(0, 0, num, null)
            }
        } else {
            result = null
        }
        return result
    }

    public static parseWithChecksum(s: string, autoComplete = false): EntityID | null {
        let result: EntityID | null

        const i = s.indexOf("-")
        if (i != -1) {
            const id = s.substring(0, i)
            const checksum = s.substring(i + 1)
            const entityId = EntityID.parse(id, autoComplete)
            if (entityId !== null && hasChecksumSyntax(checksum)) {
                result = new EntityID(entityId.shard, entityId.realm, entityId.num, checksum)
            } else {
                result = null
            }
        } else {
            result = EntityID.parse(s, autoComplete)
        }

        return result
    }

    public static normalize(s: string): string | null {
        const id = EntityID.parse(s, true)
        return id !== null ? id.toString() : null
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

    public static fromAddress(address: string | undefined): EntityID | null {
        let result: EntityID | null

        if (address) {
            const buffer = hexToByte(address)
            if (buffer !== null && buffer.length == 20) {
                const view = new DataView(buffer.buffer)
                const bigNum = view.getBigInt64(12)
                const num = 0 <= bigNum && bigNum < EntityID.MAX_INT ? Number(bigNum) : null
                result = num != null ? new EntityID(0, 0, num, null) : null
            } else {
                result = null
            }
        } else {
            result = null
        }

        return result
    }

    public isEthereumPrecompiledContract(): boolean {
        return this.shard == 0 && this.realm == 0 && 1 <= this.num && this.num < 256
    }

    public cloneWithoutChecksum(): EntityID {
        let result: EntityID
        if (this.checksum !== null) {
            result = new EntityID(this.shard, this.realm, this.num, null)
        } else {
            result = this
        }
        return result
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
            if ((this.num < 100 || this.num === 800) && (that.num >= 100 && that.num !== 800)) {
                // We put this.num at the end
                result = +1
            } else if ((that.num < 100 || that.num === 800) && (this.num >= 100 && this.num != 800)) {
                // We put that.num at the end
                result = -1
            } else {
                result = compareNumber(this.num, that.num)
            }
        }
        return result
    }

    // Utility

    public static readonly MAX_INT = Math.pow(2, 32) // Max supported by mirror node rest api on May 30, 2022

    public static parsePositiveInt(s: string): number | null {
        const n = s.match(/^[0-9]+$/) !== null ? parseInt(s) : EntityID.MAX_INT
        return (isNaN(n) || n >= EntityID.MAX_INT) ? null : n
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

function hasChecksumSyntax(s: string): boolean {
    const re = /[a-z]+/
    return s.length == 5 && re.test(s)
}
