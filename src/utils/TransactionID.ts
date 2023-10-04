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

import { EntityID } from "./EntityID";

export class TransactionID {
    public readonly entityID: EntityID;
    public readonly seconds: number;
    public readonly nanoSeconds: number;

    //
    // Public
    //

    public static parse(value: string): TransactionID | null {
        // 0.0.88-1640084590-665216882                      useArobas == false
        // 0.0.88@1640084590.665216882                      useArobas == true
        // 00881640084590665216882

        let result: TransactionID | null;

        const useArobas = value.indexOf("@") >= 0;
        const sep1 = useArobas ? "@" : "-";
        const sep2 = useArobas ? "." : "-";
        const i1 = value.indexOf(sep1);
        const i2 = i1 != -1 ? value.indexOf(sep2, i1 + 1) : -1;

        if (i1 != -1 && i2 != -1) {
            const s0 = value.substring(0, i1);
            const s1 = value.substring(i1 + 1, i2);
            const s2 = value.substring(i2 + 1);
            const v0 = EntityID.parse(s0);
            const v1 = EntityID.parsePositiveInt(s1);
            const v2 = EntityID.parsePositiveInt(s2);
            if (v0 == null || v1 == null || v2 == null) {
                result = null;
            } else {
                result = new TransactionID(v0, v1, v2);
            }
        } else if (i1 == -1 && i2 == -1) {
            // 00881640084590665216882
            // 0088 1640084590 665216882
            const i2 = value.length - 9;
            const i1 = i2 - 10;
            if (i1 >= 3) {
                const s0 = value.substring(0, i1);
                const s1 = value.substring(i1, i2);
                const s2 = value.substring(i2);
                if (s0.startsWith("00")) {
                    const v0 = EntityID.parse("0.0." + s0.substring(2));
                    const v1 = EntityID.parsePositiveInt(s1);
                    const v2 = EntityID.parsePositiveInt(s2);
                    if (v0 == null || v1 == null || v2 == null) {
                        result = null;
                    } else {
                        result = new TransactionID(v0, v1, v2);
                    }
                } else {
                    result = null;
                }
            } else {
                result = null;
            }
        } else {
            result = null;
        }

        return result;
    }

    public toString(useArobas = true): string {
        const sep1 = useArobas ? "@" : "-";
        const sep2 = useArobas ? "." : "-";
        return (
            this.entityID.toString() +
            sep1 +
            this.seconds +
            sep2 +
            this.nanoSeconds.toString().padStart(9, "0")
        );
    }

    public static normalize(transactionID: string, useArobas = true): string {
        const tid = TransactionID.parse(transactionID);
        return tid != null ? tid.toString(useArobas) : transactionID;
    }

    public static makePayerID(transactionID: string): string | null {
        const tid = TransactionID.parse(transactionID);
        return tid != null ? tid.entityID.toString() : null;
    }

    //
    // Private
    //

    private constructor(
        entityID: EntityID,
        seconds: number,
        nanoSeconds: number,
    ) {
        this.entityID = entityID;
        this.seconds = seconds;
        this.nanoSeconds = nanoSeconds;
    }
}

export function normalizeTransactionId(
    value: string,
    useArobas = false,
): string {
    const tid = TransactionID.parse(value);
    return tid != null ? tid.toString(useArobas) : value;
}
