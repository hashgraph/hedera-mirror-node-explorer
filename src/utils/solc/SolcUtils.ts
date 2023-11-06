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

import {SolcMetadata} from "@/utils/solc/SolcMetadata";
import {SolcInput} from "@/utils/solc/SolcInput";
import {ContractDescription, SolcOutput} from "@/utils/solc/SolcOutput";
import {splitAuxdata} from "@ethereum-sourcify/bytecode-utils";

export class SolcUtils {

    public static async runAsWorker(version: string, input: SolcInput): Promise<SolcReport> {
        const worker = new Worker(new URL("./SolcWorker.ts", import.meta.url), { type: "classic"})
        return new Promise<SolcReport>((resolve, reject) => {
            worker.onmessage = (message: MessageEvent) => {
                const workerOutput: SolcWorkerOutput = message.data
                if (workerOutput.error) {
                    reject(workerOutput.error)
                } else {
                    resolve(workerOutput.report!)
                }
                worker.terminate()
            }
            worker.postMessage({ version, input })
        })
    }

    public static countErrors(output: SolcOutput): number {
        let result = 0
        for (const e of output.errors ?? []) {
            if (e.severity == "error") {
                result += 1
            }
        }
        return result
    }

    public static fetchMissingFiles(output: SolcOutput): string[] {

        /*
               {
                    "component": "general",
                    "errorCode": "6275",
                    "formattedMessage": "ParserError: Source \"IHederaTokenService.sol\" not found: File not found: IHederaTokenService.sol\n --> HederaTokenService.sol:6:1:\n  |\n6 | import \"./IHederaTokenService.sol\";\n  | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n\n",
                    "message": "Source \"IHederaTokenService.sol\" not found: File not found: IHederaTokenService.sol",
                    "severity": "error",
                    "sourceLocation": {
                        "end": 177,
                        "file": "HederaTokenService.sol",
                        "start": 142
                    },
                    "type": "ParserError"
                }

         */

        const result: string[] = []
        if (output.errors) {
            const re = /.*: File not found: (.*)/i
            for (const e of output.errors) {
                const matches = re.exec(e.message)
                const fileName = matches && matches.length == 2 ? matches[1] : null
                if (fileName !== null) {
                    result.push(fileName)
                }
            }
        }
        return result
    }

    public static fetchCompilationTarget(metadata: SolcMetadata): string|null {
        let result: string|null
        const keys = Object.keys(metadata.settings.compilationTarget)
        if (keys.length >= 1 && typeof metadata.settings.compilationTarget[keys[0]] == "string") {
            result = metadata.settings.compilationTarget[keys[0]]
        } else {
            result = null
        }
        return result
    }

    public static fetchIPFSHash(sourceFileName: string, metadata: SolcMetadata): string|null {
        let result: string|null = null
        if (sourceFileName in metadata.sources) {
            const prefix = "dweb:/ipfs/"
            for (const url of metadata.sources[sourceFileName].urls ?? []) {
                if (url.startsWith(prefix)) {
                    result = url.slice(prefix.length)
                    break
                }
            }
        }
        return result
    }

    public static fetchSWARMHash(sourceFileName: string, metadata: SolcMetadata): string|null {
        let result: string|null = null
        if (sourceFileName in metadata.sources) {
            const prefix = "bzz-raw://"
            for (const url of metadata.sources[sourceFileName].urls ?? []) {
                if (url.startsWith(prefix)) {
                    result = url.slice(prefix.length)
                    break
                }
            }
        }
        return result
    }

    public static fetchKeccakHash(sourceFileName: string, metadata: SolcMetadata): string|null {
        let result: string|null
        if (sourceFileName in metadata.sources) {
            result = metadata.sources[sourceFileName].keccak256 ?? null
        } else {
            result = null
        }
        return result
    }

    public static castSolcMetadata(content: unknown): SolcMetadata|null {
        let result: SolcMetadata|null
        /*
            // https://docs.soliditylang.org/en/latest/metadata.html#contract-metadata

            {
                "compiler": {
                    "version": "0.8.17+commit.8df45f5f"
                },
                "language": "Solidity",
                "output": {
                },
                "settings": {
                },
                "sources": {
                },
                "version": 1
            }
         */

        if (typeof content === "object" && content !== null) {
            const ok1 = "compiler" in content && typeof content.compiler == "object"
            const ok2 = "language" in content && content.language == "Solidity"
            const ok3 = "output" in content && typeof content.output == "object"
            const ok4 = "settings" in content && typeof content.settings == "object"
            const ok5 = "sources" in content && typeof content.sources == "object"
            const ok6 = "version" in content && content.version == "1"
            result = ok1 && ok2 && ok3 && ok4 && ok5 && ok6 ? content as SolcMetadata : null
        } else {
            result = null
        }
        return result
    }

    public static parseSolcMetadata(content: string): SolcMetadata|null {
        let result: SolcMetadata|null
        try {
            const json = JSON.parse(content)
            result = this.castSolcMetadata(json)
        } catch {
            result = null
        }
        return result
    }


    public static findMatchingContract(deployedBytecode: string, output: SolcOutput): ContractRecord|null {
        let result: ContractRecord|null = null

        const contracts = output.contracts ?? {}
        for (const sourceFileName of Object.keys(contracts)) {
            const contractDescriptions = contracts[sourceFileName]
            for (const contractName of Object.keys(contractDescriptions)) {
                const description = contractDescriptions[contractName]
                const compiledBytecode = description.evm?.deployedBytecode?.object ?? null
                if (compiledBytecode !== null && compiledBytecode != "") {
                    const comparison = SolcUtils.compareBytecode(deployedBytecode, compiledBytecode)
                    if (comparison !== BytecodeComparison.mismatch) {
                        result = { contractName, sourceFileName, description }
                        break
                    }
                }
            }
            if (result != null) break
        }

        return result
    }

    public static compareBytecode(bytecode1: string, bytecode2: string): BytecodeComparison {
        bytecode1 = bytecode1.startsWith("0x") ? bytecode1.slice(2) : bytecode1
        bytecode2 = bytecode2.startsWith("0x") ? bytecode2.slice(2) : bytecode2

        // Last bytes of each bytecode represents metadata hash
        // https://docs.soliditylang.org/en/v0.4.25/metadata.html#encoding-of-the-metadata-hash-in-the-bytecode
        const components1 = splitAuxdata(bytecode1)
        const components2 = splitAuxdata(bytecode2)
        const bytecode1NoHash = components1.length >= 1 ? components1[0] : bytecode1
        const bytecode2NoHash = components2.length >= 1 ? components2[0] : bytecode2

        let result: BytecodeComparison
        if (bytecode1 === bytecode2) {
            result = BytecodeComparison.fullMatch
        } else if (bytecode1NoHash === bytecode2NoHash) {
            result = BytecodeComparison.partialMatch
        } else {
            result = BytecodeComparison.mismatch
        }

        return result
    }

}


export interface SolcWorkerInput {
    version: string
    input: SolcInput
}

export interface SolcWorkerOutput {
    report?: SolcReport
    error?: unknown
}

export interface SolcReport {
    output: SolcOutput
    resolution: Record<string, string>
}

export enum BytecodeComparison {
    fullMatch = "fullMatch",
    partialMatch = "partialMatch",
    mismatch = "mismatch"
}

export interface ContractRecord {
    contractName: string
    sourceFileName: string
    description: ContractDescription
}