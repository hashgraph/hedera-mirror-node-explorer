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
import {SolcUtils} from "@/utils/solc/SolcUtils";

describe("SolcLauncher", () => {

    test("HelloWorld", async () => {

        const input = {
            "language":"Solidity",
            "sources":{
                "HelloWorld.sol":{
                    "content": contentOfFile("hello_world/HelloWorld.sol")
                }
            }
        }

        const output = {
            "errors": [
                {
                    "component": "general",
                    "errorCode": "1878",
                    "formattedMessage": "Warning: SPDX license identifier not provided in source file. Before publishing, consider adding a comment containing \"SPDX-License-Identifier: <SPDX-License>\" to each source file. Use \"SPDX-License-Identifier: UNLICENSED\" for non-open-source code. Please see https://spdx.org for more information.\n--> HelloWorld.sol\n\n",
                    "message": "SPDX license identifier not provided in source file. Before publishing, consider adding a comment containing \"SPDX-License-Identifier: <SPDX-License>\" to each source file. Use \"SPDX-License-Identifier: UNLICENSED\" for non-open-source code. Please see https://spdx.org for more information.",
                    "severity": "warning",
                    "sourceLocation": {
                        "end": -1,
                        "file": "HelloWorld.sol",
                        "start": -1
                    },
                    "type": "Warning"
                }
            ],
            "sources": {
                "HelloWorld.sol": {
                    "id": 0
                }
            }
        }

        const generatedOutput2 = await SolcUtils.runAsWorker("v0.8.17+commit.8df45f5f", input)
        expect(generatedOutput2).toStrictEqual(output)

    }, 20000)

    test("HTS", async () => {

        const input = {
            "language":"Solidity",
            "sources":{
                "HTSv2.sol": {
                    "content": contentOfFile("hts/HTSv2.sol")
                },
                "HederaResponseCodes.sol": {
                    "content": contentOfFile("hts/HederaResponseCodes.sol")
                },
                "HederaTokenService.sol": {
                    "content": contentOfFile("hts/HederaTokenService.sol")
                },
                "IHederaTokenService.sol": {
                    "content": contentOfFile("hts/IHederaTokenService.sol")
                }
            }
        }

        const output = {
            "sources":{
                "HTSv2.sol":{"id":0},
                "HederaResponseCodes.sol":{"id":1},
                "HederaTokenService.sol":{"id":2},
                "IHederaTokenService.sol":{"id":3}
            }
        }

        const generatedOutput2 = await SolcUtils.runAsWorker("v0.8.17+commit.8df45f5f", input)
        expect(generatedOutput2).toStrictEqual(output)
    }, 20000)

    test("HTS (with missing file)", async () => {

        const input = {
            "language":"Solidity",
            "sources":{
                "HTSv2.sol": {
                    "content": contentOfFile("hts/HTSv2.sol")
                }
            }
        }

        const output = {
            "errors": [
                {
                    "component": "general",
                    "errorCode": "6275",
                    "formattedMessage": "ParserError: Source \"HederaTokenService.sol\" not found: File not found: HederaTokenService.sol\n --> HTSv2.sol:4:1:\n  |\n4 | import \"./HederaTokenService.sol\";\n  | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n\n",
                    "message": "Source \"HederaTokenService.sol\" not found: File not found: HederaTokenService.sol",
                    "severity": "error",
                    "sourceLocation": {
                        "end": 99,
                        "file": "HTSv2.sol",
                        "start": 65
                    },
                    "type": "ParserError"
                },
                {
                    "component": "general",
                    "errorCode": "6275",
                    "formattedMessage": "ParserError: Source \"HederaResponseCodes.sol\" not found: File not found: HederaResponseCodes.sol\n --> HTSv2.sol:5:1:\n  |\n5 | import \"./HederaResponseCodes.sol\";\n  | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n\n",
                    "message": "Source \"HederaResponseCodes.sol\" not found: File not found: HederaResponseCodes.sol",
                    "severity": "error",
                    "sourceLocation": {
                        "end": 135,
                        "file": "HTSv2.sol",
                        "start": 100
                    },
                    "type": "ParserError"
                }
            ],
            "sources": {}
        }

        const generatedOutput2 = await SolcUtils.runAsWorker("v0.8.17+commit.8df45f5f", input)
        expect(generatedOutput2).toStrictEqual(output)
        const missingFiles = SolcUtils.fetchMissingFiles(generatedOutput2)
        expect(missingFiles).toStrictEqual(["HederaTokenService.sol", "HederaResponseCodes.sol"])
    }, 20000)

    test("HTS (with unused file)", async () => {

        const input = {
            "language":"Solidity",
            "sources":{
                "HTSv2.sol": {
                    "content": contentOfFile("hts/HTSv2.sol")
                },
                "HederaResponseCodes.sol": {
                    "content": contentOfFile("hts/HederaResponseCodes.sol")
                },
                "HederaTokenService.sol": {
                    "content": contentOfFile("hts/HederaTokenService.sol")
                },
                "IHederaTokenService.sol": {
                    "content": contentOfFile("hts/IHederaTokenService.sol")
                },
                "Unused.sol":{
                    "content": contentOfFile("hts/Unused.sol")
                }
            }
        }

        const output = {
            "sources": {
                "HTSv2.sol": {
                    "id": 0
                },
                "HederaResponseCodes.sol": {
                    "id": 1
                },
                "HederaTokenService.sol": {
                    "id": 2
                },
                "IHederaTokenService.sol": {
                    "id": 3
                },
                "Unused.sol": {
                    "id": 4
                }
            }
        }


        const generatedOutput2 = await SolcUtils.runAsWorker("v0.8.17+commit.8df45f5f", input)
        expect(generatedOutput2).toStrictEqual(output)
    }, 20000)

    test("HTS (with obsolete compiler)", async () => {

        const input = {
            "language":"Solidity",
            "sources":{
                "HTSv2.sol": {
                    "content": contentOfFile("hts/HTSv2.sol")
                },
                "HederaResponseCodes.sol": {
                    "content": contentOfFile("hts/HederaResponseCodes.sol")
                },
                "HederaTokenService.sol": {
                    "content": contentOfFile("hts/HederaTokenService.sol")
                },
                "IHederaTokenService.sol": {
                    "content": contentOfFile("hts/IHederaTokenService.sol")
                },
                "Unused.sol":{
                    "content": contentOfFile("hts/Unused.sol")
                }
            }
        }

        const output = {
            "errors": [
                {
                    "component": "general",
                    "errorCode": "5333",
                    "formattedMessage": "HTSv2.sol:2:1: ParserError: Source file requires different compiler version (current compiler is 0.6.12+commit.27d51765.Emscripten.clang) - note that nightly builds are considered to be strictly less than the released version\npragma solidity ^0.8.17;\n^----------------------^\n",
                    "message": "Source file requires different compiler version (current compiler is 0.6.12+commit.27d51765.Emscripten.clang) - note that nightly builds are considered to be strictly less than the released version",
                    "severity": "error",
                    "sourceLocation": {
                        "end": 63,
                        "file": "HTSv2.sol",
                        "start": 39
                    },
                    "type": "ParserError"
                },
                {
                    "component": "general",
                    "errorCode": "2837",
                    "formattedMessage": "IHederaTokenService.sol:175:21: Warning: Only state variables can have a docstring. This will be disallowed in 0.7.0.\n        HederaToken token;\n                    ^---^\n",
                    "message": "Only state variables can have a docstring. This will be disallowed in 0.7.0.",
                    "severity": "warning",
                    "sourceLocation": {
                        "end": 8391,
                        "file": "IHederaTokenService.sol",
                        "start": 8386
                    },
                    "type": "Warning"
                },
                {
                    "component": "general",
                    "errorCode": "2837",
                    "formattedMessage": "IHederaTokenService.sol:178:15: Warning: Only state variables can have a docstring. This will be disallowed in 0.7.0.\n        int64 totalSupply;\n              ^---------^\n",
                    "message": "Only state variables can have a docstring. This will be disallowed in 0.7.0.",
                    "severity": "warning",
                    "sourceLocation": {
                        "end": 8502,
                        "file": "IHederaTokenService.sol",
                        "start": 8491
                    },
                    "type": "Warning"
                },
                {
                    "component": "general",
                    "errorCode": "2837",
                    "formattedMessage": "IHederaTokenService.sol:181:14: Warning: Only state variables can have a docstring. This will be disallowed in 0.7.0.\n        bool deleted;\n             ^-----^\n",
                    "message": "Only state variables can have a docstring. This will be disallowed in 0.7.0.",
                    "severity": "warning",
                    "sourceLocation": {
                        "end": 8583,
                        "file": "IHederaTokenService.sol",
                        "start": 8576
                    },
                    "type": "Warning"
                },
                {
                    "component": "general",
                    "errorCode": "2837",
                    "formattedMessage": "IHederaTokenService.sol:184:14: Warning: Only state variables can have a docstring. This will be disallowed in 0.7.0.\n        bool defaultKycStatus;\n             ^--------------^\n",
                    "message": "Only state variables can have a docstring. This will be disallowed in 0.7.0.",
                    "severity": "warning",
                    "sourceLocation": {
                        "end": 8721,
                        "file": "IHederaTokenService.sol",
                        "start": 8705
                    },
                    "type": "Warning"
                },
                {
                    "component": "general",
                    "errorCode": "2837",
                    "formattedMessage": "IHederaTokenService.sol:187:14: Warning: Only state variables can have a docstring. This will be disallowed in 0.7.0.\n        bool pauseStatus;\n             ^---------^\n",
                    "message": "Only state variables can have a docstring. This will be disallowed in 0.7.0.",
                    "severity": "warning",
                    "sourceLocation": {
                        "end": 8815,
                        "file": "IHederaTokenService.sol",
                        "start": 8804
                    },
                    "type": "Warning"
                },
                {
                    "component": "general",
                    "errorCode": "2837",
                    "formattedMessage": "IHederaTokenService.sol:190:20: Warning: Only state variables can have a docstring. This will be disallowed in 0.7.0.\n        FixedFee[] fixedFees;\n                   ^-------^\n",
                    "message": "Only state variables can have a docstring. This will be disallowed in 0.7.0.",
                    "severity": "warning",
                    "sourceLocation": {
                        "end": 8911,
                        "file": "IHederaTokenService.sol",
                        "start": 8902
                    },
                    "type": "Warning"
                },
                {
                    "component": "general",
                    "errorCode": "2837",
                    "formattedMessage": "IHederaTokenService.sol:193:25: Warning: Only state variables can have a docstring. This will be disallowed in 0.7.0.\n        FractionalFee[] fractionalFees;\n                        ^------------^\n",
                    "message": "Only state variables can have a docstring. This will be disallowed in 0.7.0.",
                    "severity": "warning",
                    "sourceLocation": {
                        "end": 9022,
                        "file": "IHederaTokenService.sol",
                        "start": 9008
                    },
                    "type": "Warning"
                },
                {
                    "component": "general",
                    "errorCode": "2837",
                    "formattedMessage": "IHederaTokenService.sol:196:22: Warning: Only state variables can have a docstring. This will be disallowed in 0.7.0.\n        RoyaltyFee[] royaltyFees;\n                     ^---------^\n",
                    "message": "Only state variables can have a docstring. This will be disallowed in 0.7.0.",
                    "severity": "warning",
                    "sourceLocation": {
                        "end": 9124,
                        "file": "IHederaTokenService.sol",
                        "start": 9113
                    },
                    "type": "Warning"
                },
                {
                    "component": "general",
                    "errorCode": "2837",
                    "formattedMessage": "IHederaTokenService.sol:199:16: Warning: Only state variables can have a docstring. This will be disallowed in 0.7.0.\n        string ledgerId;\n               ^------^\n",
                    "message": "Only state variables can have a docstring. This will be disallowed in 0.7.0.",
                    "severity": "warning",
                    "sourceLocation": {
                        "end": 9191,
                        "file": "IHederaTokenService.sol",
                        "start": 9183
                    },
                    "type": "Warning"
                },
                {
                    "component": "general",
                    "errorCode": "2837",
                    "formattedMessage": "IHederaTokenService.sol:205:19: Warning: Only state variables can have a docstring. This will be disallowed in 0.7.0.\n        TokenInfo tokenInfo;\n                  ^-------^\n",
                    "message": "Only state variables can have a docstring. This will be disallowed in 0.7.0.",
                    "severity": "warning",
                    "sourceLocation": {
                        "end": 9357,
                        "file": "IHederaTokenService.sol",
                        "start": 9348
                    },
                    "type": "Warning"
                },
                {
                    "component": "general",
                    "errorCode": "2837",
                    "formattedMessage": "IHederaTokenService.sol:208:15: Warning: Only state variables can have a docstring. This will be disallowed in 0.7.0.\n        int32 decimals;\n              ^------^\n",
                    "message": "Only state variables can have a docstring. This will be disallowed in 0.7.0.",
                    "severity": "warning",
                    "sourceLocation": {
                        "end": 9447,
                        "file": "IHederaTokenService.sol",
                        "start": 9439
                    },
                    "type": "Warning"
                },
                {
                    "component": "general",
                    "errorCode": "2837",
                    "formattedMessage": "IHederaTokenService.sol:214:19: Warning: Only state variables can have a docstring. This will be disallowed in 0.7.0.\n        TokenInfo tokenInfo;\n                  ^-------^\n",
                    "message": "Only state variables can have a docstring. This will be disallowed in 0.7.0.",
                    "severity": "warning",
                    "sourceLocation": {
                        "end": 9620,
                        "file": "IHederaTokenService.sol",
                        "start": 9611
                    },
                    "type": "Warning"
                },
                {
                    "component": "general",
                    "errorCode": "2837",
                    "formattedMessage": "IHederaTokenService.sol:217:15: Warning: Only state variables can have a docstring. This will be disallowed in 0.7.0.\n        int64 serialNumber;\n              ^----------^\n",
                    "message": "Only state variables can have a docstring. This will be disallowed in 0.7.0.",
                    "severity": "warning",
                    "sourceLocation": {
                        "end": 9690,
                        "file": "IHederaTokenService.sol",
                        "start": 9678
                    },
                    "type": "Warning"
                },
                {
                    "component": "general",
                    "errorCode": "2837",
                    "formattedMessage": "IHederaTokenService.sol:220:17: Warning: Only state variables can have a docstring. This will be disallowed in 0.7.0.\n        address ownerId;\n                ^-----^\n",
                    "message": "Only state variables can have a docstring. This will be disallowed in 0.7.0.",
                    "severity": "warning",
                    "sourceLocation": {
                        "end": 9790,
                        "file": "IHederaTokenService.sol",
                        "start": 9783
                    },
                    "type": "Warning"
                },
                {
                    "component": "general",
                    "errorCode": "2837",
                    "formattedMessage": "IHederaTokenService.sol:223:15: Warning: Only state variables can have a docstring. This will be disallowed in 0.7.0.\n        int64 creationTime;\n              ^----------^\n",
                    "message": "Only state variables can have a docstring. This will be disallowed in 0.7.0.",
                    "severity": "warning",
                    "sourceLocation": {
                        "end": 9880,
                        "file": "IHederaTokenService.sol",
                        "start": 9868
                    },
                    "type": "Warning"
                },
                {
                    "component": "general",
                    "errorCode": "2837",
                    "formattedMessage": "IHederaTokenService.sol:226:15: Warning: Only state variables can have a docstring. This will be disallowed in 0.7.0.\n        bytes metadata;\n              ^------^\n",
                    "message": "Only state variables can have a docstring. This will be disallowed in 0.7.0.",
                    "severity": "warning",
                    "sourceLocation": {
                        "end": 9948,
                        "file": "IHederaTokenService.sol",
                        "start": 9940
                    },
                    "type": "Warning"
                },
                {
                    "component": "general",
                    "errorCode": "2837",
                    "formattedMessage": "IHederaTokenService.sol:229:17: Warning: Only state variables can have a docstring. This will be disallowed in 0.7.0.\n        address spenderId;\n                ^-------^\n",
                    "message": "Only state variables can have a docstring. This will be disallowed in 0.7.0.",
                    "severity": "warning",
                    "sourceLocation": {
                        "end": 10080,
                        "file": "IHederaTokenService.sol",
                        "start": 10071
                    },
                    "type": "Warning"
                },
                {
                    "component": "general",
                    "errorCode": "5333",
                    "formattedMessage": "Unused.sol:2:1: ParserError: Source file requires different compiler version (current compiler is 0.6.12+commit.27d51765.Emscripten.clang) - note that nightly builds are considered to be strictly less than the released version\npragma solidity ^0.8.17;\n^----------------------^\n",
                    "message": "Source file requires different compiler version (current compiler is 0.6.12+commit.27d51765.Emscripten.clang) - note that nightly builds are considered to be strictly less than the released version",
                    "severity": "error",
                    "sourceLocation": {
                        "end": 63,
                        "file": "Unused.sol",
                        "start": 39
                    },
                    "type": "ParserError"
                }
            ],
            "sources": {}
        }


        const generatedOutput2 = await SolcUtils.runAsWorker("v0.6.12+commit.27d51765", input)
        expect(generatedOutput2).toStrictEqual(output)
    }, 20000)
})

function contentOfFile(fileName: string): string {
    return readFileSync(__dirname + "/" + fileName).toString()
}