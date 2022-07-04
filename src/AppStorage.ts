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


    private static readonly HASH_CONNECT_PRIV_KEY_KEY = "hashconnect-priv-key"

    public static getHashConnectPrivKey(): string | null {
        let result: string|null
        try {
            result = localStorage.getItem(AppStorage.HASH_CONNECT_PRIV_KEY_KEY)
        } catch {
            // Navigator is setup to block all cookies => no key
            result = null
        }
        return result
    }

    public static setHashConnectPrivKey(newValue: string|null): void {
        try {
            if (newValue != null) {
                localStorage.setItem(AppStorage.HASH_CONNECT_PRIV_KEY_KEY, newValue);
            } else {
                localStorage.removeItem(AppStorage.HASH_CONNECT_PRIV_KEY_KEY)
            }
        } catch {
            // Navigator is setup to block all cookies => we forget key
        }
    }


    private static readonly HASH_CONNECT_CONNECTION_CONTEXT = "hashconnect-context-"

    public static getHashConnectContext(network: string): HashConnectContext | null {
        const key = AppStorage.HASH_CONNECT_CONNECTION_CONTEXT + network
        return this.getJsonValue(key) as HashConnectContext | null
    }

    public static setHashConnectContext(newValue: HashConnectContext|null, network: string): void {
        const key = AppStorage.HASH_CONNECT_CONNECTION_CONTEXT + network
        this.setJsonValue(newValue, key)
    }


    //
    // Private
    //

    private static getJsonValue(key: string): unknown | null {
        let result: unknown|null
        try {
            const jsonText = localStorage.getItem(key)
            if (jsonText != null) {
                try {
                    result = JSON.parse(jsonText)
                } catch {
                    console.log("Ignored invalid JSON text from " + key)
                    result = null
                }
            } else {
                result = null;
            }
        } catch {
            // Navigator is setup to block all cookies => no id
            result = null
        }
        return result
    }

    private static setJsonValue(newValue: unknown | null, key: string) {
        try {
            if (newValue != null) {
                const jsonText = JSON.stringify(newValue);
                localStorage.setItem(key, jsonText);
            } else {
                localStorage.removeItem(key)
            }
        } catch {
            // Navigator is setup to block all cookies => we forget id
        }
    }
}
