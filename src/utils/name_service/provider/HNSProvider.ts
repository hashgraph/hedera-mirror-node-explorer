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
import {Resolver} from '@hedera-name-service/hns-resolution-sdk'

export class HNSProvider extends NameServiceProvider {

    private readonly resolverCache = new Map<string,Resolver>()

    //
    // Public
    //

    public constructor() {
        super("HNS", "Hashgraph Name Service", null);
    }

    //
    // NameServiceProvider
    //

    public async resolve(name: string, network: string): Promise<string|null> {
        let result: string|null
        const r = this.findResolver(network)
        if (r !== null) {
            result = await r.resolveSLD(name) ?? null
        } else {
            result = null
        }
        return Promise.resolve(result)
    }

    //
    // Private
    //

    private findResolver(network: string): Resolver|null {

        let service: string | null
        switch (network) {
            case "mainnet":
                service = "hedera_main"
                break
            case "testnet":
                service = "hedera_test"
                break
            default: // network is unsupported by HNS
                service = null
                break
        }

        let result: Resolver|null
        if (service !== null) {
            result = this.resolverCache.get(service) ?? null
            if (result == null) {
                result = new Resolver(service as any)
                this.resolverCache.set(service, result)
            }
        } else {
            result = null
        }

        return result
    }
}
