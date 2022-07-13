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

import {Router} from "vue-router";
import {networkRegistry} from "@/schemas/NetworkRegistry";
import {computed} from "vue";

export class RouteManager {

    private readonly router: Router

    //
    // Public
    //

    public constructor(router: Router) {
        this.router = router
    }

    public readonly currentNetwork = computed(() => {
        return this.currentNetworkEntry.value.name
    })

    public readonly currentNetworkEntry = computed(() => {

        let networkName: string|null
        const networkParam = this.router.currentRoute.value.params.network
        if (Array.isArray(networkParam)) {
            networkName = networkParam.length >= 1 ? networkParam[0] : null
        } else {
            networkName = networkParam
        }
        const networkEntry = networkName != null ? networkRegistry.lookup(networkName) : null

        return networkEntry != null ? networkEntry : networkRegistry.getDefaultEntry()
    })

}


