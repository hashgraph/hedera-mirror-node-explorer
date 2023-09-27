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

import {SingletonCache} from "@/utils/cache/base/SingletonCache";
import axios from "axios";
import {SolcIndex} from "@/utils/solc/SolcIndex";

export class SolcIndexCache extends SingletonCache<SolcIndex> {

    public static readonly instance = new SolcIndexCache()

    //
    // Public
    //

    public async fetchLongVersion(version: string): Promise<string|null> {

        /*
            {
              "path": "soljson-v0.8.18+commit.87f61d96.js",
              "version": "0.8.18",
              "build": "commit.87f61d96",
              "longVersion": "0.8.18+commit.87f61d96",
              "keccak256": "0x9a8fa4183ef95496045189b80dfb39f745db89a903b398e40131f500953e5d57",
              "sha256": "0xd82bdcba2c386d60b33aca148a9cfdf097551f68c5e45d8ec01aebbafacf5075",
              "urls": [
                "bzzr://338117c2130fcb6bce3006330712b6e7ee99875b56ce4bb6182312f76e4a6bac",
                "dweb:/ipfs/QmcKzrqRBy7PeFQxzJDs1AZZzNHKaKbJces6zUDysXZofJ"
              ]
            },

         */

        let result: string|null = null

        const index = await this.lookup()
        if (version in index.releases) {
            const path = index.releases[version]
            for (const b of index.builds) {
                if (b.path == path) {
                    result = b.longVersion
                    break
                }
            }
        }

        return result
    }

    //
    // Cache
    //

    protected async load(): Promise<SolcIndex> {
        return (await axios.get("https://binaries.soliditylang.org/bin/list.json")).data
    }
}
