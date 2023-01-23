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

import hashgraph from "@hashgraph/proto/lib/proto";
import {byteToHex} from "@/utils/B64Utils";
import IContractID = hashgraph.proto.IContractID;
import {EntityID} from "@/utils/EntityID";

export class ComplexKeyLine {

    public readonly key: hashgraph.proto.Key
    public readonly level: number
    public readonly seqNb: number

    private static nextSeqNb = 0

    //
    // Public
    //

    public constructor(key: hashgraph.proto.Key, level: number) {
        this.key = key
        this.level = level
        this.seqNb = ComplexKeyLine.nextSeqNb
        ComplexKeyLine.nextSeqNb += 1
    }

    public static flattenComplexKey(key: hashgraph.proto.Key): ComplexKeyLine[] {
        const result: ComplexKeyLine[] = []
        this.flattenComplexKeyRec(key, 0, result)
        return result
    }

    public innerKeyBytes(): string | null {
        const bytes = this.key.ed25519 ?? this.key.ECDSASecp256k1 ?? this.key.ECDSA_384 ?? this.key.RSA_3072 ?? null
        return bytes !== null ? byteToHex(bytes) : null
    }

    public innerKeyType(): string | null {
        let result: string|null
        if (this.key.ed25519) {
            result = "ED25519"
        } else if (this.key.ECDSASecp256k1) {
            result = "ECDSA"
        } else if (this.key.RSA_3072) {
            result = "RSA_3072"
        } else if (this.key.ECDSA_384) {
            result = "ECDSA_384"
        } else {
            result = null
        }
        return result
    }

    public contractId(): string|null {
        return this.key.contractID ? ComplexKeyLine.makeContractId(this.key.contractID) : null
    }

    public delegatableContractId(): string|null {
        return this.key.delegatableContractId ? ComplexKeyLine.makeContractId(this.key.delegatableContractId) : null
    }

    public toString(): string {
        return "" + this.level + " " + this.key.key
    }

    public static dump(lines: ComplexKeyLine[]): string {
        let result = ""
        for (const l of lines) {
            result += l.toString() + "\n"
        }
        return result
    }

    //
    // Private
    //

    private static flattenComplexKeyRec(key: hashgraph.proto.Key, level: number, result: ComplexKeyLine[]): void {

        let newLine: ComplexKeyLine
        let childKeys: hashgraph.proto.Key[]
        if (key.keyList) {
            if (key.keyList.keys && key.keyList.keys.length == 1) {
                // Collapses singleton KeyList
                newLine = new ComplexKeyLine(key.keyList.keys[0], level)
                childKeys = []
            } else {
                newLine = new ComplexKeyLine(key, level)
                childKeys = key.keyList?.keys ?? []
            }
            // newLine = new ComplexKeyLine(key, level)
            // childKeys = key.keyList?.keys ?? []
        } else if (key.thresholdKey) {
            newLine = new ComplexKeyLine(key, level)
            childKeys = key.thresholdKey?.keys?.keys ?? []
        } else {
            newLine = new ComplexKeyLine(key, level)
            childKeys = []
        }
        result.push(newLine)

        for (const childKey of childKeys) {
            this.flattenComplexKeyRec(childKey, level + 1, result)
        }
    }

    private static makeContractId(iContractID: IContractID): string {
        const shard = Number(iContractID.shardNum ?? 0)
        const realm = Number(iContractID.realmNum ?? 0)
        const num = Number(iContractID.contractNum ?? 0)
        const entityId = new EntityID(shard, realm, num)
        return entityId.toString()
    }
}
