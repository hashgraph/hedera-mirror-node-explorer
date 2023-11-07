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

import {ContractRecord, SolcReport, SolcUtils} from "@/utils/solc/SolcUtils";
import {SolcMetadata} from "@/utils/solc/SolcMetadata";
import {SolcIndexCache} from "@/utils/cache/SolcIndexCache";
import {SolcInput} from "@/utils/solc/SolcInput";
import {HHMetadata} from "@/utils/hardhat/HHMetadata";
import {HHMatch, HHUtils} from "@/utils/hardhat/HHUtils";

export enum ContractAuditStatus {
    NoSourceFile,
    Failure, // failure !== null
    UnknownCompilerVersion,
    CompilationErrors, // longCompilerversion !== null
    Unresolved, // longCompilerVersion !== null
    Resolved, // longCompilerversion !== null && resolvedMetadata !== null  // contractRecord may be null
}

export enum ContractAuditItemStatus {
    OK,
    Unused,
    Unknown,
}

export class ContractAuditItem {

    public readonly path: string
    public readonly content: string | SolcMetadata | SolcInput | HHMetadata
    public readonly status: ContractAuditItemStatus
    public readonly target: boolean

    constructor(path: string, content: string | SolcMetadata | SolcInput | HHMetadata, status: ContractAuditItemStatus, target: boolean) {
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

    static async build(files: Map<string, string | SolcMetadata | SolcInput | HHMetadata>, solcVersion: string, deployedByteCode: string): Promise<ContractSourceAudit> {

        // 1) Let's try with Hard Hat metadata files
        let result = await this.tryWithHHMetadata(files, deployedByteCode)
        if (result === null) {

            // We'll need the compiler now
            const longCompilerVersion = await SolcIndexCache.instance.fetchLongVersion(solcVersion)
            if (longCompilerVersion !== null) {

                // 2) Let's try with solc input files
                result = await this.tryWithSolcInput(files, longCompilerVersion, deployedByteCode)

                // We'll need source files now
                const sourceFiles = new Map<string, string>()
                for (const [file, content] of files) {
                    if (typeof content == "string") {
                        sourceFiles.set(file, content)
                    }
                }

                if (sourceFiles.size >= 1) {

                    try {
                        // Let's compile all sources a first time to see if there's any compilation errors or missing file
                        const solcInput = this.makeSolcInput(sourceFiles)
                        const solcReport = await this.compile(solcInput, longCompilerVersion)

                        if (SolcUtils.countErrors(solcReport.output) >= 1) {
                            // There a compilation errors

                            result = new ContractSourceAudit(
                                ContractAuditStatus.CompilationErrors,
                                ContractSourceAudit.makeAuditItems(files),
                                null,
                                null,
                                null,
                                SolcUtils.fetchMissingFiles(solcReport.output))

                        } else {

                            if (result === null) {
                                // 3) Let's try with solc metadata files
                                result = await this.tryWithSolcMetadata(files, sourceFiles, longCompilerVersion, deployedByteCode)
                            }

                            if (result == null) {
                                // 4) Let's with the source files only
                                result = await this.tryWithSourceFilesOnly(files, solcInput, solcReport, longCompilerVersion, deployedByteCode)
                            }
                        }
                    } catch(reason) {
                        result = new ContractSourceAudit(
                            ContractAuditStatus.Failure,
                            ContractSourceAudit.makeAuditItems(files),
                            null,
                            null,
                            null,
                            [],
                            reason)
                    }

                } else {

                    // We need at least one solidity source
                    result = new ContractSourceAudit(
                        ContractAuditStatus.NoSourceFile,
                        ContractSourceAudit.makeAuditItems(files))
                }

            } else {

                // We did not find solc version in compiler version registry
                result = new ContractSourceAudit(
                    ContractAuditStatus.UnknownCompilerVersion,
                    ContractSourceAudit.makeAuditItems(files))
            }
        }

        return Promise.resolve(result)
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

    countMetadataFiles(): number {
        let result = 0
        for (const i of this.items) {
            if (typeof i.content != "string") {
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
    // Private (tryWithHHMetadata)
    //

    private static async tryWithHHMetadata(files: Map<string, string | SolcMetadata | SolcInput | HHMetadata>,
                                           deployedByteCode: string): Promise<ContractSourceAudit|null> {
        let result: ContractSourceAudit|null

        // Extracts HardHat metadata files
        const hhMetadataFiles = new Map<string, HHMetadata>()
        for (const [file, content] of files) {
            const hhMetadata = HHUtils.castMetadata(content)
            if (hhMetadata !== null) {
                hhMetadataFiles.set(file, hhMetadata)
            }
        }

        // Searches HardHat metadata files for a contract matching deployed bytecode
        const hhMatch = HHUtils.match(deployedByteCode, hhMetadataFiles)
        if (hhMatch !== null) {
            // Some bytecode in HardHat metadata match :)
            const items = ContractSourceAudit.makeAuditItemsWithHHMatch(files, hhMatch)
            result = new ContractSourceAudit(
                ContractAuditStatus.Resolved,
                items,
                hhMatch.solcLongVersion,
                hhMatch.contractName,
                hhMatch.solcInput)
        } else {
            result = null
        }

        return Promise.resolve(result)
    }


    //
    // Private (tryWithSolcInput)
    //

    private static async tryWithSolcInput(files: Map<string, string | SolcMetadata | SolcInput | HHMetadata>,
                                          longCompilerVersion: string,
                                          deployedByteCode: string): Promise<ContractSourceAudit|null> {
        let result: ContractSourceAudit|null

        // Extracts solc input files
        const solcInputFiles = new Map<string, SolcInput>()
        for (const [file, content] of files) {
            const solcInput = SolcUtils.castSolcInput(content)
            if (solcInput !== null) {
                solcInputFiles.set(file, solcInput)
            }
        }

        // Compile sources with each solc input file and searches a contract matching deployed bytecode
        let record: ContractRecord|null = null
        let solcInput: [string, SolcInput]|null = null
        for (const [file, content] of solcInputFiles) {
            try {
                const solcReport = await this.compile(content, longCompilerVersion)
                if (solcReport !== null) {
                    const r = SolcUtils.findMatchingContract(deployedByteCode, solcReport.output)
                    if (r !== null) {
                        record = r
                        solcInput = [file, content]
                        break
                    }
                }
            } catch {}
        }

        if (record !== null && solcInput !== null) {
            const items = ContractSourceAudit.makeAuditItems(files, record, solcInput)
            result = new ContractSourceAudit(
                ContractAuditStatus.Resolved,
                items,
                longCompilerVersion,
                record.contractName,
                solcInput[1])
        } else {
            result = null
        }

        return Promise.resolve(result)
    }

    //
    // Private (tryWithSolcMetadata)
    //

    private static async tryWithSolcMetadata(files: Map<string, string | SolcMetadata | SolcInput | HHMetadata>,
                                             sourceFiles: Map<string, string>,
                                             longCompilerVersion: string,
                                             deployedByteCode: string): Promise<ContractSourceAudit|null> {
        let result: ContractSourceAudit|null

        // Extracts solc metadata files
        const solcMetadataFiles = new Map<string, SolcMetadata>()
        for (const [file, content] of files) {
            const solcMetadata = SolcUtils.castSolcMetadata(content)
            if (solcMetadata !== null) {
                solcMetadataFiles.set(file, solcMetadata)
            }
        }

        // Compile sources using each solc metadata file and searches a contract matching deployed bytecode
        let record: ContractRecord|null = null
        let solcMetadata: [string, SolcMetadata]|null = null
        for (const [file, content] of solcMetadataFiles) {
            const solcInput = this.makeSolcInput(sourceFiles, content)
            const solcReport = await this.compile(solcInput, longCompilerVersion)
            if (solcReport !== null) {
                const r = SolcUtils.findMatchingContract(deployedByteCode, solcReport.output)
                if (r !== null) {
                    record = r
                    solcMetadata = [file, content]
                    break
                }
            }
        }

        if (record !== null && solcMetadata !== null) {

            result = new ContractSourceAudit(
                ContractAuditStatus.Resolved,
                ContractSourceAudit.makeAuditItems(files, record, solcMetadata),
                longCompilerVersion,
                record.contractName,
                solcMetadata[1])

        } else {
            result = null
        }

        return Promise.resolve(result)
    }


    //
    // Private (tryWithSourceFilesOnly)
    //

    private static async tryWithSourceFilesOnly(files: Map<string, string | SolcMetadata | SolcInput | HHMetadata>,
                                                solcInput: SolcInput,
                                                solcReport: SolcReport,
                                                longCompilerVersion: string,
                                                deployedByteCode: string): Promise<ContractSourceAudit> {

        let result: ContractSourceAudit|null

        const record = SolcUtils.findMatchingContract(deployedByteCode, solcReport.output)
        if (record !== null) {
            // We found a matching contract using default compiler options ... lucky
            result = new ContractSourceAudit(
                ContractAuditStatus.Resolved,
                ContractSourceAudit.makeAuditItems(files, record, [record.sourceFileName, solcInput]),
                longCompilerVersion,
                record.contractName,
                solcInput)
        } else {
            const fallbackMetadata = this.findFallbackMetadata(files)
            if (fallbackMetadata !== null) {
                // Let's fallback with the metadata file
                result = new ContractSourceAudit(
                    ContractAuditStatus.Resolved,
                    ContractSourceAudit.makeAuditItems(files),
                    longCompilerVersion,
                    null,
                    fallbackMetadata)
            } else {
                // User action is needed
                //  - either there is no metadata => provide compilation settings
                //  - either there are multiple metadata => identify which one to use
                result = new ContractSourceAudit(
                    ContractAuditStatus.Unresolved,
                    ContractSourceAudit.makeAuditItems(files),
                    longCompilerVersion)
            }
        }

        return Promise.resolve(result)
    }

    private static findFallbackMetadata(files: Map<string, string | SolcMetadata | SolcInput | HHMetadata>): SolcMetadata|SolcInput|null {

        // Splits metadata files by type
        const hhMetadataFiles = new Map<string, HHMetadata>()
        const solcInputFiles = new Map<string, SolcInput>()
        const solcMetadataFiles = new Map<string, SolcMetadata>()
        for (const [file, content] of files) {
            const hhMetadata = HHUtils.castMetadata(content)
            if (hhMetadata !== null) {
                hhMetadataFiles.set(file, hhMetadata)
            } else {
                const solcInput = SolcUtils.castSolcInput(content)
                if (solcInput !== null) {
                    solcInputFiles.set(file, solcInput)
                } else {
                    const solcMetadata = SolcUtils.castSolcMetadata(content)
                    if (solcMetadata !== null) {
                        solcMetadataFiles.set(file, solcMetadata)
                    }
                }
            }
        }

        let result: SolcMetadata|SolcInput|null
        const metadataFileCount = hhMetadataFiles.size + solcInputFiles.size + solcMetadataFiles.size
        if (metadataFileCount === 1) {
            if (hhMetadataFiles.size == 1) {
                const metadata0 = hhMetadataFiles.values().next().value as HHMetadata
                result = metadata0.input
            } else if (solcInputFiles.size == 1) {
                result = solcInputFiles.values().next().value
            } else {
                result = solcMetadataFiles.values().next().value
            }
        } else {
            result = null
        }

        return result
    }


    //
    // Private
    //

    private static async compile(solcInput: SolcInput, longCompilerVersion: string): Promise<SolcReport> {
        return await SolcUtils.runAsWorker("v" + longCompilerVersion, solcInput)
    }


    private static makeSolcInput(sourceFiles: Map<string, string>, solcMetadata: SolcMetadata|null = null): SolcInput {
        const result = {
            language: "Solidity",
            sources: {} as Record<string, { content: string }>,
            settings: {
                outputSelection: {
                    '*': {
                        '*': ["metadata", "evm.deployedBytecode.object"],
                    },
                },
                optimizer: undefined as undefined|{}
            },
        }
        if (solcMetadata !== null) {
            // We pass optimizer settings from solc metadata to solc input
            // It looks like solcMetadata.settings.optimizer contains unclonable object
            // So we neutralize this using JSON serialization
            result.settings.optimizer = JSON.parse(JSON.stringify(solcMetadata.settings.optimizer))
        }
        for (const [path, content] of sourceFiles) {
            result.sources[path] = {content: content}
        }
        return result
    }

    private static isReferencedInMetadata(path: string, metadata: SolcMetadata|SolcInput|HHMetadata): boolean {
        let result: boolean
        const solcMetadata = SolcUtils.castSolcMetadata(metadata)
        if (solcMetadata !== null) {
            result = path in solcMetadata.sources
        } else {
            const solcInput = SolcUtils.castSolcInput(metadata)
            if (solcInput !== null) {
                result = path in solcInput.sources
            } else {
                const hhMetadata = HHUtils.castMetadata(metadata)
                if (hhMetadata !== null) {
                    result = path in hhMetadata.input?.sources
                } else {
                    result = false
                }
            }
        }
        return result
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

    private static makeAuditItemsWithHHMatch(inputFiles: Map<string, string|SolcMetadata|SolcInput|HHMetadata>,
                                             hhMatch: HHMatch): ContractAuditItem[] {
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

    private static makeAuditItems(inputFiles: Map<string, string | SolcMetadata | SolcInput | HHMetadata>,
                          contractRecord: ContractRecord | null = null,
                          resolvedMetadata: [string, SolcMetadata|SolcInput] | null = null): ContractAuditItem[] {
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
                    const referenced = this.isReferencedInMetadata(f, resolvedMetadata[1])
                    const status = referenced ? ContractAuditItemStatus.OK : ContractAuditItemStatus.Unused
                    newItem = new ContractAuditItem(f, c, status, target)
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
}