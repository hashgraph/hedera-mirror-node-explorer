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

import {AutoRefreshLoader} from "@/utils/loader/AutoRefreshLoader";
import axios, {AxiosResponse} from "axios";
import {computed} from "vue";
import {NetworkExchangeRateSetResponse} from "@/schemas/HederaSchemas";

export class HbarPriceLoader extends AutoRefreshLoader<NetworkExchangeRateSetResponse> {

    //
    // Public
    //

    public readonly deltaSeconds: number | null

    public constructor(deltaSeconds: number | null = null) {
        // Refresh every 10 min, forever
        super(600000, AutoRefreshLoader.HUGE_COUNT)
        this.deltaSeconds = deltaSeconds
    }

    public readonly hbarPrice = computed(() => {
        const rate = this.response.value?.data.current_rate
        return rate ? (Math.round(rate.cent_equivalent / rate.hbar_equivalent * 100) / 10000) : null
    })

    //
    // EntityCache
    //

    protected load(): Promise<AxiosResponse<NetworkExchangeRateSetResponse>> {

        const params = {} as {
            timestamp: string
        }
        if (this.deltaSeconds) {
            params.timestamp = (new Date().getTime() / 1000 - this.deltaSeconds).toString()
        }

        return axios.get<NetworkExchangeRateSetResponse>("api/v1/network/exchangerate", {params: params})
    }
}