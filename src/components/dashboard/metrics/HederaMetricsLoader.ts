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
import {computed} from "vue";
import {NetworkExchangeRateSetResponse, NetworkSupplyResponse} from "@/schemas/HederaSchemas";
import {EntityLoaderV2} from "@/utils/loader/EntityLoaderV2";

export class HederaMetricsLoader extends EntityLoaderV2<HederaMetrics> {

    //
    // Public
    //

    public constructor() {
        // Refresh every 10 min, forever
        super(60*10*1000, EntityLoaderV2.HUGE_COUNT)
    }

    public readonly hbarPriceText = computed(() => {
        const v = this.hbarPrice.value
        return v !== null ? "$" + v.toFixed(4) : ""
    })

    public readonly hbarPriceVariationText = computed(() => {
        const v = this.hbarPriceVariation.value
        return v !== null ? v.toFixed(2) : ""
    })

    public readonly hbarReleasedText = computed(() => {
        const v = this.hbarReleased.value
        return v !== null ? Number(v).toLocaleString('en-US') : ""
    })

    public readonly hbarTotalText = computed(() => {
        const v = this.hbarTotal.value
        return v !== null ? Number(v).toLocaleString('en-US') : ""
    })

    public readonly hbarMarketCapText = computed(() => {
        const v = this.hbarMarketCap.value
        return  v !== null !== null ? "$" + Number(v).toLocaleString("en-US") : ""
    })

    public readonly hbarMarketCapVariationText = computed(() => {
        const v = this.hbarMarketCapVariation.value
        return v !== null !== null ? Number(v).toFixed(2) : ""
    })

    //
    // EntityCache
    //

    protected async load(): Promise<HederaMetrics> {

        const timeNow = new Date().getTime()
        const time24 = timeNow - 24 * 3600 * 1000
        const paramsNow = { timestamp: timeNow / 1000 }
        const params24 = { timestamp: time24 / 1000 }

        const lastExchangeRate = (await axios.get<NetworkExchangeRateSetResponse>(
            "api/v1/network/exchangerate", { params: paramsNow})).data
        const lastExchangeRate24 = (await axios.get<NetworkExchangeRateSetResponse>(
            "api/v1/network/exchangerate", {params: params24})).data
        const lastSupply = (await axios.get<NetworkSupplyResponse>(
            "api/v1/network/supply", { params: paramsNow})).data
        const lastSupply24 = (await axios.get<NetworkSupplyResponse>(
            "api/v1/network/supply", {params: params24})).data

        return Promise.resolve(new HederaMetrics(lastExchangeRate, lastExchangeRate24, lastSupply, lastSupply24))
    }

    //
    // Private
    //


    private readonly hbarPrice = computed(() => {
        const rate = this.entity.value?.lastExchangeRate?.current_rate
        return rate ? (Math.round(rate.cent_equivalent / rate.hbar_equivalent * 100) / 10000) : null
    })

    private readonly hbarPrice24 = computed(() => {
        const rate = this.entity.value?.lastExchangeRate24.current_rate
        return rate ? (Math.round(rate.cent_equivalent / rate.hbar_equivalent * 100) / 10000) : null
    })

    private readonly hbarPriceVariation = computed(() => {
        const currentPrice = this.hbarPrice.value
        const price24h = this.hbarPrice24.value
        return (currentPrice && price24h)
            ? (Math.round((currentPrice - price24h) / price24h * 10000) / 100)
            : null
    })

    private readonly hbarReleased = computed(() => {
        const released = Number(this.entity.value?.lastSupply.released_supply)
        return released ? released / 100000000 : null
    })

    private readonly hbarReleased24 = computed(() => {
        const released = Number(this.entity.value?.lastSupply24.released_supply)
        return released ? released / 100000000 : null
    })

    private readonly hbarTotal = computed(() => {
        const total = Number(this.entity.value?.lastSupply.total_supply)
        return total ? total / 100000000 : null
    })

    private readonly hbarMarketCap = computed(() => {
        const released = this.hbarReleased.value
        const price = this.hbarPrice.value
        return (released && price)
            ? Math.round(released * price)
            : null
    })

    public readonly hbarMarketCapVariation = computed(() => {
        let result: string|null
        const released = this.hbarReleased.value
        const price = this.hbarPrice.value
        const released24h = this.hbarReleased24.value
        const price24h = this.hbarPrice24.value
        if (released && price && released24h && price24h) {
            const variation = (released * price - released24h * price24h) / (released24h * price24h)
            result = (Math.round(variation * 10000) / 100).toFixed(2)
        } else {
            result = null
        }
        return result
    })

}

export class HederaMetrics {

    constructor(
        readonly lastExchangeRate: NetworkExchangeRateSetResponse,
        readonly lastExchangeRate24: NetworkExchangeRateSetResponse,
        readonly lastSupply: NetworkSupplyResponse,
        readonly lastSupply24: NetworkSupplyResponse) {}

}

