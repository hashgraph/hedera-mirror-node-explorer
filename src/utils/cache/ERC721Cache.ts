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

import axios from "axios";
import {SingletonCache} from "@/utils/cache/base/SingletonCache";
import {routeManager} from "@/router";

export class ERC721Cache extends SingletonCache<ERC721Contract[]> {

    public static readonly instance = new ERC721Cache()

    //
    // Public
    //

    public async lookupContract(contractId: string) {
        const tokens = await this.lookup()
        let result = null as ERC721Contract | null
        for (const t of tokens) {
            if (contractId === t.contractId) {
                result = t
                break
            }
        }
        return Promise.resolve(result)
    }

    //
    // Cache
    //

    protected async load(): Promise<ERC721Contract[]> {
        let result: ERC721Contract[]
        const url = routeManager.currentNetworkEntry.value.erc721IndexURL
        if (url !== null) {
            result = (await axios.get<ERC721Contract[]>(url)).data
        } else {
            result = []
        }
        return Promise.resolve(result)
    }

}

export interface ERC721Contract {
    contractId: string
    name: string|undefined
}
