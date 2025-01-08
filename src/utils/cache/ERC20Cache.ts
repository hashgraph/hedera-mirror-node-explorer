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

export class ERC20Cache extends SingletonCache<ERC20Contract[]> {

    public static readonly instance = new ERC20Cache()

    public async lookupContract(contractId: string): Promise<ERC20Contract | null> {
        const tokens = await this.lookup()
        let result = null as ERC20Contract | null
        for (const t of tokens) {
            if (contractId === t.contractId) {
                result = t
                break
            }
        }
        return Promise.resolve(result)
    }

    public async search(name: string): Promise<ERC20Contract[]> {
        name = name.toLowerCase()
        const result : ERC20Contract[] = []
        const tokens = await this.lookup()
        for (const t of tokens) {
            if (t.name && t.name.toLowerCase().indexOf(name) != -1) {
                result.push(t)
            }
        }
        return Promise.resolve(result)
    }

    //
    // Cache
    //

    protected async load(): Promise<ERC20Contract[]> {
        let result: ERC20Contract[]
        const url = routeManager.currentNetworkEntry.value.erc20IndexURL
        if (url !== null) {
            result = (await axios.get<ERC20Contract[]>(url)).data
        } else {
            result = []
        }
        return Promise.resolve(result)}

}

export interface ERC20Contract {
    contractId: string,
    address: string,
    name: string | null,
    symbol: string | null,
    totalSupply: number | null,
    decimals: number | null
}
