/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2024 Hedera Hashgraph, LLC
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

import hns from '@hedera-name-service/hns-resolution-sdk'


let _nameService: hns.Resolver | null = null

export function hnsSetNetwork(name: string): void {
    let service: string|null
    switch(name) {
        case "mainnet":
            service = "hedera_main"
            break
        case "testnet":
            service = "hedera_test"
            break
        default:
            service = null
            break
    }
    if (service !== null) {
        try {
            _nameService = new hns.Resolver(service as any)
        } catch(reason) {
            _nameService = null
            console.log("Failed to initialize HNS resolver")
            console.log("reason=" + reason)
        }
    } else {
        _nameService = null
    }
}

export async function hnsResolve(domain: string): Promise<string | null> {
    if (_nameService == null) return null;

    try {
        return await _nameService.resolveSLD(domain) ?? null
    } catch (error) {
        return null;
    }
}
