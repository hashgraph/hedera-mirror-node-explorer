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
import {ethers} from "ethers";
import axios from "axios";

export class SystemContractRegistry {

    private readonly entries = new Map<string, SystemContractEntry>()

    constructor() {
        this.addEntry("0.0.359", "Hedera Token Service System Contract", "IHederaTokenService.json")
        this.addEntry("0.0.360", "Hedera Exchange Rate System Contract", "IExchangeRate.json")
    }

    public lookup(contractId: string): SystemContractEntry | null {
        return this.entries.get(contractId) ?? null
    }

    private addEntry(contractId: string, description: string, abiFileName: string) {
        if(!this.entries.get(contractId)) {
            this.entries.set(contractId, new SystemContractEntry(contractId, description, abiFileName))
        }
    }
}

export class SystemContractEntry {

    public readonly contractId: string
    public readonly description: string
    public readonly abiFileName: string

    private interface: ethers.utils.Interface|null = null

    constructor(contractId: string, description: string, abiFileName: string) {
        this.contractId = contractId
        this.description = description
        this.abiFileName = abiFileName
    }
    //
    // async parseTransaction(data: string): Promise<unknown|null> {
    //     if (this.interface === null) {
    //         this.interface = await SystemContractEntry.loadInterface(this.abiFileName)
    //     }
    //
    //     return this.interface?.parseTransaction({data})
    // }

    async getSignature(data: string): Promise<string|null> {
        if (this.interface === null) {
            this.interface = await SystemContractEntry.loadInterface(this.abiFileName)
        }

        return this.interface?.parseTransaction({data: data})?.signature ?? null
    }

    //
    // Private
    //

    private static async loadInterface(abiFileName: string): Promise<ethers.utils.Interface|null> {
        let result: ethers.utils.Interface|null
        try {
            const url = window.location.origin + "/abi/" + abiFileName
            const response = await axios.get(url)
            result = new ethers.utils.Interface(response.data.abi)
        } catch(error) {
            console.log("Failed to load ABI from " + abiFileName + " (" + error + ")")
            result = null
        }
        return Promise.resolve(result)
    }
}

export const systemContractRegistry = new SystemContractRegistry()

