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

export interface SolcInput {

    // Reference
    //      https://docs.soliditylang.org/en/latest/using-the-compiler.html#input-description

    // Required: Source code language. Currently supported are "Solidity" and "Yul".
    language: string,

    // Required
    sources: Record<string, SourceInput>

    // Optional
    settings?: InputSettings
}

export interface SourceInput {
    keccak256?: string
    urls?: string[]
    content?: string
}

export interface InputSettings {
    remappings?: string[]
    outputSelection: Record<string, Record<string, string[]>>
}
