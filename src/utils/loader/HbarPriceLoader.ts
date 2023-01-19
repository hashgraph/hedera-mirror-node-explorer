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

import {EntityLoader} from "@/utils/loader/EntityLoader";
import {NetworkExchangeRateSetResponse} from "@/schemas/HederaSchemas";
import {computed, Ref} from "vue";
import axios, {AxiosResponse} from "axios";

export class HbarPriceLoader extends EntityLoader<NetworkExchangeRateSetResponse> {

    public readonly timestamp: Ref<string | null>
    public readonly hbarPrice = computed(() => {
        const rate = this.response.value?.data.current_rate
        return rate ? (rate.cent_equivalent / rate.hbar_equivalent / 100) : null
    })

    public constructor(timestamp: Ref<string | null>) {
        super();
        this.timestamp = timestamp
        this.watchAndReload([this.timestamp])
    }

    //
    // EntityLoader
    //

    protected async load(): Promise<AxiosResponse<NetworkExchangeRateSetResponse> | null> {

        console.log("HbarPriceLoader::load() - timestamp: " + this.timestamp.value)

        let result
        const parameters = {} as {
            timestamp: string
        }
        if (this.timestamp.value) {
            if (this.timestamp.value !== "0") {
                parameters.timestamp = this.timestamp.value
            }
            result = axios.get<NetworkExchangeRateSetResponse>(
                'api/v1/network/exchangerate', {params: parameters})
        } else {
            result = Promise.resolve(null)
        }
        return result
    }
}