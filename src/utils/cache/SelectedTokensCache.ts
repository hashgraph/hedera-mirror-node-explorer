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

import {SingletonCache} from "@/utils/cache/base/SingletonCache";
import axios from "axios";
import {routeManager} from "@/router";

export class SelectedTokensCache extends SingletonCache<SelectedTokensIndex> {

    public static readonly instance = new SelectedTokensCache()

    //
    // Cache
    //

    protected async load(): Promise<SelectedTokensIndex> {
        let selectedTokenEntries: SelectedTokenEntry[]
        const popularTokenIndexURL = import.meta.env.VITE_APP_POPULAR_TOKEN_INDEX_URL ?? null
        if (routeManager.currentNetwork.value == "mainnet" && popularTokenIndexURL !== null) {
            const url = window.location.origin + "/" + popularTokenIndexURL
            selectedTokenEntries= (await axios.get<SelectedTokenEntry[]>(url)).data
        } else {
            selectedTokenEntries = []
        }
        return new SelectedTokensIndex(selectedTokenEntries)
    }
}

export class SelectedTokensIndex {

    constructor(private readonly entries: SelectedTokenEntry[]) {}

    search(name: string): SelectedTokenEntry[] {
        name = name.toLowerCase()
        const result: SelectedTokenEntry[] = []
        for (const e of this.entries) {
            if (e.name.toLowerCase().indexOf(name) != -1) {
                result.push(e)
            }
        }
        return result
    }
}

export interface SelectedTokenEntry {
    token_id: string,
    name: string
}
