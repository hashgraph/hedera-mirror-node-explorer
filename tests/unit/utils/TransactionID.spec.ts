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

import { describe, test, expect } from "vitest";
import { normalizeTransactionId, TransactionID } from "@/utils/TransactionID";

describe("TransactionID.ts", () => {
    //
    // TransactionID.parse()
    //

    test("0.0.88-1640084590-665216882", () => {
        const str = "0.0.88-1640084590-665216882";
        const obj = TransactionID.parse(str);
        expect(obj?.entityID.shard).toBe(0);
        expect(obj?.entityID.realm).toBe(0);
        expect(obj?.entityID.num).toBe(88);
        expect(obj?.seconds).toBe(1640084590);
        expect(obj?.nanoSeconds).toBe(665216882);
        expect(obj?.toString(false)).toBe(str);
    });

    test("0.0.88@1640084590.665216882", () => {
        const str = "0.0.88@1640084590.665216882";
        const obj = TransactionID.parse(str);
        expect(obj?.entityID.shard).toBe(0);
        expect(obj?.entityID.realm).toBe(0);
        expect(obj?.entityID.num).toBe(88);
        expect(obj?.seconds).toBe(1640084590);
        expect(obj?.nanoSeconds).toBe(665216882);
        expect(obj?.toString(true)).toBe(str);
    });

    test("00881640084590665216882", () => {
        const obj = TransactionID.parse("00881640084590665216882");
        expect(obj?.entityID.shard).toBe(0);
        expect(obj?.entityID.realm).toBe(0);
        expect(obj?.entityID.num).toBe(88);
        expect(obj?.seconds).toBe(1640084590);
        expect(obj?.nanoSeconds).toBe(665216882);
        expect(obj?.toString(true)).toBe("0.0.88@1640084590.665216882");
    });

    test("invalid ids", () => {
        expect(TransactionID.parse("abc")).toBeNull();
        expect(TransactionID.parse("0.0.88-abc")).toBeNull();
        expect(TransactionID.parse("0.0.88-12-abc")).toBeNull();
        expect(TransactionID.parse("0.0.88-12-12-13")).toBeNull();
        expect(TransactionID.parse("0.0.88@abc")).toBeNull();
        expect(TransactionID.parse("0.0.88@12.abc")).toBeNull();
        expect(TransactionID.parse("0.0.88@12.12.14")).toBeNull();
        expect(TransactionID.parse("001640084590665216882")).toBeNull();
        expect(TransactionID.parse("11881640084590665216882")).toBeNull();
    });

    //
    // TransactionID.normalizeTransactionId()
    //

    test("normalize", () => {
        const str1 = "0.0.88-1640084590-665216882";
        const str2 = "0.0.88@1640084590.665216882";
        expect(normalizeTransactionId(str1, true)).toBe(str2);
        expect(normalizeTransactionId(str2, false)).toBe(str1);
        expect(normalizeTransactionId(str1, false)).toBe(str1);
        expect(normalizeTransactionId(str2, true)).toBe(str2);
    });
});
