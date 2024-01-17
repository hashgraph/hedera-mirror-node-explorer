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
import {NetworkStake} from "@/schemas/HederaSchemas";
import axios from "axios";

export class StakeCache extends SingletonCache<NetworkStake> {

    public static readonly instance = new StakeCache()

    //
    // SingletonCache
    //

    protected async load(): Promise<NetworkStake> {
        const r = await axios.get<NetworkStake>("api/v1/network/stake")
        return r.data
    }

}