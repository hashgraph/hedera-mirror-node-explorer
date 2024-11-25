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

import {EntityCache} from "@/utils/cache/base/EntityCache.ts";
import {AccountByIdCache} from "@/utils/cache/AccountByIdCache.ts";
import {ERC721Cache} from "@/utils/cache/ERC721Cache.ts";
import {ERCUtils} from "@/utils/ERCUtils.ts";

export class ERC721InfoCache extends EntityCache<string, ERC721Info|null> {

    public static readonly instance = new ERC721InfoCache()

    //
    // Cache
    //

    protected async load(contractId: string): Promise<ERC721Info|null> {
        let result: ERC721Info|null
        const erc721Contract = await ERC721Cache.instance.lookupContract(contractId)
        if (erc721Contract !== null) {
            result = await this.loadInfo(contractId)
        } else {
            result = null
        }
        return Promise.resolve(result)
    }

    //
    // Private
    //

    private async loadInfo(contractId: string): Promise<ERC721Info|null> {
        let result: ERC721Info|null
        const evmAddress = await AccountByIdCache.instance.findAccountAddress(contractId)
        if (evmAddress !== null) {

            const promises: Promise<unknown>[] = [
                ERCUtils.loadName(evmAddress),
                ERCUtils.loadSymbol(evmAddress),
            ]
            const resolutions = await Promise.all(promises)
            const name = resolutions[0] as string|null
            const symbol = resolutions[1] as string|null
            result = {
                contractId,
                evmAddress,
                name,
                symbol,
            }
        } else {
            result = null
        }
        return Promise.resolve(result)
    }
}

// https://eips.ethereum.org/EIPS/eip-721
export interface ERC721Info {
    contractId: string
    evmAddress: string
    name: string|null
    symbol: string|null
}
