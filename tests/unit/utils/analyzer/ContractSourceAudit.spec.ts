// noinspection DuplicatedCode

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

import {describe, expect, test} from 'vitest'
import {readFileSync} from "fs";
import {SolcMetadata} from "../../../../src/utils/solc/SolcMetadata";
import {
    ContractAuditItemStatus,
    ContractAuditStatus,
    ContractSourceAudit
} from "../../../../src/utils/analyzer/ContractSourceAudit";

describe("ContractSourceAudit.spec.ts", () => {

    test("test1", async () => {

        const files = new Map<string, string|SolcMetadata>( [
            ["metadata.json",           jsonContentOfFile("HTS_meta.json") as SolcMetadata],
            ["HederaResponseCodes.sol", contentOfFile("HederaResponseCodes.sol")],
            ["HederaTokenService.sol",  contentOfFile("HederaTokenService.sol")],
            ["HTSv2.sol",               contentOfFile("HTSv2.sol")],
            ["IHederaTokenService.sol", contentOfFile("IHederaTokenService.sol")],
            ["Unused.sol",              contentOfFile("Unused.sol")],
        ])

        const solcVersion = "0.8.17"

        const deployedByteCode = contentOfFile("HTS_runtime_bytecode.bin")

        const audit = await ContractSourceAudit.build(files, solcVersion, deployedByteCode)
        expect(audit.status).toBe(ContractAuditStatus.Resolved)
        expect(audit.items.length).toBe(6)
        expect(audit.longCompilerVersion).toBe("0.8.17+commit.8df45f5f")
        expect(audit.resolvedContractName).toBe("HTS")
        expect(audit.resolvedMetadata).toStrictEqual(jsonContentOfFile("HTS_meta.json"))

        const i0 = audit.items[0]
        expect(i0.path).toBe("metadata.json")
        expect(i0.content).toStrictEqual(jsonContentOfFile("HTS_meta.json"))
        expect(i0.status).toBe(ContractAuditItemStatus.OK)
        expect(i0.target).toBe(true)

        const i1 = audit.items[1]
        expect(i1.path).toBe("HederaResponseCodes.sol")
        expect(i1.content).toStrictEqual(contentOfFile("HederaResponseCodes.sol"))
        expect(i1.status).toBe(ContractAuditItemStatus.OK)
        expect(i1.target).toBe(false)

        const i2 = audit.items[2]
        expect(i2.path).toBe("HederaTokenService.sol")
        expect(i2.content).toStrictEqual(contentOfFile("HederaTokenService.sol"))
        expect(i2.status).toBe(ContractAuditItemStatus.OK)
        expect(i2.target).toBe(false)

        const i3 = audit.items[3]
        expect(i3.path).toBe("HTSv2.sol")
        expect(i3.content).toStrictEqual(contentOfFile("HTSv2.sol"))
        expect(i3.status).toBe(ContractAuditItemStatus.OK)
        expect(i3.target).toBe(true)

        const i4 = audit.items[4]
        expect(i4.path).toBe("IHederaTokenService.sol")
        expect(i4.content).toStrictEqual(contentOfFile("IHederaTokenService.sol"))
        expect(i4.status).toBe(ContractAuditItemStatus.OK)
        expect(i4.target).toBe(false)

        const i5 = audit.items[5]
        expect(i5.path).toBe("Unused.sol")
        expect(i5.content).toStrictEqual(contentOfFile("Unused.sol"))
        expect(i5.status).toBe(ContractAuditItemStatus.Unused)
        expect(i5.target).toBe(false)

    })
})

function contentOfFile(fileName: string): string {
    return readFileSync(__dirname + "/../solc/hts/" + fileName).toString()
}

function jsonContentOfFile(fileName: string): unknown {
    return JSON.parse(contentOfFile(fileName))
}
