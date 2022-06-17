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

    private static readonly DEFAULT_NETWORK = 'testnet'
    private readonly defaultEntry: NetworkEntry

    private readonly entries: NetworkEntry[] = [
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
        this.defaultEntry = this.lookup(NetworkRegistry.DEFAULT_NETWORK) ?? this.entries[0]

        if (process.env.VUE_APP_LOCAL_MIRROR_NODE_URL) {
            this.entries.push(new NetworkEntry(
                'localnet',
                process.env.VUE_APP_LOCAL_MIRROR_NODE_MENU_NAME ?? "LOCALNET",
                process.env.VUE_APP_LOCAL_MIRROR_NODE_URL
            ))
        }
    }

    public getEntries(): Array<NetworkEntry> {
        return this.entries
    }

    public getDefaultEntry(): NetworkEntry {
        return this.defaultEntry
    }

    public lookup(name: string): NetworkEntry | null {
        return this.entries.find(element => element.name === name) ?? null
    }
}

export const networkRegistry = new NetworkRegistry()
