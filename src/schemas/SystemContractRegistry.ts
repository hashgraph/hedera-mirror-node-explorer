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

    private readonly entries = new Map<string, string>()

    constructor() {
        this.addEntry("0.0.359", "Hedera Token Service System Contract")
        this.addEntry("0.0.360", "Exchange Rate System Contract")
        this.addEntry("0.0.361", "PRNG Seed System Contract")
    }

    public lookup(contractId: string): string | null {
        return this.entries.get(contractId) ?? null
    }

    private addEntry(contractId: string, description: string) {
        if(!this.entries.get(contractId)) {
            this.entries.set(contractId, description)
        }
    }
}

export const systemContractRegistry = new SystemContractRegistry()

