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

    public static normalize(s: string): string {
        const id = EntityID.parse(s, true)
        return id !== null ? id.toString() : s
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

    public isOperator(): boolean {
        return this.shard == 0 && this.realm == 0 && this.num < 100
    }

    public static isOperator(entityID: string): boolean {
        const eid = EntityID.parse(entityID)
        return eid !== null && eid.isOperator()
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
        const n = Number(s)
        return (isNaN(n) || Math.floor(n) != n || n < 0 || n >= EntityID.MAX_INT) ? null : n
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
