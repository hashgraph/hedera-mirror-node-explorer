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

import {ContractRecord, SolcUtils} from "@/utils/solc/SolcUtils";
import {SolcMetadata} from "@/utils/solc/SolcMetadata";
import {SolcIndexCache} from "@/utils/cache/SolcIndexCache";
import {SolcInput} from "@/utils/solc/SolcInput";
import {utils} from "ethers";
import {HHMetadata} from "@/utils/hardhat/HHMetadata";
import {HHMatch, HHUtils} from "@/utils/hardhat/HHUtils";

export enum ContractAuditStatus {
    NoSourceFile,
    Failure,    // failure !== null
    UnknownCompilerVersion,         // when files are missing, path are available in missingFiles
    CompilationErrors,
    Mismatch,   // longCompilerVersion != null
    Uncertain,  // longCompilerversion !== null && contractRecord !== null
    Resolved,   // longCompilerversion !== null && contractRecord !== null && resolvedMetadata !== null
}

export enum ContractAuditItemStatus {
    OK,
    Unused,
    Dirty,
    Unknown,
}

export class ContractAuditItem {

    public readonly path: string
    public readonly content: string | SolcMetadata | HHMetadata
    public readonly status: ContractAuditItemStatus
    public readonly target: boolean

    constructor(path: string, content: string | SolcMetadata | HHMetadata, status: ContractAuditItemStatus, target: boolean) {
        this.path = path
        this.content = content
        this.status = status
        this.target = target
    }
}

export class ContractSourceAudit {

    public readonly status: ContractAuditStatus
    public readonly items: ContractAuditItem[]
    public readonly longCompilerVersion: string | null
    public readonly resolvedContractName: string | null
    public readonly resolvedMetadata: SolcMetadata | SolcInput | null
    public readonly missingFiles: string[]
    public readonly failure: unknown

    //
    // Public
    //

    static async build(files: Map<string, string | SolcMetadata | HHMetadata>, solcVersion: string, deployedByteCode: string): Promise<ContractSourceAudit> {

        // Extracts HardHat metadata files
        const hhMetadataFiles = new Map<string, HHMetadata>()
        for (const [file, content] of files) {
            const hhMetadata = HHUtils.castMetadata(content)
            if (hhMetadata !== null) {
                hhMetadataFiles.set(file, hhMetadata)
            }
        }

        let result: ContractSourceAudit
        const hhMatch = HHUtils.match(deployedByteCode, hhMetadataFiles)
        if (hhMatch !== null) {
            // Some bytecode in HardHat metadata match :)
            result = await this.buildWithHHMatch(files, hhMatch)
        } else {
            result = await this.buildWithoutHHMatch(files, solcVersion, deployedByteCode)
        }

        return result
    }

    makeReducedSourceFiles(): Map<string, string> {
        const result = new Map<string, string>()
        for (const i of this.items) {
            if (typeof i.content == "string" && i.status !== ContractAuditItemStatus.Unused) {
                result.set(i.path, i.content)
            }
        }
        return result
    }

    makeReducedSolcInput(): SolcInput {
        return ContractSourceAudit.makeSolcInput(this.makeReducedSourceFiles())
    }

    countSolcMetadata(): number {
        let result = 0
        for (const i of this.items) {
            if (SolcUtils.castSolcMetadata(i.content) !== null) {
                result += 1
            }
        }
        return result
    }

    fetchFallbackMetadata(): SolcMetadata|null {
        let result: SolcMetadata|null = null
        for (const i of this.items) {
            const solcMetadata = SolcUtils.castSolcMetadata(i.content)
            if (solcMetadata !== null) {
                result = solcMetadata
                break
            }
        }
        return result
    }

    //
    // Private (with hardhat metadata match)
    //

    static async buildWithHHMatch(files: Map<string, string | SolcMetadata | HHMetadata>, hhMatch: HHMatch): Promise<ContractSourceAudit> {
        const items = ContractSourceAudit.makeAuditItemsWithHHMatch(files, hhMatch)
        return new ContractSourceAudit(
            ContractAuditStatus.Resolved,
            items,
            hhMatch.solcLongVersion,
            hhMatch.contractName,
            hhMatch.solcInput)
    }

