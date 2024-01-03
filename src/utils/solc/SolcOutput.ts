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

/*
    Reference documents:

    https://docs.soliditylang.org/en/latest/using-the-compiler.html#

 */

export interface SolcOutput {

    // Optional: not present if no errors/warnings/infos were encountered
    errors?: ErrorDescription[]
    // This contains the contract-level outputs.
    // It can be limited/filtered by the outputSelection settings.
    contracts?: Record<string, Record<string, ContractDescription>>
}


export interface ErrorDescription {
    // Optional: Location within the source file.
    sourceLocation?: SourceLocation
    // Optional: Further locations (e.g. places of conflicting declarations)
    secondarySourceLocations?: SourceLocation
    // Mandatory: Error type, such as "TypeError", "InternalCompilerError", "Exception", etc.
    // See below for complete list of types.
    type: string,
    // Mandatory: Component where the error originated, such as "general", "ewasm", etc.
    component: string,
    // Mandatory ("error", "warning" or "info", but please note that this may be extended in the future)
    severity: string,
    // Optional: unique code for the cause of the error
    errorCode?: string,
    // Mandatory
    message: string,
    // Optional: the message formatted with source location
    formattedMessage?: string
}

export interface SourceLocation {
    file: string,
    start: number,
    end: number
}

export interface ContractDescription {
    // The Ethereum Contract ABI. If empty, it is represented as an empty array.
    // See https://docs.soliditylang.org/en/develop/abi-spec.html
    abi?: [],
    // EVM-related outputs
    evm?: EvmDescription
}

export interface EvmDescription {
    bytecode: BytecodeDescription
    deployedBytecode: BytecodeDescription,
}

export interface BytecodeDescription {
    // The bytecode as a hex string.
    object: string
}


//
// Tools
//

