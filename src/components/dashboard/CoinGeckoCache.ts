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

import {AutoRefreshLoader} from "@/utils/AutoRefreshLoader";
import {CoinGeckoResponse} from "@/schemas/CoinGeckoMarketData";
import axios, {AxiosResponse} from "axios";
import {computed} from "vue";

export class CoinGeckoCache extends AutoRefreshLoader<CoinGeckoResponse> {

    //
    // Public
    //

    public constructor() {
        super(60000, AutoRefreshLoader.HUGE_COUNT)
    }

    public readonly marketData = computed(() => {
        return this.response.value?.data?.market_data
    })

    public readonly hbarPrice = computed(() => {
        const currentPrice = this.marketData.value?.current_price
        return currentPrice ? (Math.round(currentPrice.usd * 10000) / 10000).toFixed(4) : ""
    })

    public readonly hbarPriceVariation = computed(() => {
        const pcp24 = this.marketData.value?.price_change_percentage_24h
        return pcp24 ? (Math.round(pcp24 * 100)/100).toFixed(2) : ""
    })

    public readonly hbarMarketCap = computed(() => {
        const mc = this.marketData.value?.market_cap
        return mc ? Math.round(mc.usd).toLocaleString('en-US') : ""
    })

    public readonly hbarMarketCapVariation = computed(() => {
        const mccp24 = this.marketData.value?.market_cap_change_percentage_24h
        return mccp24 ? (Math.round(mccp24 * 100)/100).toFixed(2) : ""
    })


    //
    // EntityCache
    //

    protected load(): Promise<AxiosResponse<CoinGeckoResponse>> {


        const coinGeckoMarketDataURL = "https://api.coingecko.com/api/v3/coins/hedera-hashgraph"

        const params = {
            market_data: true,
            localization: false,
            tickers: false,
            community_data: false,
            developer_data: false,
            sparkline: false
        }

        return axios.get<CoinGeckoResponse>(coinGeckoMarketDataURL, {params})
    }

}