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
import {EntityCache} from "@/utils/cache/base/EntityCache";
import {NetworkExchangeRateSetResponse} from "@/schemas/HederaSchemas";

export class HbarPriceCache extends EntityCache<string, NetworkExchangeRateSetResponse> {

    public static readonly instance = new HbarPriceCache()

    //
    // Cache
    //

    protected async load(timestamp: string): Promise<NetworkExchangeRateSetResponse> {
        const parameters = timestamp != "0" ? {timestamp: timestamp} : {}
        const result = await axios.get<NetworkExchangeRateSetResponse>(
            'api/v1/network/exchangerate', {params: parameters})
        return Promise.resolve(result.data)
    }

}
