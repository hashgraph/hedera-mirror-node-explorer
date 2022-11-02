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

    private static readonly VERSION = "v1"

    //
    // network
    //

    private static readonly LAST_USED_NETWORK_KEY = 'network'

    public static getLastNetwork(): NetworkEntry {
        const item = this.getLocalStorageItem(this.LAST_USED_NETWORK_KEY)
        const result = item != null ? networkRegistry.lookup(item) : null
        return result ?? networkRegistry.getDefaultEntry()
    }

    public static setLastNetwork(newValue: string|NetworkEntry): void {
        const newItem = typeof newValue == "string" ? newValue : newValue.name
        this.setLocalStorageItem(this.LAST_USED_NETWORK_KEY, newItem)
    }

    //
    // skip disclaimer (wallet chooser)
    //

    private static readonly DISCLAIMER_SKIP_KEY = 'skipDisclaimer'

    public static getSkipDisclaimer(): boolean {
        return  this.getLocalStorageItem(this.DISCLAIMER_SKIP_KEY) != null
    }

    public static setSkipDisclaimer(newValue: boolean|null): void {
        this.setLocalStorageItem(this.DISCLAIMER_SKIP_KEY, newValue ? "true" : null)
    }

    //
    // contract state table page size
    //

    private static readonly CONTRACT_STATE_TABLE_PAGE_SIZE_KEY = 'statePageSize'

    public static getStateTablePageSize(): number | null {
        const size = this.getLocalStorageItem(this.CONTRACT_STATE_TABLE_PAGE_SIZE_KEY)
        const result = size ? Number(size) : null
        console.log("getStateTablePageSize: " + result)
        return result
    }

    public static setStateTablePageSize(newValue: number | null ): void {
        this.setLocalStorageItem(this.CONTRACT_STATE_TABLE_PAGE_SIZE_KEY, newValue ? newValue?.toString() : null)
    }

    //
    // Private
    //

    private static getLocalStorageItem(keySuffix: string): string|null {
        let result: string|null
        try {
            result = localStorage.getItem(AppStorage.VERSION + "/" + keySuffix)
        } catch {
            result = null
        }
        return result
    }

    private static setLocalStorageItem(keySuffix: string, value: string|null) {
        const key = AppStorage.VERSION + "/" + keySuffix
        try {
            if (value != null) {
                localStorage.setItem(key, value);
            } else {
                localStorage.removeItem(key);
            }
        } catch {
            // Ignored
        }
    }
}
