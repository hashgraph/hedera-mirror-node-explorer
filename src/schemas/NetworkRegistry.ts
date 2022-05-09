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

import axios from "axios";

export class NetworkEntry {

    public readonly name: string
    public readonly displayName: string
    public readonly url: string

    constructor(name: string, displayName: string, url: string) {
        this.name = name
        this.displayName = displayName
        this.url = url
    }
}

export class NetworkRegistry {

    public static LAST_USED_NETWORK_KEY = 'network'
    public static DEFAULT_NETWORK = 'testnet'
    private readonly defaultUrl

    private readonly entries = [
        {
            name: 'mainnet',
            displayName: 'MAINNET',
            url: "https://mainnet-public.mirrornode.hedera.com/"
        },
        {
            name: 'testnet',
            displayName: 'TESTNET',
            url: "https://testnet.mirrornode.hedera.com/"
        },
        {
            name: 'previewnet',
            displayName: 'PREVIEWNET',
            url: "https://previewnet.mirrornode.hedera.com/"
        }
    ]

    constructor() {
        this.defaultUrl = this.lookup(NetworkRegistry.DEFAULT_NETWORK)?.url
    }

    public getEntries(): Array<NetworkEntry> {
        return this.entries
    }

    public lookup(name: string): NetworkEntry | null {
        return this.entries.find(element => element.name === name) as NetworkEntry | null
    }

    public getLastUsedNetwork(): string {
        return localStorage.getItem(NetworkRegistry.LAST_USED_NETWORK_KEY) ?? NetworkRegistry.DEFAULT_NETWORK
    }

    public useNetwork(network: string): void {
        localStorage.setItem(NetworkRegistry.LAST_USED_NETWORK_KEY, network);
        axios.defaults.baseURL = this.lookup(network)?.url ?? this.defaultUrl
    }

    private addEntry(name: string, displayName: string, url: string): void {
        this.entries.push(new NetworkEntry(name, displayName, url))
    }
}

export const networkRegistry = new NetworkRegistry()
