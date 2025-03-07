// SPDX-License-Identifier: Apache-2.0

import {SolcInput} from "@/utils/solc/SolcInput";
import {ContractDescription, SolcOutput} from "@/utils/solc/SolcOutput";
import {AuxdataStyle, splitAuxdata} from "@ethereum-sourcify/bytecode-utils";

export class SolcUtils {

    public static findMatchingContract(deployedBytecode: string, output: SolcOutput): ContractRecord | null {
        let result: ContractRecord | null = null

        const contracts = output.contracts ?? {}
        for (const sourceFileName of Object.keys(contracts)) {
            const contractDescriptions = contracts[sourceFileName]
            for (const contractName of Object.keys(contractDescriptions)) {
                const description = contractDescriptions[contractName]
                const compiledBytecode = description.evm?.deployedBytecode?.object ?? null
                if (compiledBytecode !== null && compiledBytecode != "") {
                    const comparison = SolcUtils.compareBytecode(deployedBytecode, compiledBytecode)
                    if (comparison !== BytecodeComparison.mismatch) {
                        result = {contractName, sourceFileName, description}
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
        const components1 = splitAuxdata(bytecode1, AuxdataStyle.SOLIDITY)
        const components2 = splitAuxdata(bytecode2, AuxdataStyle.SOLIDITY)
        const opCodes1 = components1.length >= 2 ? components1[0] : bytecode1
        const opCodes2 = components2.length >= 2 ? components2[0] : bytecode2
        const hash1 = components1.length >= 2 ? components1[1] : ""
        const hash2 = components2.length >= 2 ? components2[1] : ""

        const cleanOpCodes1 = this.clearPlaceholders(opCodes1)
        const cleanOpCodes2 = this.clearPlaceholders(opCodes2)

        let result: BytecodeComparison
        if (cleanOpCodes1 === cleanOpCodes2) {
            result = hash1 === hash2 ? BytecodeComparison.fullMatch : BytecodeComparison.partialMatch
        } else {
            result = BytecodeComparison.mismatch
        }

        return result
    }

    public static clearPlaceholders(bytecode: string): string {
        bytecode = bytecode.startsWith("0x") ? bytecode.slice(2) : bytecode

        // If first opcode is 0x73 then next 20 bytes represent an address placeholder => should be cleared
        let result: string
        if (bytecode.length >= 42 && bytecode.startsWith("73")) {
            result = bytecode.slice(42)
        } else {
            result = bytecode
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
    resolution: Record<string, string> // importPath -> dropPath
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
