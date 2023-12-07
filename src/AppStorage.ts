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
    // contract logs table page size
    //

    private static readonly CONTRACT_LOGS_TABLE_PAGE_SIZE_KEY = 'logsPageSize'

    public static getLogsTablePageSize(): number | null {
        const size = this.getLocalStorageItem(this.CONTRACT_LOGS_TABLE_PAGE_SIZE_KEY)
        return size ? Number(size) : null
    }

    public static setLogsTablePageSize(newValue: number | null ): void {
        this.setLocalStorageItem(this.CONTRACT_LOGS_TABLE_PAGE_SIZE_KEY, newValue ? newValue?.toString() : null)
    }

    //
    // contract states table page size
    //

    private static readonly CONTRACT_STATES_TABLE_PAGE_SIZE_KEY = 'statesPageSize'

    public static getStatesTablePageSize(): number | null {
        const size = this.getLocalStorageItem(this.CONTRACT_STATES_TABLE_PAGE_SIZE_KEY)
        return size ? Number(size) : null
    }

    public static setStatesTablePageSize(newValue: number | null ): void {
        this.setLocalStorageItem(this.CONTRACT_STATES_TABLE_PAGE_SIZE_KEY, newValue ? newValue?.toString() : null)
    }

    //
    // cookiePolicy
    //

    private static readonly COOKIE_POLICY_NAME = 'cookie_policy'
    private static readonly COOKIE_POLICY_ACCEPT = 'accept'
    private static readonly COOKIE_POLICY_REJECT = 'reject'
    private static readonly COOKIE_POLICY_VALIDITY = 365 // days

    public static getAcceptCookiePolicy(): boolean|null {
        const policy = AppStorage.readCookie(AppStorage.COOKIE_POLICY_NAME)
        return policy != null ? policy === AppStorage.COOKIE_POLICY_ACCEPT : null
    }

    public static setAcceptCookiePolicy(accept: boolean): void {
        const policy = accept ? AppStorage.COOKIE_POLICY_ACCEPT : AppStorage.COOKIE_POLICY_REJECT
        AppStorage.createCookie(AppStorage.COOKIE_POLICY_NAME, policy, AppStorage.COOKIE_POLICY_VALIDITY)
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

    //
    // cookies
    // from routines provided at https://www.quirksmode.org/js/cookies.html
    //

    private static createCookie(name: string, value: string, days:number): void {
        let expires
        if (days) {
            let date = new Date()
            date.setTime(date.getTime() + (days*24*60*60*1000))
            expires = `; expires=${date.toUTCString()}`
        } else {
            expires = ""
        }
        document.cookie = `${name}=${value}${expires}; path=/`
    }

    private static readCookie(name: string): string|null {
        let result = null
        const nameEQ = name + "="
        const ca = document.cookie.split(';')
        for (let i= 0; i < ca.length; i++) {
            let c = ca[i]
            while (c.charAt(0)==' ') {
                c = c.substring(1, c.length)
            }
            if (c.indexOf(nameEQ) == 0) {
                result = c.substring(nameEQ.length, c.length)
                break
            }
        }
        return result
    }
}
