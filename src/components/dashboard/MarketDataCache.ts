/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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

import {computed} from "vue";
import {HbarPriceCache} from "@/components/dashboard/HbarPriceCache";
import {HbarSupplyCache} from "@/components/dashboard/HbarSupplyCache";

export class MarketDataCache {

    //
    // Public
    //
    public readonly hbarPriceCache = new HbarPriceCache()
    public readonly hbarPrice24hCache = new HbarPriceCache(86400)
    public readonly hbarSupplyCache = new HbarSupplyCache()
    public readonly hbarSupply24hCache = new HbarSupplyCache(86400)

    public readonly hbarPrice = computed(() => {
        const currentPrice = this.hbarPriceCache.hbarPrice.value
        return currentPrice ? currentPrice.toFixed(4) : ""
    })

    public readonly hbarPriceVariation = computed(() => {
        const currentPrice = this.hbarPriceCache.hbarPrice.value
        const price24h = this.hbarPrice24hCache.hbarPrice.value
        return (currentPrice && price24h)
            ? (Math.round((currentPrice - price24h) / price24h * 10000) / 100).toFixed(2)
            : ""
    })

    public readonly hbarReleased = computed(() => {
        const released = this.hbarSupplyCache.hbarReleased.value
        return released ? (Number(released)).toLocaleString('en-US') : ""
    })

    public readonly hbarTotal = computed(() => {
        const total = this.hbarSupplyCache.hbarTotal.value
        return total ? (Number(total)).toLocaleString('en-US') : ""
    })

    public readonly hbarMarketCap = computed(() => {
        const released = this.hbarSupplyCache.hbarReleased.value
        const price = this.hbarPriceCache.hbarPrice.value
        return (released && price)
            ? Math.round(released * price).toLocaleString('en-US')
            : ""
    })

    public readonly hbarMarketCapVariation = computed(() => {
        let result
        const released = this.hbarSupplyCache.hbarReleased.value
        const price = this.hbarPriceCache.hbarPrice.value
        const released24h = this.hbarSupply24hCache.hbarReleased.value
        const price24h = this.hbarPrice24hCache.hbarPrice.value
        if (released && price && released24h && price24h) {
            const variation = (released * price - released24h * price24h) / (released24h * price24h)
            result = (Math.round(variation * 10000) / 100).toFixed(2)
        } else {
            result = ""
        }
        return result
    })

    public mount(): void {
        this.hbarPriceCache.mounted.value = true
        this.hbarPrice24hCache.mounted.value = true
        this.hbarSupplyCache.mounted.value = true
        this.hbarSupply24hCache.mounted.value = true
    }

    public unmount(): void {
        this.hbarPriceCache.mounted.value = false
        this.hbarPrice24hCache.mounted.value = false
        this.hbarSupplyCache.mounted.value = false
        this.hbarSupply24hCache.mounted.value = false
    }
}
