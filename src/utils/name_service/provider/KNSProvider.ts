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

import {NameServiceProvider} from "@/utils/name_service/provider/NameServiceProvider";
import {KNS, NameNotFoundError} from "@kabuto-sh/ns";

export class KNSProvider extends NameServiceProvider {

    private readonly serviceCache = new Map<string, KNS>()

    //
    // Public
    //

    public constructor() {
        super("KNS", "Kabuto Name Service", "https://kabuto.sh");
    }

    //
    // NameServiceProvider
    //

    public async resolve(name: string, network: string): Promise<string|null> {
        let result: string|null
        const s = this.findService(network)
        if (s !== null) {
            try {
                const accountId = await s.getHederaAddress(name)
                result = accountId.toString()
            } catch(error) {
                if (error instanceof NameNotFoundError) {
                    result = null
                } else {
                    throw error
                }
            }
        } else {
            result = null
        }
        return Promise.resolve(result)
    }

    //
    // Private
    //

    private findService(network: string): KNS|null {
        let result: KNS|null
        if (network == "mainnet" || network == "testnet") {
            result = this.serviceCache.get(network) ?? null
            if (result === null) {
                result = new KNS({network})
                this.serviceCache.set(network, result)
            }
        } else {
            result = null
        }
        return result
    }
}
