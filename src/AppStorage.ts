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

import {NetworkEntry, networkRegistry} from "@/schemas/NetworkRegistry";

export class AppStorage {

    private static readonly LAST_USED_NETWORK_KEY = 'network'

    public static getLastNetwork(): NetworkEntry {
        let result: NetworkEntry|null
        try {
            const item = localStorage.getItem(AppStorage.LAST_USED_NETWORK_KEY)
            result = item !== null ? networkRegistry.lookup(item) : null
        } catch {
            // Navigator is setup to block all cookies => we'll use an hardcoded fallback
            result = null
        }
        return result ?? networkRegistry.getDefaultEntry()
    }

    public static setLastNetwork(newValue: string|NetworkEntry): void {
        const newItem = typeof newValue == "string" ? newValue : newValue.name
        try {
            localStorage.setItem(AppStorage.LAST_USED_NETWORK_KEY, newItem);
        } catch {
            // Navigator is setup to block all cookies => we forget last used network
        }
    }

}
