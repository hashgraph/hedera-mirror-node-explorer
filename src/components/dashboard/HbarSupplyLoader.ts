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
import {NetworkSupplyResponse} from "@/schemas/HederaSchemas";

export class HbarSupplyLoader extends AutoRefreshLoader<NetworkSupplyResponse> {

    //
    // Public
    //

    public readonly deltaSeconds: number | null

    public constructor(deltaSeconds: number | null = null) {
        // Refresh every 10 min, forever
        super(600000, AutoRefreshLoader.HUGE_COUNT)
        this.deltaSeconds = deltaSeconds
    }

    public readonly hbarReleased = computed(() => {
        const released = Number(this.response.value?.data.released_supply)
        return released ? released / 100000000 : null
    })

    public readonly hbarTotal = computed(() => {
        const total = Number(this.response.value?.data.total_supply)
        return total ? total / 100000000 : null
    })

    //
    // EntityCache
    //

    protected load(): Promise<AxiosResponse<NetworkSupplyResponse>> {

        const params = {} as {
            timestamp: string
        }
        if (this.deltaSeconds) {
            const now = new Date()
            const target = new Date(now.getTime() - this.deltaSeconds * 1000)
            params.timestamp = (target.getTime() / 1000).toString()
        }

        return axios.get<NetworkSupplyResponse>("api/v1/network/supply", {params: params})
    }
}