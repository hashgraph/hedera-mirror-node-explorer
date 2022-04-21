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

//
// https://www.coingecko.com/en/api/documentation
//

/*

REQUEST:
https://api.coingecko.com/api/v3/coins/hedera-hashgraph?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false

FULL SAMPLE RESULT IN CoinGeckoMarketDataResult.json

EXCERPT BELOW:
{
    "id": "hedera-hashgraph",
    "market_data": {
        "current_price": {
            "usd": 0.246033,
        },
        "market_cap": {
            "usd": 4486259941,
        },
        "market_cap_rank": 39,
        "total_volume": {
            "usd": 51538704,
        },
        "high_24h": {
            "usd": 0.246002,
        },
        "low_24h": {
            "usd": 0.223011,
        },
        "price_change_24h": 0.01963705,
        "price_change_percentage_24h": 8.67375,
        "price_change_percentage_7d": -10.53166,
        "price_change_percentage_14d": -29.95125,
        "price_change_percentage_30d": -44.15065,
        "price_change_percentage_60d": -33.15008,
        "price_change_percentage_200d": 11.79596,
        "price_change_percentage_1y": 612.65531,
        "market_cap_change_24h": 348321894,
        "market_cap_change_percentage_24h": 8.41776,
        "price_change_24h_in_currency": {
            "usd": 0.01963705,
        },
        "price_change_percentage_1h_in_currency": {
            "usd": 0.01963705,
        },
        "price_change_percentage_24h_in_currency": {
            "usd": 8.67375,
        },
        "price_change_percentage_7d_in_currency": {
            "usd": -10.53166,
        },
        "price_change_percentage_14d_in_currency": {
            "usd": -29.95125,
        },
        "price_change_percentage_30d_in_currency": {
            "usd": -33.15008,
        },
        "price_change_percentage_60d_in_currency": {
            "usd": -33.15008,
        },
        "price_change_percentage_200d_in_currency": {
            "usd": 11.79596,
        },
        "price_change_percentage_1y_in_currency": {
            "usd": 612.65531,
        },
        "market_cap_change_24h_in_currency": {
            "usd": 348321894,
        },
        "market_cap_change_percentage_24h_in_currency": {
            "usd": 8.41776,
        },
        "total_supply": 50000000000,
        "max_supply": null,
        "circulating_supply": 18287755431,
        "last_updated": "2021-12-15T08:31:37.722Z"
    },
    "last_updated": "2021-12-15T08:31:37.722Z"
} */

export interface CoinGeckoResponse {
    market_data: CoinGeckoMarketData
}

export interface CoinGeckoMarketData {
    current_price: Record<string, number>
    market_cap: Record<string, number>
    price_change_percentage_24h: number
    market_cap_change_percentage_24h: number
}
