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

export class SystemContractRegistry {

    private readonly entries = new Map<string, SystemContractEntry>()

    constructor() {
        this.addEntry("0.0.359", "Hedera Token Service System Contract", [
            ["0x189a554c", "cryptoTransfer((address,(address,int64)[],(address,address,int64)[])[]) -> (int)"],
            ["0x82bba493", "transferTokens(address,address[],int64[]) -> (int)"],
            ["0xeca36917", "transferToken(address,address,address,int64) -> (int)"],
            ["0x2c4ba191", "transferNFTs(address,address[],address[],int64[]) -> (int)"],
            ["0x5cfc9011", "transferNFT(address,address,address,int64) -> (int)"],
            ["0x278e0b88", "mintToken(address,uint64,bytes[]) -> (int,uint64,int[])"],
            ["0xacb9cff9", "burnToken(address,uint64,int64[]) -> (int,uint64)"],
            ["0x2e63879b", "associateTokens(address,address[]) -> (int)"],
            ["0x49146bde", "associateToken(address,address[]) -> (int)"],
            ["0x78b63918", "dissociateTokens(address,address[]) -> (int)"],
            ["0x099794e8", "dissociateToken(address,address[]) -> (int)"],
        ])
        this.addEntry("0.0.360", "Exchange Rate System Contract", [])
        this.addEntry("0.0.361", "PRNG Seed System Contract", [])
    }

    public lookup(contractId: string): SystemContractEntry | null {
        return this.entries.get(contractId) ?? null
    }

    private addEntry(contractId: string, description: string, signatures: [string, string][]) {
        if(!this.entries.get(contractId)) {
            this.entries.set(contractId, new SystemContractEntry(contractId, description, new Map(signatures)))
        }
    }
}

export class SystemContractEntry {

    public readonly contractId: string
    public readonly description: string
    public readonly signatures: Map<string, string>

    constructor(contractId: string, description: string, signatures: Map<string, string>) {
        this.contractId = contractId
        this.description = description
        this.signatures = signatures
    }
}

export const systemContractRegistry = new SystemContractRegistry()