    //
    // Private (without hardhat metadata match)
    //

    static async buildWithoutHHMatch(files: Map<string, string | SolcMetadata | HHMetadata>, solcVersion: string, deployedByteCode: string): Promise<ContractSourceAudit> {

        // Separates sources and metadata files
        const sourceFiles = new Map<string, string>()
        const metadataFiles = new Map<string, SolcMetadata>()
        for (const [file, content] of files) {
            if (typeof content == "string") {
                sourceFiles.set(file, content)
            } else {
                const solcMetadata = SolcUtils.castSolcMetadata(content)
                if (solcMetadata !== null) {
                    metadataFiles.set(file, solcMetadata)
                }
            }
        }

        let result: ContractSourceAudit
        if (sourceFiles.size >= 1) {
            try {
                const longCompilerVersion = await SolcIndexCache.instance.fetchLongVersion(solcVersion)
                if (longCompilerVersion !== null) {
                    const solcInput = this.makeSolcInput(sourceFiles)
                    const solcReport = await SolcUtils.runAsWorker("v" + longCompilerVersion, solcInput)
                    if (SolcUtils.countErrors(solcReport.output) >= 1) {
                        // There are compilation errors
                        const missingFiles = SolcUtils.fetchMissingFiles(solcReport.output)
                        result = new ContractSourceAudit(
                            ContractAuditStatus.CompilationErrors,
                            ContractSourceAudit.makeAuditItems(files),
                            null,
                            null,
                            null,
                            missingFiles)
                    } else {
                        const contractRecord = SolcUtils.findMatchingContract(deployedByteCode, solcReport.output)
                        if (contractRecord !== null) {
                            const resolvedMetadata = ContractSourceAudit.findSolcMetadata(metadataFiles, contractRecord)
                            if (resolvedMetadata !== null) {
                                // We have the original metadata file => RESOLVED
                                const items = ContractSourceAudit.makeAuditItems(files, contractRecord, resolvedMetadata)
                                result = new ContractSourceAudit(
                                    ContractAuditStatus.Resolved,
                                    items,
                                    longCompilerVersion,
                                    contractRecord.contractName,
                                    resolvedMetadata[1])
                            } else {
                                // We don't have original metadata file => UNCERTAIN
                                result = new ContractSourceAudit(
                                    ContractAuditStatus.Uncertain,
                                    ContractSourceAudit.makeAuditItems(files, contractRecord),
                                    longCompilerVersion,
                                    contractRecord.contractName)
                            }
                        } else {
                            // We did not found any generated bytecode matching deployed bytecode => MISMATCH
                            result = new ContractSourceAudit(
                                ContractAuditStatus.Mismatch,
                                ContractSourceAudit.makeAuditItems(files),
                                longCompilerVersion)
                        }
                    }
                } else {
                    // We did not find solc version in compiler version registry
                    result = new ContractSourceAudit(
                        ContractAuditStatus.UnknownCompilerVersion,
                        ContractSourceAudit.makeAuditItems(files))
                }
            } catch (failure) {
                // Something failed during compilation
                result = new ContractSourceAudit(
                    ContractAuditStatus.Failure,
                    ContractSourceAudit.makeAuditItems(files),
                    null,
                    null,
                    null,
                    [],
                    failure)
            }
        } else {
            // There is no solidity source
            result = new ContractSourceAudit(
                ContractAuditStatus.NoSourceFile,
                ContractSourceAudit.makeAuditItems(files))
        }

        return Promise.resolve(result)
    }

    //
    // Private
    //

    private constructor(status: ContractAuditStatus,
                        items: ContractAuditItem[],
                        longCompilerVersion: string | null = null,
                        contractName: string | null = null,
                        resolvedMetadata: SolcMetadata|SolcInput|null = null,
                        missingFiles: string[] = [],
                        failure: unknown = null) {
        this.status = status
        this.items = items
        this.longCompilerVersion = longCompilerVersion
        this.resolvedContractName = contractName
        this.resolvedMetadata = resolvedMetadata
        this.missingFiles = missingFiles
        this.failure = failure
    }

