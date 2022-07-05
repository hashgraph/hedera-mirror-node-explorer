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
import {HashConnectContext} from "@/utils/HashConnectManager";

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
    // hashconnect-priv-key
    //

    private static readonly HASH_CONNECT_PRIV_KEY_KEY = "hashconnect/priv-key"

    public static getHashConnectPrivKey(): string | null {
        return this.getLocalStorageItem(this.HASH_CONNECT_PRIV_KEY_KEY)
    }

    public static setHashConnectPrivKey(newValue: string|null): void {
        this.setLocalStorageItem(this.HASH_CONNECT_PRIV_KEY_KEY, newValue)
    }


    //
    // hashconnect-context
    //

    public static getHashConnectContext(network: string): HashConnectContext | null {
        const key = "hashconnect/" + network + "/context"
        return this.getJsonValue(key) as HashConnectContext | null
    }

    public static setHashConnectContext(newValue: HashConnectContext|null, network: string): void {
        const key = "hashconnect/" + network + "/context"
        this.setJsonValue(newValue, key)
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

    private static getJsonValue(keySuffix: string): unknown | null {
        let result: unknown|null
        const jsonText = this.getLocalStorageItem(keySuffix)
        if (jsonText != null) {
            try {
                result = JSON.parse(jsonText)
            } catch {
                console.log("Ignored invalid JSON text from " + keySuffix)
                result = null
            }
        } else {
            result = null;
        }
        return result
    }

    private static setJsonValue(newValue: unknown | null, keySuffix: string) {
        const item = newValue != null ? JSON.stringify(newValue) : null
        this.setLocalStorageItem(keySuffix, item)
    }
}
