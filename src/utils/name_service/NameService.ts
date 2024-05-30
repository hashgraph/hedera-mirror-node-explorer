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
import {nameServiceProviders} from "@/utils/name_service/provider/AllProviders";

export class NameService {

    public static readonly instance = new NameService()

    //
    // Public
    //

    public async resolve(name: string, network: string): Promise<NameRecord[]> {
        const promises: Promise<NameRecord|null>[] = []
        for (const p of nameServiceProviders) {
            promises.push(this.resolveWithProvider(name, network, p))
        }

        let result: NameRecord[] = []
        const responses = await Promise.allSettled(promises)
        for (const r of responses) {
            if (r.status == "fulfilled" && r.value !== null) {
                result.push(r.value)
            }
        }

        return Promise.resolve(result)
    }

    public async singleResolve(name: string, network: string, providerAlias: string): Promise<NameRecord|null> {
        let result: NameRecord|null
        const provider = this.lookupProvider(providerAlias)
        if (provider !== null) {
            result = await this.resolveWithProvider(name, network, provider)
        } else {
            result = null
        }
        return Promise.resolve(result)
    }

    //
    // Private
    //

    private constructor() {}

    private lookupProvider(providerAlias: string): NameServiceProvider|null {
        let result: NameServiceProvider|null = null
        for (const p of nameServiceProviders) {
            if (p.providerAlias == providerAlias) {
                result = null
                break
            }
        }
        return result
    }

    private async resolveWithProvider(name: string, network: string, provider: NameServiceProvider): Promise<NameRecord|null> {
        let result: NameRecord|null
        const entityId = await provider.resolve(name, network)
        if (entityId !== null) {
            const timestamp = new Date().getTime()
            const providerAlias = provider.providerAlias
            result = { entityId, name, providerAlias, timestamp }
        } else {
            result = null
        }
        return Promise.resolve(result)
    }
}


export interface NameRecord {
    entityId: string
    name: string
    providerAlias: string
    timestamp: number // Date.getTime()
}