    private static findSolcMetadata(metadataFiles: Map<string, SolcMetadata|HHMetadata>, contractRecord: ContractRecord): [string, SolcMetadata] | null {
        let result: [string, SolcMetadata] | null = null
        for (const [f, m] of metadataFiles.entries()) {
            const solcMetadata = SolcUtils.castSolcMetadata(m)
            if (solcMetadata !== null) {
                if (SolcUtils.fetchCompilationTarget(solcMetadata) == contractRecord.contractName) {
                    result = [f, solcMetadata]
                    break
                }
            }
        }
        return result
    }

    private static makeAuditItemsWithHHMatch(inputFiles: Map<string, string|SolcMetadata|HHMetadata>, hhMatch: HHMatch): ContractAuditItem[] {
        const result: ContractAuditItem[] = []
        for (const [f, c] of inputFiles) {
            let newItem: ContractAuditItem
            const hhMetadata = HHUtils.castMetadata(c)
            if (hhMetadata !== null && f == hhMatch.metadataPath) {
                newItem = new ContractAuditItem(f, c, ContractAuditItemStatus.OK, true)
            } else {
                newItem = new ContractAuditItem(f, c, ContractAuditItemStatus.Unused, false)
            }
            result.push(newItem)
        }
        return result
    }

    private static makeAuditItems(inputFiles: Map<string, string | SolcMetadata | HHMetadata>,
                          contractRecord: ContractRecord | null = null,
                          resolvedMetadata: [string, SolcMetadata] | null = null): ContractAuditItem[] {
        const result: ContractAuditItem[] = []
        for (const [f, c] of inputFiles) {
            let newItem: ContractAuditItem
            if (contractRecord === null) {
                newItem = new ContractAuditItem(f, c, ContractAuditItemStatus.Unknown, false)
            } else if (resolvedMetadata === null) {
                const target = f == contractRecord.sourceFileName
                newItem = new ContractAuditItem(f, c, ContractAuditItemStatus.Unknown, target)
            } else {
                if (typeof c == "string") {
                    // f is a solidity source
                    const target = f == contractRecord.sourceFileName
                    const currentHash = utils.keccak256(utils.toUtf8Bytes(c))
                    const expectedHash = this.fetchKeccakHash(f, resolvedMetadata[1])
                    if (expectedHash === null) {
                        newItem = new ContractAuditItem(f, c, ContractAuditItemStatus.Unused, target)
                    } else if (expectedHash === currentHash) {
                        newItem = new ContractAuditItem(f, c, ContractAuditItemStatus.OK, target)
                    } else {
                        newItem = new ContractAuditItem(f, c, ContractAuditItemStatus.Dirty, target)
                    }
                } else {
                    // f is a metadata file
                    const target = f == resolvedMetadata[0]
                    const itemStatus = target ? ContractAuditItemStatus.OK : ContractAuditItemStatus.Unused
                    newItem = new ContractAuditItem(f, c, itemStatus, target)
                }
            }
            result.push(newItem)
        }
        return result
    }

    private static makeSolcInput(sourceFiles: Map<string, string>): SolcInput {
        const result = {
            language: "Solidity",
            sources: {} as Record<string, { content: string }>,
            settings: {
                outputSelection: {
                    '*': {
                        '*': ["metadata", "evm.deployedBytecode.object"],
                    },
                }
            },
        }
        for (const [path, content] of sourceFiles) {
            result.sources[path] = {content: content}
        }
        return result
    }

    private static fetchKeccakHash(f: string, metadata: SolcMetadata|HHMetadata): string|null {
        let result: string|null
        const solcMetadata = SolcUtils.castSolcMetadata(metadata)
        if (solcMetadata !== null) {
            result = SolcUtils.fetchKeccakHash(f, solcMetadata)
        } else {
            result = null
        }
        return result
    }
}